# backend/controllers/membresia_controller.py
from flask import request, jsonify
from models.membresia_model import (
    obtener_planes_disponibles,
    crear_membresia_usuario,
    obtener_membresia_activa,
    calcular_descuento_premium,
    crear_reserva,
    obtener_reservas_usuario,
    cancelar_reserva,
    calcular_tiempo_entrega,
    obtener_estados_envio,
    obtener_historial_envio,
    actualizar_estado_envio,
    obtener_envios_usuario
)
from utils.auth_middleware import token_requerido

# ✨ NUEVO: Importar middlewares premium
from utils.premium_middleware import (
    premium_requerido,
    premium_opcional,
    reservas_requerido,
    descuento_disponible,
    envio_prioritario_disponible,
    log_uso_beneficio
)

# ============================================
# ENDPOINTS: PLANES Y MEMBRESÍAS (HU-5.1)
# ============================================

def obtener_planes_controller():
    """
    CA-5.1.1: Muestra los planes disponibles con precios y beneficios
    GET /api/membresias/planes
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        planes = obtener_planes_disponibles()
        
        return jsonify({
            'success': True,
            'planes': planes
        }), 200
        
    except Exception as e:
        print(f"Error al obtener planes: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener planes'
        }), 500


@token_requerido
def comprar_membresia_controller(usuario_id):
    """
    CA-5.1.2: Comprar o renovar membresía
    POST /api/membresias/comprar
    Body: {
        "fk_plan": 1,
        "renovacion_auto": true
    }
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json() or {}
        
        fk_plan = data.get('fk_plan')
        renovacion_auto = data.get('renovacion_auto', True)
        
        if not fk_plan:
            return jsonify({
                'success': False,
                'error': 'El ID del plan es requerido'
            }), 400
        
        # Crear/renovar membresía
        id_membresia = crear_membresia_usuario(usuario_id, fk_plan, renovacion_auto)
        
        if not id_membresia:
            return jsonify({
                'success': False,
                'error': 'Error al crear la membresía'
            }), 500
        
        # Obtener membresía creada
        membresia = obtener_membresia_activa(usuario_id)
        
        return jsonify({
            'success': True,
            'message': 'Membresía activada con éxito',
            'id_membresia': id_membresia,
            'membresia': membresia
        }), 200
        
    except Exception as e:
        print(f"Error al comprar membresía: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Error al procesar la compra'
        }), 500


@token_requerido
def obtener_mi_membresia_controller(usuario_id):
    """
    CA-5.1.3: Obtiene la membresía activa con fechas de inicio y vencimiento
    CA-5.1.4: Valida que la membresía esté activa
    GET /api/membresias/mi-membresia
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        membresia = obtener_membresia_activa(usuario_id)
        
        if not membresia:
            return jsonify({
                'success': True,
                'es_premium': False,
                'membresia': None,
                'message': 'No tienes una membresía activa'
            }), 200
        
        return jsonify({
            'success': True,
            'es_premium': True,
            'membresia': {
                'id_membresia': membresia['id_membresia'],
                'nombre_plan': membresia['nombre_plan'],
                'descripcion': membresia['desc_plan'],
                'precio': membresia['precio_plan'],
                'fecha_inicio': membresia['fecha_inicio'].isoformat() if membresia['fecha_inicio'] else None,
                'fecha_fin': membresia['fecha_fin'].isoformat() if membresia['fecha_fin'] else None,
                'dias_restantes': membresia['dias_restantes'],
                'renovacion_auto': membresia['renovacion_auto'],
                'beneficios': {
                    'descuento_porcentaje': membresia['porc_descuento'],
                    'dias_envio': membresia['dias_envio_red'],
                    'permite_reservas': membresia['permite_reservas']
                },
                'activa': membresia['es_valida'] == 1
            }
        }), 200
        
    except Exception as e:
        print(f"Error al obtener membresía: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener información de membresía'
        }), 500


# ============================================
# ENDPOINTS: BENEFICIOS PREMIUM (HU-5.2)
# ============================================

@token_requerido
@premium_opcional
def calcular_descuento_controller(usuario_id):
    """
    CA-5.2.1: Calcula descuento automático para usuarios premium
    CA-5.2.4: Muestra descuentos y beneficios en la interfaz
    POST /api/membresias/calcular-descuento
    Body: {
        "subtotal": 150000
    }
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json() or {}
        subtotal = data.get('subtotal', 0)
        
        if not subtotal or subtotal <= 0:
            return jsonify({
                'success': False,
                'error': 'El subtotal debe ser mayor a cero'
            }), 400
        
        resultado = calcular_descuento_premium(usuario_id, subtotal)
        
        return jsonify({
            'success': True,
            'resultado': resultado
        }), 200
        
    except Exception as e:
        print(f"Error al calcular descuento: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al calcular descuento'
        }), 500


