from flask import jsonify, request
from models import membresia_model

def get_membresias():
    membresias = membresia_model.get_all_membresias()
    return jsonify(membresias)

def get_membresia(id_membresia):
    membresia = membresia_model.get_membresia_by_id(id_membresia)
    if membresia:
        return jsonify(membresia)
    return jsonify({"error": "Membresía no encontrada"}), 404

def create_membresia():
    data = request.get_json()
    required = ["nombre", "descripcion", "precio", "duracion_meses", "beneficios"]

    if not all(k in data for k in required):
        return jsonify({"error": "Faltan campos obligatorios"}), 400

    membresia_model.create_membresia(
        data["nombre"],
        data["descripcion"],
        data["precio"],
        data["duracion_meses"],
        data["beneficios"]
    )
    return jsonify({"message": "Membresía creada correctamente"}), 201

def update_membresia(id_membresia):
    data = request.get_json()
    membresia = membresia_model.get_membresia_by_id(id_membresia)
    if not membresia:
        return jsonify({"error": "Membresía no encontrada"}), 404

    membresia_model.update_membresia(
        id_membresia,
        data.get("nombre", membresia["nombre"]),
        data.get("descripcion", membresia["descripcion"]),
        data.get("precio", membresia["precio"]),
        data.get("duracion_meses", membresia["duracion_meses"]),
        data.get("beneficios", membresia["beneficios"])
    )
    return jsonify({"message": "Membresía actualizada correctamente"})

def delete_membresia(id_membresia):
    membresia = membresia_model.get_membresia_by_id(id_membresia)
    if not membresia:
        return jsonify({"error": "Membresía no encontrada"}), 404
    membresia_model.delete_membresia(id_membresia)
    return jsonify({"message": "Membresía eliminada correctamente"})
