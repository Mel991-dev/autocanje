# backend/controllers/carrito_controller.py
from flask import request, jsonify
from models.carrito_model import (
    agregar_al_carrito,
    obtener_carrito_usuario,
    actualizar_cantidad_carrito,
    eliminar_item_carrito,
    vaciar_carrito,
    obtener_totales_carrito,
    verificar_disponibilidad_carrito
)
from utils.auth_middleware import token_requerido


@token_requerido
def agregar_producto_carrito(usuario_id):
    """
    Agrega un producto al carrito
    CA-4.4.1: Añadir productos al carrito
    
    Body: {
        "fk_producto": 1,
        "cantidad": 2
    }
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json() or {}
        
        fk_producto = data.get('fk_producto')
        cantidad = data.get('cantidad', 1)
        
        # Validaciones
        if not fk_producto:
            return jsonify({
                'success': False,
                'error': 'El ID del producto es requerido'
            }), 400
        
        if cantidad < 1:
            return jsonify({
                'success': False,
                'error': 'La cantidad debe ser al menos 1'
            }), 400
        
        # Agregar al carrito
        id_carrito = agregar_al_carrito(usuario_id, fk_producto, cantidad)
        
        if not id_carrito:
            return jsonify({
                'success': False,
                'error': 'Error al agregar producto al carrito'
            }), 500
        
        # Obtener carrito actualizado
        carrito = obtener_carrito_usuario(usuario_id)
        totales = obtener_totales_carrito(usuario_id)
        
        return jsonify({
            'success': True,
            'message': 'Producto agregado al carrito',
            'id_carrito': id_carrito,
            'carrito': carrito,
            'totales': totales
        }), 200
        
    except Exception as e:
        print(f"Error al agregar al carrito: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Error al agregar al carrito: {str(e)}'
        }), 500


@token_requerido
def obtener_carrito(usuario_id):
    """
    Obtiene el carrito completo del usuario
    CA-4.4.5: Persistencia de datos
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Obtener items del carrito
        carrito = obtener_carrito_usuario(usuario_id)
        
        # Obtener totales
        totales = obtener_totales_carrito(usuario_id)
        
        # Verificar disponibilidad
        items_problematicos = verificar_disponibilidad_carrito(usuario_id)
        
        return jsonify({
            'success': True,
            'carrito': carrito,
            'totales': totales,
            'items_problematicos': items_problematicos
        }), 200
        
    except Exception as e:
        print(f"Error al obtener carrito: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener el carrito'
        }), 500


@token_requerido
def actualizar_cantidad(usuario_id, id_carrito):
    """
    Actualiza la cantidad de un item del carrito
    CA-4.4.2: Modificar cantidades
    CA-4.4.3: Recalcular totales
    
    Body: {
        "cantidad": 3
    }
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json() or {}
        nueva_cantidad = data.get('cantidad')
        
        if nueva_cantidad is None:
            return jsonify({
                'success': False,
                'error': 'La cantidad es requerida'
            }), 400
        
        # Actualizar cantidad
        resultado = actualizar_cantidad_carrito(id_carrito, nueva_cantidad, usuario_id)
        
        if not resultado['success']:
            return jsonify(resultado), 400
        
        # Obtener carrito y totales actualizados
        carrito = obtener_carrito_usuario(usuario_id)
        totales = obtener_totales_carrito(usuario_id)
        
        return jsonify({
            'success': True,
            'message': 'Cantidad actualizada correctamente',
            'carrito': carrito,
            'totales': totales
        }), 200
        
    except Exception as e:
        print(f"Error al actualizar cantidad: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al actualizar la cantidad'
        }), 500


@token_requerido
def eliminar_item(usuario_id, id_carrito):
    """
    Elimina un item del carrito
    CA-4.4.4: Eliminar productos del carrito
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Eliminar item
        eliminado = eliminar_item_carrito(id_carrito, usuario_id)
        
        if not eliminado:
            return jsonify({
                'success': False,
                'error': 'Item no encontrado o no tienes permiso para eliminarlo'
            }), 404
        
        # Obtener carrito y totales actualizados
        carrito = obtener_carrito_usuario(usuario_id)
        totales = obtener_totales_carrito(usuario_id)
        
        return jsonify({
            'success': True,
            'message': 'Producto eliminado del carrito',
            'carrito': carrito,
            'totales': totales
        }), 200
        
    except Exception as e:
        print(f"Error al eliminar item: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al eliminar el producto'
        }), 500


@token_requerido
def vaciar_carrito_controller(usuario_id):
    """
    Vacía completamente el carrito del usuario
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        items_eliminados = vaciar_carrito(usuario_id)
        
        return jsonify({
            'success': True,
            'message': f'{items_eliminados} producto(s) eliminado(s) del carrito',
            'items_eliminados': items_eliminados
        }), 200
        
    except Exception as e:
        print(f"Error al vaciar carrito: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al vaciar el carrito'
        }), 500


@token_requerido
def obtener_totales(usuario_id):
    """
    Obtiene solo los totales del carrito
    CA-4.4.3: Recalcular totales
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        totales = obtener_totales_carrito(usuario_id)
        
        return jsonify({
            'success': True,
            'totales': totales
        }), 200
        
    except Exception as e:
        print(f"Error al obtener totales: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al calcular totales'
        }), 500