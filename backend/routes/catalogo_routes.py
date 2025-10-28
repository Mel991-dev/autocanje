# routes/catalogo_routes.py
from flask import Blueprint
from controllers.catalogo_controller import (
    obtener_catalogo_controller,
    obtener_producto_detalle_controller,
    obtener_estadisticas_controller,
    buscar_sugerencias_controller,
    obtener_mas_vendidos_controller,
    obtener_categorias_controller,  # Nueva función
    obtener_tipos_vehiculo_controller  # Nueva función
)

catalogo_bp = Blueprint("catalogo_bp", __name__, url_prefix="/api/catalogo")

# Catálogo principal con filtros
@catalogo_bp.route("/", methods=["GET"])
def obtener_catalogo_route():
    """
    GET /api/catalogo?busqueda=filtro&categoria=1&tipo_vehiculo=2&precio_min=100&precio_max=500&valoracion_min=4&orden=precio_asc
    """
    return obtener_catalogo_controller()

# Detalle de producto
@catalogo_bp.route("/<int:id_producto>", methods=["GET"])
def obtener_producto_detalle_route(id_producto):
    """
    GET /api/catalogo/123
    """
    return obtener_producto_detalle_controller(id_producto)

# Estadísticas para filtros
@catalogo_bp.route("/estadisticas", methods=["GET"])
def obtener_estadisticas_route():
    """
    GET /api/catalogo/estadisticas
    """
    return obtener_estadisticas_controller()

# Sugerencias de búsqueda
@catalogo_bp.route("/sugerencias", methods=["GET"])
def buscar_sugerencias_route():
    """
    GET /api/catalogo/sugerencias?q=filtro&limite=5
    """
    return buscar_sugerencias_controller()

# Productos más vendidos
@catalogo_bp.route("/mas-vendidos", methods=["GET"])
def obtener_mas_vendidos_route():
    """
    GET /api/catalogo/mas-vendidos?limite=10
    """
    return obtener_mas_vendidos_controller()

# Categorías disponibles
@catalogo_bp.route("/productos/categorias", methods=["GET"])
def obtener_categorias_route():
    """
    GET /api/catalogo/productos/categorias
    """
    return obtener_categorias_controller()

# Tipos de vehículo disponibles
@catalogo_bp.route("/productos/tipos-vehiculo", methods=["GET"])
def obtener_tipos_vehiculo_route():
    """
    GET /api/catalogo/productos/tipos-vehiculo
    """
    return obtener_tipos_vehiculo_controller()