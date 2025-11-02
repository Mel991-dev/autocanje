# backend/routes/valoracion_routes.py
from flask import Blueprint
from controllers.valoracion_controller import (
    crear_valoracion_controller,
    obtener_valoraciones_controller,
    verificar_permisos_valoracion_controller
)

valoracion_bp = Blueprint("valoracion_bp", __name__, url_prefix="/api/valoraciones")

@valoracion_bp.route("/", methods=["POST", "OPTIONS"])
def crear_valoracion_route():
    return crear_valoracion_controller()

@valoracion_bp.route("/producto/<int:id_producto>", methods=["GET", "OPTIONS"])
def obtener_valoraciones_route(id_producto):
    return obtener_valoraciones_controller(id_producto)

@valoracion_bp.route("/permisos/<int:id_producto>", methods=["GET", "OPTIONS"])
def verificar_permisos_route(id_producto):
    return verificar_permisos_valoracion_controller(id_producto)