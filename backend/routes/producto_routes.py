# routes/producto_routes.py
from flask import Blueprint
from controllers.producto_controller import (
    crear_producto_controller,
    obtener_mis_productos,
    actualizar_producto_controller,
    eliminar_producto_controller,
    pausar_producto_controller,
    obtener_categorias_controller,
    obtener_tipos_vehiculo_controller
)

producto_bp = Blueprint("producto_bp", __name__, url_prefix="/api/productos")

# Rutas protegidas (requieren autenticación)
@producto_bp.route("/", methods=["POST", "OPTIONS"])
def crear_producto_route():
    return crear_producto_controller()

@producto_bp.route("/mis-productos", methods=["GET", "OPTIONS"])
def obtener_mis_productos_route():
    return obtener_mis_productos()

@producto_bp.route("/<int:id_producto>", methods=["PUT", "OPTIONS"])
def actualizar_producto_route(id_producto):
    return actualizar_producto_controller(id_producto)

@producto_bp.route("/<int:id_producto>", methods=["DELETE", "OPTIONS"])
def eliminar_producto_route(id_producto):
    return eliminar_producto_controller(id_producto)

@producto_bp.route("/<int:id_producto>/pausar", methods=["PATCH", "OPTIONS"])
def pausar_producto_route(id_producto):
    return pausar_producto_controller(id_producto)

# Rutas públicas
@producto_bp.route("/categorias", methods=["GET"])
def obtener_categorias_route():
    return obtener_categorias_controller()

@producto_bp.route("/tipos-vehiculo", methods=["GET"])
def obtener_tipos_vehiculo_route():
    return obtener_tipos_vehiculo_controller()