# ============================================
# ENDPOINTS CON MIDDLEWARE PREMIUM APLICADO
# ============================================

# ===== RESERVAS (Requiere Premium con beneficio de reservas) =====

@token_requerido
@premium_requerido  # ✨ AGREGADO
@reservas_requerido  # ✨ AGREGADO - Valida beneficio específico
def crear_reserva_controller(usuario_id):
    """
    CA-5.3.1: Solo usuarios premium pueden realizar reservas
    CA-5.1.4: Validación de membresía activa
    POST /api/membresias/reservas
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json() or {}
        
        fk_producto = data.get('fk_producto')
        cantidad = data.get('cantidad', 1)
        
        if not fk_producto:
            return jsonify({
                'success': False,
                'error': 'El ID del producto es requerido'
            }), 400
        
        if cantidad <= 0:
            return jsonify({
                'success': False,
                'error': 'La cantidad debe ser mayor a cero'
            }), 400
        
        resultado = crear_reserva(usuario_id, fk_producto, cantidad)
        
        if not resultado['success']:
            return jsonify(resultado), 400
        
        # ✨ NUEVO: Registrar uso del beneficio
        log_uso_beneficio(usuario_id, 'reserva', {
            'producto_id': fk_producto,
            'cantidad': cantidad
        })
        
        return jsonify({
            'success': True,
            'message': 'Reserva creada exitosamente',
            'reserva': {
                'id_reserva': resultado['id_reserva'],
                'fecha_expiracion': resultado['fecha_expiracion'],
                'horas_restantes': resultado['horas_restantes']
            }
        }), 201
        
    except Exception as e:
        print(f"Error al crear reserva: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al crear la reserva'
        }), 500


@token_requerido
def obtener_mis_reservas_controller(usuario_id):
    """
    CA-5.3.3: Notifica al usuario cuando una reserva está por expirar
    GET /api/membresias/reservas
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        reservas = obtener_reservas_usuario(usuario_id)
        
        # Formatear reservas para respuesta
        reservas_formateadas = []
        for reserva in reservas:
            reservas_formateadas.append({
                'id_reserva': reserva['id_reserva'],
                'producto': {
                    'id': reserva['fk_producto'],
                    'nombre': reserva['nombre_producto'],
                    'precio': reserva['precio'],
                    'imagen': reserva['imagen_principal']
                },
                'cantidad': reserva['cantidad'],
                'fecha_reserva': reserva['fecha_reserva'].isoformat() if reserva['fecha_reserva'] else None,
                'fecha_expiracion': reserva['fecha_exp'].isoformat() if reserva['fecha_exp'] else None,
                'horas_restantes': reserva['horas_restantes'],
                'expirada': reserva['expirada'] == 1,
                'activa': reserva['activa']
            })
        
        return jsonify({
            'success': True,
            'reservas': reservas_formateadas
        }), 200
        
    except Exception as e:
        print(f"Error al obtener reservas: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener reservas'
        }), 500


@token_requerido
@premium_requerido
def cancelar_reserva_controller(usuario_id, id_reserva):
    """
    CA-5.3.4: Si la reserva vence, el producto vuelve a estar disponible
    DELETE /api/membresias/reservas/<id_reserva>
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        resultado = cancelar_reserva(id_reserva, usuario_id)
        
        if not resultado:
            return jsonify({
                'success': False,
                'error': 'No se pudo cancelar la reserva'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Reserva cancelada exitosamente. El stock ha sido liberado.'
        }), 200
        
    except Exception as e:
        print(f"Error al cancelar reserva: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al cancelar la reserva'
        }), 500


# ============================================
# ENDPOINTS: LÓGICA DE ENVÍO (HU-5.4)
# ============================================

@token_requerido
@envio_prioritario_disponible
def calcular_tiempo_entrega_controller(usuario_id):
    """
    CA-5.4.1: Calcula tiempos de entrega según tipo de membresía
    CA-5.4.2: Usuarios premium tienen menor tiempo de entrega
    GET /api/membresias/tiempo-entrega
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        resultado = calcular_tiempo_entrega(usuario_id)
        
        return jsonify({
            'success': True,
            'tiempo_entrega': resultado
        }), 200
        
    except Exception as e:
        print(f"Error al calcular tiempo de entrega: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al calcular tiempo de entrega'
        }), 500

