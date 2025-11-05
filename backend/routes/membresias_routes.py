from flask import Blueprint
from controllers import membresiasController

membresias_routes = Blueprint("membresias_routes", __name__)

membresias_routes.route("/api/membresias", methods=["GET"])(membresiasController.get_membresias)
membresias_routes.route("/api/membresias/<int:id_membresia>", methods=["GET"])(membresiasController.get_membresia)
membresias_routes.route("/api/membresias", methods=["POST"])(membresiasController.create_membresia)
membresias_routes.route("/api/membresias/<int:id_membresia>", methods=["PUT"])(membresiasController.update_membresia)
membresias_routes.route("/api/membresias/<int:id_membresia>", methods=["DELETE"])(membresiasController.delete_membresia)
