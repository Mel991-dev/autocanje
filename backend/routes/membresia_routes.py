# backend/routes/membresia_routes.py
from flask import Blueprint
from controllers.membresia_controller import (
    # HU-5.1: Planes y Membresías
    obtener_planes_controller,
    comprar_membresia_controller,
    obtener_mi_membresia_controller,
    
    # HU-5.2: Beneficios Premium
    calcular_descuento_controller,
    
    # HU-5.3: Sistema de Reservas
    crear_reserva_controller,
    obtener_mis_reservas_controller,
    cancelar_reserva_controller,
    
    # HU-5.4: Lógica de Envío
    calcular_tiempo_entrega_controller,
    obtener_mis_envios_controller,
    rastrear_envio_controller,
    obtener_estados_envio_controller,
    actualizar_estado_envio_controller
)

# Crear blueprint para membresías
membresia_bp = Blueprint('membresia', __name__, url_prefix='/api/membresias')

# ============================================
# RUTAS: PLANES Y MEMBRESÍAS (HU-5.1)
# ============================================

@membresia_bp.route('/planes', methods=['GET', 'OPTIONS'])
def obtener_planes():
    """
    GET /api/membresias/planes
    CA-5.1.1: Muestra los planes disponibles con precios y beneficios
    """
    return obtener_planes_controller()


@membresia_bp.route('/comprar', methods=['POST', 'OPTIONS'])
def comprar_membresia():
    """
    POST /api/membresias/comprar
    CA-5.1.2: Comprar o renovar membresía
    Body: {
        "fk_plan": 1,
        "renovacion_auto": true
    }
    """
    return comprar_membresia_controller()


@membresia_bp.route('/mi-membresia', methods=['GET', 'OPTIONS'])
def obtener_mi_membresia():
    """
    GET /api/membresias/mi-membresia
    CA-5.1.3: Obtiene la membresía activa con fechas
    CA-5.1.4: Valida que la membresía esté activa
    """
    return obtener_mi_membresia_controller()


# ============================================
# RUTAS: BENEFICIOS PREMIUM (HU-5.2)
# ============================================

@membresia_bp.route('/calcular-descuento', methods=['POST', 'OPTIONS'])
def calcular_descuento():
    """
    POST /api/membresias/calcular-descuento
    CA-5.2.1: Calcula descuento automático para usuarios premium
    Body: {
        "subtotal": 150000
    }
    """
    return calcular_descuento_controller()


# ============================================
# RUTAS: SISTEMA DE RESERVAS (HU-5.3)
# ============================================

@membresia_bp.route('/reservas', methods=['POST', 'OPTIONS'])
def crear_reserva():
    """
    POST /api/membresias/reservas
    CA-5.3.1: Solo usuarios premium pueden realizar reservas
    CA-5.3.2: Bloquea temporalmente el stock
    CA-5.2.3: Establece fecha de expiración de 72 horas
    Body: {
        "fk_producto": 1,
        "cantidad": 2
    }
    """
    return crear_reserva_controller()


@membresia_bp.route('/reservas', methods=['GET', 'OPTIONS'])
def obtener_mis_reservas():
    """
    GET /api/membresias/reservas
    CA-5.3.3: Obtiene reservas del usuario con información de expiración
    """
    return obtener_mis_reservas_controller()


@membresia_bp.route('/reservas/<int:id_reserva>', methods=['DELETE', 'OPTIONS'])
def cancelar_reserva(id_reserva):
    """
    DELETE /api/membresias/reservas/<id_reserva>
    CA-5.3.4: Cancela reserva y libera stock
    """
    return cancelar_reserva_controller(id_reserva)


# ============================================
# RUTAS: LÓGICA DE ENVÍO (HU-5.4)
# ============================================

@membresia_bp.route('/tiempo-entrega', methods=['GET', 'OPTIONS'])
def calcular_tiempo_entrega():
    """
    GET /api/membresias/tiempo-entrega
    CA-5.4.1: Calcula tiempos de entrega según tipo de membresía
    CA-5.4.2: Usuarios premium tienen menor tiempo de entrega
    """
    return calcular_tiempo_entrega_controller()


@membresia_bp.route('/envios', methods=['GET', 'OPTIONS'])
def obtener_mis_envios():
    """
    GET /api/membresias/envios
    CA-5.4.3: Permite rastrear el estado de los pedidos
    CA-5.4.4: Muestra datos almacenados en BD para control logístico
    """
    return obtener_mis_envios_controller()


@membresia_bp.route('/envios/<int:id_envio>/rastrear', methods=['GET', 'OPTIONS'])
def rastrear_envio(id_envio):
    """
    GET /api/membresias/envios/<id_envio>/rastrear
    CA-5.4.3: Obtiene el historial completo de un envío
    """
    return rastrear_envio_controller(id_envio)


@membresia_bp.route('/estados-envio', methods=['GET', 'OPTIONS'])
def obtener_estados_envio():
    """
    GET /api/membresias/estados-envio
    Obtiene todos los estados de envío disponibles
    """
    return obtener_estados_envio_controller()


@membresia_bp.route('/envios/<int:id_envio>/estado', methods=['PUT', 'OPTIONS'])
def actualizar_estado_envio(id_envio):
    """
    PUT /api/membresias/envios/<id_envio>/estado
    Actualiza el estado de un envío (solo administradores)
    Body: {
        "nuevo_estado_id": 3
    }
    """
    return actualizar_estado_envio_controller(id_envio)