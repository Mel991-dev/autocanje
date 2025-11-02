# backend/routes/carrito_routes.py
from flask import Blueprint
from controllers.carrito_controller import (
    agregar_producto_carrito,
    obtener_carrito,
    actualizar_cantidad,
    eliminar_item,
    vaciar_carrito_controller,
    obtener_totales
)

carrito_bp = Blueprint("carrito_bp", __name__, url_prefix="/api/carrito")

# Obtener carrito completo
@carrito_bp.route("/", methods=["GET", "OPTIONS"])
def obtener_carrito_route():
    """
    GET /api/carrito/
    Retorna el carrito completo con items y totales
    """
    return obtener_carrito()

# Agregar producto al carrito
@carrito_bp.route("/agregar", methods=["POST", "OPTIONS"])
def agregar_carrito_route():
    """
    POST /api/carrito/agregar
    Body: {
        "fk_producto": 1,
        "cantidad": 2
    }
    """
    return agregar_producto_carrito()

# Actualizar cantidad de un item
@carrito_bp.route("/<int:id_carrito>/cantidad", methods=["PUT", "OPTIONS"])
def actualizar_cantidad_route(id_carrito):
    """
    PUT /api/carrito/123/cantidad
    Body: {
        "cantidad": 3
    }
    """
    return actualizar_cantidad(id_carrito)

# Eliminar un item del carrito
@carrito_bp.route("/<int:id_carrito>", methods=["DELETE", "OPTIONS"])
def eliminar_item_route(id_carrito):
    """
    DELETE /api/carrito/123
    """
    return eliminar_item(id_carrito)

# Vaciar carrito completo
@carrito_bp.route("/vaciar", methods=["DELETE", "OPTIONS"])
def vaciar_carrito_route():
    """
    DELETE /api/carrito/vaciar
    """
    return vaciar_carrito_controller()

# Obtener solo los totales
@carrito_bp.route("/totales", methods=["GET", "OPTIONS"])
def obtener_totales_route():
    """
    GET /api/carrito/totales
    """
    return obtener_totales()