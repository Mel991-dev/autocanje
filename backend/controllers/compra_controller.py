# backend/controllers/compra_controller.py
from flask import request, jsonify
from models.compra_model import (
    crear_compra,
    crear_detalle_compra,
    crear_pago,
    actualizar_stock_producto,
    actualizar_estado_compra,
    obtener_compra_completa,
    obtener_metodos_pago,
    crear_envio
)
from models.carrito_model import (
    obtener_carrito_usuario,
    obtener_totales_carrito,
    vaciar_carrito
)
from utils.auth_middleware import token_requerido


@token_requerido
def procesar_compra(usuario_id):
    """
    Procesa una compra completa desde el carrito
    CA-4.5.1, CA-4.5.2, CA-4.5.3, CA-4.5.4
    
    Body: {
        "fk_metodo_pago": 1,
        "direccion_entrega": "Calle 123 #45-67"
    }
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json() or {}
        
        fk_metodo_pago = data.get('fk_metodo_pago')
        direccion_entrega = data.get('direccion_entrega')
        
        # Validaciones
        if not fk_metodo_pago:
            return jsonify({
                'success': False,
                'error': 'Método de pago requerido'
            }), 400
        
        if not direccion_entrega:
            return jsonify({
                'success': False,
                'error': 'Dirección de entrega requerida'
            }), 400
        
        # Obtener carrito y totales
        carrito = obtener_carrito_usuario(usuario_id)
        
        if not carrito or len(carrito) == 0:
            return jsonify({
                'success': False,
                'error': 'El carrito está vacío'
            }), 400
        
        totales = obtener_totales_carrito(usuario_id)
        
        # Verificar stock disponible antes de procesar
        for item in carrito:
            if item['stock'] < item['cantidad']:
                return jsonify({
                    'success': False,
                    'error': f'Stock insuficiente para {item["nombre_producto"]}'
                }), 400
        
        # 1. Crear la compra (CA-4.5.1)
        id_compra = crear_compra(
            fk_comprador=usuario_id,
            subtotal=totales['subtotal'],
            descuento_aplicado=totales['descuento_premium'],
            total=totales['total'],
            compra_premium=totales['es_premium']
        )
        
        if not id_compra:
            return jsonify({
                'success': False,
                'error': 'Error al crear la compra'
            }), 500
        
        # 2. Crear detalles de compra y actualizar stock (CA-4.5.2, CA-4.5.4)
        for item in carrito:
            # Crear detalle
            detalle_creado = crear_detalle_compra(
                fk_compra=id_compra,
                fk_producto=item['fk_producto'],
                cantidad=item['cantidad'],
                precio_unitario=item['precio']
            )
            
            if not detalle_creado:
                # Rollback: cambiar estado de compra a fallido
                actualizar_estado_compra(id_compra, 'fallido')
                return jsonify({
                    'success': False,
                    'error': 'Error al procesar el detalle de compra'
                }), 500
            
            # Actualizar stock (CA-4.5.4)
            stock_actualizado = actualizar_stock_producto(
                fk_producto=item['fk_producto'],
                cantidad=item['cantidad']
            )
            
            if not stock_actualizado:
                actualizar_estado_compra(id_compra, 'fallido')
                return jsonify({
                    'success': False,
                    'error': f'Error al actualizar stock de {item["nombre_producto"]}'
                }), 500
        
        # 3. Registrar pago (CA-4.5.1)
        transaccion_id = f"TXN-{id_compra}-{int(datetime.now().timestamp())}"
        
        pago_creado = crear_pago(
            fk_compra=id_compra,
            fk_metodo_pago=fk_metodo_pago,
            monto=totales['total'],
            transaccion_id=transaccion_id
        )
        
        if not pago_creado:
            actualizar_estado_compra(id_compra, 'fallido')
            return jsonify({
                'success': False,
                'error': 'Error al procesar el pago'
            }), 500
        
        # 4. Crear envío
        dias_envio = 2 if totales['es_premium'] else 5
        
        envio_creado = crear_envio(
            fk_compra=id_compra,
            direccion_entrega=direccion_entrega,
            es_prioritario=totales['es_premium'],
            dias_estimados=dias_envio
        )
        
        if not envio_creado:
            print(f"Advertencia: No se pudo crear el envío para compra {id_compra}")
        
        # 5. Actualizar estado de compra a completado
        actualizar_estado_compra(id_compra, 'completado')
        
        # 6. Vaciar carrito
        vaciar_carrito(usuario_id)
        
        # 7. Obtener compra completa para respuesta (CA-4.5.2)
        compra_completa = obtener_compra_completa(id_compra)
        
        # CA-4.5.3: Confirmación de compra (aquí podrías enviar email)
        # TODO: Implementar envío de correo electrónico
        
        return jsonify({
            'success': True,
            'message': 'Compra procesada exitosamente',
            'id_compra': id_compra,
            'transaccion_id': transaccion_id,
            'compra': compra_completa
        }), 200
        
    except Exception as e:
        print(f"Error al procesar compra: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Error al procesar la compra'
        }), 500


@token_requerido
def obtener_comprobante(usuario_id, id_compra):
    """
    Obtiene el comprobante de una compra
    CA-4.5.2: Genera el comprobante
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        compra = obtener_compra_completa(id_compra)
        
        if not compra:
            return jsonify({
                'success': False,
                'error': 'Compra no encontrada'
            }), 404
        
        # Verificar que la compra pertenece al usuario
        if compra['fk_comprador'] != usuario_id:
            return jsonify({
                'success': False,
                'error': 'No tienes permiso para ver este comprobante'
            }), 403
        
        return jsonify({
            'success': True,
            'compra': compra
        }), 200
        
    except Exception as e:
        print(f"Error al obtener comprobante: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener el comprobante'
        }), 500


def obtener_metodos_pago_controller():
    """
    Obtiene los métodos de pago disponibles
    CA-4.5.1: Lista métodos de pago
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        metodos = obtener_metodos_pago()
        
        return jsonify({
            'success': True,
            'metodos_pago': metodos
        }), 200
        
    except Exception as e:
        print(f"Error al obtener métodos de pago: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener métodos de pago'
        }), 500


from datetime import datetime