# backend/routes/compra_routes.py
from flask import Blueprint
from controllers.compra_controller import (
    procesar_compra,
    obtener_comprobante,
    obtener_metodos_pago_controller
)

compra_bp = Blueprint("compra_bp", __name__, url_prefix="/api/compras")

# Procesar compra desde el carrito
@compra_bp.route("/procesar", methods=["POST", "OPTIONS"])
def procesar_compra_route():
    """
    POST /api/compras/procesar
    Body: {
        "fk_metodo_pago": 1,
        "direccion_entrega": "Calle 123"
    }
    """
    return procesar_compra()

# Obtener comprobante de compra
@compra_bp.route("/<int:id_compra>/comprobante", methods=["GET", "OPTIONS"])
def obtener_comprobante_route(id_compra):
    """
    GET /api/compras/123/comprobante
    """
    return obtener_comprobante(id_compra)

# Obtener métodos de pago disponibles
@compra_bp.route("/metodos-pago", methods=["GET", "OPTIONS"])
def obtener_metodos_pago_route():
    """
    GET /api/compras/metodos-pago
    """
    return obtener_metodos_pago_controller()