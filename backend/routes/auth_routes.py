from flask import Blueprint
from controllers.auth_controller import registrar_usuario, login_usuario
from controllers.auth_controller import (
    registrar_usuario, 
    login_usuario, 
    obtener_perfil,
    actualizar_perfil,
    cambiar_contrasena
)

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register_route():
    return registrar_usuario()

@auth_bp.route("/login", methods=["POST"])
def login_route():
    return login_usuario()

@auth_bp.route("/perfil", methods=["GET", "OPTIONS"])
def perfil_route():
    return obtener_perfil()

@auth_bp.route("/perfil", methods=["PUT", "OPTIONS"])
def actualizar_perfil_route():
    return actualizar_perfil()

@auth_bp.route("/cambiar-contrasena", methods=["POST", "OPTIONS"])
def cambiar_contrasena_route():
    return cambiar_contrasena()