@premium_opcional
@token_requerido
def obtener_mis_envios_controller(usuario_id):
    """
    CA-5.4.3: El usuario debe poder rastrear el estado de su pedido
    CA-5.4.4: Los datos de envío deben almacenarse en la base de datos para control logístico
    GET /api/membresias/envios
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        envios = obtener_envios_usuario(usuario_id)
        
        # Formatear envíos para respuesta
        envios_formateados = []
        for envio in envios:
            envios_formateados.append({
                'id_envio': envio['id_envio'],
                'numero_orden': envio['numero_orden'],
                'direccion_entrega': envio['direccion_entrega'],
                'fecha_compra': envio['fecha_compra'].isoformat() if envio['fecha_compra'] else None,
                'fecha_estimada': envio['fecha_estimada'].isoformat() if envio['fecha_estimada'] else None,
                'dias_estimados': envio['dias_estimados'],
                'es_prioritario': envio['es_prioritario'],
                'total': envio['total'],
                'estado': {
                    'nombre': envio['estado'],
                    'descripcion': envio['estado_descripcion']
                }
            })
        
        return jsonify({
            'success': True,
            'envios': envios_formateados
        }), 200
        
    except Exception as e:
        print(f"Error al obtener envíos: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener información de envíos'
        }), 500


@token_requerido
def rastrear_envio_controller(usuario_id, id_envio):
    """
    CA-5.4.3: Obtiene el historial completo de un envío para rastreo
    GET /api/membresias/envios/<id_envio>/rastrear
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        envio = obtener_historial_envio(id_envio)
        
        if not envio:
            return jsonify({
                'success': False,
                'error': 'Envío no encontrado'
            }), 404
        
        # Verificar que el envío pertenece al usuario
        # (esto se podría validar mejor en el modelo)
        
        return jsonify({
            'success': True,
            'envio': {
                'id_envio': envio['id_envio'],
                'direccion_entrega': envio['direccion_entrega'],
                'fecha_estimada': envio['fecha_estimada'].isoformat() if envio['fecha_estimada'] else None,
                'es_prioritario': envio['es_prioritario'],
                'dias_estimados': envio['dias_estimados'],
                'estado_actual': {
                    'id': envio['id_estado'],
                    'nombre': envio['estado_nombre'],
                    'descripcion': envio['estado_descripcion']
                },
                'compra': {
                    'fecha': envio['fecha_compra'].isoformat() if envio['fecha_compra'] else None,
                    'total': envio['total']
                },
                'contacto': {
                    'nombre': f"{envio['primer_nombre']} {envio['primer_apellido']}",
                    'telefono': envio['telefono'],
                    'email': envio['email']
                }
            }
        }), 200
        
    except Exception as e:
        print(f"Error al rastrear envío: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al rastrear el envío'
        }), 500


def obtener_estados_envio_controller():
    """
    Obtiene todos los estados de envío disponibles
    GET /api/membresias/estados-envio
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        estados = obtener_estados_envio()
        
        return jsonify({
            'success': True,
            'estados': estados
        }), 200
        
    except Exception as e:
        print(f"Error al obtener estados: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener estados de envío'
        }), 500


# ============================================
# ENDPOINT ADMINISTRATIVO
# ============================================

@token_requerido
def actualizar_estado_envio_controller(usuario_id, id_envio):
    """
    Actualiza el estado de un envío (solo para administradores)
    PUT /api/membresias/envios/<id_envio>/estado
    Body: {
        "nuevo_estado_id": 3
    }
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Aquí deberías validar que el usuario sea administrador
        # Para simplificar, asumimos que tiene permisos
        
        data = request.get_json() or {}
        nuevo_estado_id = data.get('nuevo_estado_id')
        
        if not nuevo_estado_id:
            return jsonify({
                'success': False,
                'error': 'El ID del nuevo estado es requerido'
            }), 400
        
        resultado = actualizar_estado_envio(id_envio, nuevo_estado_id)
        
        if not resultado:
            return jsonify({
                'success': False,
                'error': 'No se pudo actualizar el estado del envío'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Estado de envío actualizado exitosamente'
        }), 200
        
    except Exception as e:
        print(f"Error al actualizar estado de envío: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al actualizar el estado'
        }), 500