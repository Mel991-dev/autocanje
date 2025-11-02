# backend/controllers/valoracion_controller.py
from flask import request, jsonify
from models.valoracion_model import (
    crear_valoracion,
    obtener_valoraciones_producto,
    verificar_puede_valorar,
    obtener_valoracion_usuario
)
from utils.auth_middleware import token_requerido


@token_requerido
def crear_valoracion_controller(usuario_id):
    """
    Crea una nueva valoración para un producto
    CA-6.1.1: Solo los compradores de un producto pueden calificarlo
    CA-6.1.2: Permite dejar calificación (1-5 estrellas) y comentario
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json() or {}
        
        fk_producto = data.get('fk_producto')
        calificacion = data.get('calificacion')
        comentario = data.get('comentario', '').strip()
        
        # Validaciones
        if not fk_producto:
            return jsonify({
                'success': False,
                'error': 'El ID del producto es requerido'
            }), 400
        
        if not calificacion or calificacion < 1 or calificacion > 5:
            return jsonify({
                'success': False,
                'error': 'La calificación debe ser entre 1 y 5 estrellas'
            }), 400
        
        if not comentario or len(comentario) < 10:
            return jsonify({
                'success': False,
                'error': 'El comentario debe tener al menos 10 caracteres'
            }), 400
        
        if len(comentario) > 500:
            return jsonify({
                'success': False,
                'error': 'El comentario no puede exceder 500 caracteres'
            }), 400
        
        # CA-6.1.1: Verificar que el usuario compró el producto
        permisos = verificar_puede_valorar(usuario_id, fk_producto)
        
        if not permisos['puede_valorar']:
            if permisos['ya_valoro']:
                return jsonify({
                    'success': False,
                    'error': 'Ya has valorado este producto anteriormente'
                }), 400
            else:
                return jsonify({
                    'success': False,
                    'error': 'Solo puedes valorar productos que hayas comprado'
                }), 403
        
        # Obtener la compra más reciente del usuario para este producto
        fk_compra = permisos['compras_validas'][0]['id_compra']
        
        # Crear valoración
        id_valoracion = crear_valoracion(
            fk_usuario=usuario_id,
            fk_producto=fk_producto,
            fk_compra=fk_compra,
            calificacion=calificacion,
            comentario=comentario
        )
        
        if not id_valoracion:
            return jsonify({
                'success': False,
                'error': 'Error al crear la valoración'
            }), 500
        
        # Obtener valoraciones actualizadas del producto
        valoraciones = obtener_valoraciones_producto(fk_producto)
        
        return jsonify({
            'success': True,
            'message': 'Valoración creada con éxito',
            'id_valoracion': id_valoracion,
            'valoraciones': valoraciones
        }), 201
        
    except Exception as e:
        print(f"Error al crear valoración: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Error al crear valoración: {str(e)}'
        }), 500


def obtener_valoraciones_controller(id_producto):
    """
    Obtiene las valoraciones de un producto (público)
    CA-6.1.4: Los comentarios deben ser visibles para otros usuarios
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        limite = int(request.args.get('limite', 10))
        
        valoraciones = obtener_valoraciones_producto(id_producto, limite)
        
        return jsonify({
            'success': True,
            'valoraciones': valoraciones,
            'total': len(valoraciones)
        }), 200
        
    except Exception as e:
        print(f"Error al obtener valoraciones: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener valoraciones'
        }), 500


@token_requerido
def verificar_permisos_valoracion_controller(usuario_id, id_producto):
    """
    Verifica si el usuario puede valorar un producto
    CA-6.1.1: Solo los compradores pueden calificar
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        permisos = verificar_puede_valorar(usuario_id, id_producto)
        
        # Obtener valoración existente si ya valoró
        valoracion_existente = None
        if permisos['ya_valoro']:
            valoracion_existente = obtener_valoracion_usuario(usuario_id, id_producto)
        
        return jsonify({
            'success': True,
            'puede_valorar': permisos['puede_valorar'],
            'ya_valoro': permisos['ya_valoro'],
            'compras_realizadas': len(permisos['compras_validas']),
            'valoracion_existente': valoracion_existente
        }), 200
        
    except Exception as e:
        print(f"Error al verificar permisos: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al verificar permisos'
        }), 500