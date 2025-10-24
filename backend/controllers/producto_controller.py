# controllers/producto_controller.py
from flask import request, jsonify
from models.producto_model import (
    crear_producto, obtener_productos_vendedor, obtener_producto_por_id,
    actualizar_producto, eliminar_producto, pausar_producto,
    obtener_categorias, obtener_tipos_vehiculo,
    crear_imagen_producto, obtener_imagenes_producto, eliminar_imagen_producto
)
from utils.auth_middleware import token_requerido
import os
from werkzeug.utils import secure_filename

# Configuración de subida de archivos
UPLOAD_FOLDER = 'uploads/productos'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@token_requerido
def crear_producto_controller(usuario_id):
    """
    Crea un nuevo producto
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json() or {}
        
        # Validaciones
        nombre_producto = data.get('nombre_producto', '').strip()
        fk_categoria = data.get('fk_categoria')
        precio = data.get('precio')
        stock = data.get('stock')
        
        if not nombre_producto:
            return jsonify({
                'success': False,
                'error': 'El nombre del producto es requerido'
            }), 400
        
        if not fk_categoria:
            return jsonify({
                'success': False,
                'error': 'La categoría es requerida'
            }), 400
        
        if precio is None or float(precio) <= 0:
            return jsonify({
                'success': False,
                'error': 'El precio debe ser mayor a cero'
            }), 400
        
        if stock is None or int(stock) < 0:
            return jsonify({
                'success': False,
                'error': 'El stock no puede ser negativo'
            }), 400
        
        # Crear producto
        id_producto = crear_producto(
            fk_vendedor=usuario_id,
            fk_categoria=fk_categoria,
            fk_tipo_vehiculo=data.get('fk_tipo_vehiculo'),
            nombre_producto=nombre_producto,
            descripcion=data.get('descripcion', ''),
            precio=float(precio),
            stock=int(stock),
            pausado=data.get('pausado', False)
        )
        
        if not id_producto:
            return jsonify({
                'success': False,
                'error': 'Error al crear el producto'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Producto creado con éxito',
            'id_producto': id_producto
        }), 201
        
    except Exception as e:
        print(f"Error al crear producto: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Error al crear producto: {str(e)}'
        }), 500


@token_requerido
def obtener_mis_productos(usuario_id):
    """
    Obtiene todos los productos del vendedor autenticado
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        productos = obtener_productos_vendedor(usuario_id)
        
        return jsonify({
            'success': True,
            'productos': productos
        }), 200
        
    except Exception as e:
        print(f"Error al obtener productos: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al obtener productos: {str(e)}'
        }), 500


@token_requerido
def actualizar_producto_controller(usuario_id, id_producto):
    """
    Actualiza un producto existente
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Verificar que el producto pertenezca al vendedor
        producto = obtener_producto_por_id(id_producto)
        
        if not producto:
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
        
        if producto['fk_vendedor'] != usuario_id:
            return jsonify({
                'success': False,
                'error': 'No tienes permiso para editar este producto'
            }), 403
        
        data = request.get_json() or {}
        
        # Campos permitidos para actualizar
        campos_permitidos = {
            'nombre_producto', 'descripcion', 'fk_categoria', 
            'fk_tipo_vehiculo', 'precio', 'stock', 'pausado'
        }
        
        datos_actualizacion = {
            campo: data[campo] 
            for campo in campos_permitidos 
            if campo in data
        }
        
        # Validaciones
        if 'precio' in datos_actualizacion:
            if float(datos_actualizacion['precio']) <= 0:
                return jsonify({
                    'success': False,
                    'error': 'El precio debe ser mayor a cero'
                }), 400
        
        if 'stock' in datos_actualizacion:
            if int(datos_actualizacion['stock']) < 0:
                return jsonify({
                    'success': False,
                    'error': 'El stock no puede ser negativo'
                }), 400
        
        # Actualizar
        actualizado = actualizar_producto(id_producto, datos_actualizacion)
        
        if not actualizado:
            return jsonify({
                'success': False,
                'error': 'Error al actualizar el producto'
            }), 500
        
        # Obtener producto actualizado
        producto_actualizado = obtener_producto_por_id(id_producto)
        
        return jsonify({
            'success': True,
            'message': 'Producto actualizado con éxito',
            'producto': producto_actualizado
        }), 200
        
    except Exception as e:
        print(f"Error al actualizar producto: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Error al actualizar producto: {str(e)}'
        }), 500


@token_requerido
def eliminar_producto_controller(usuario_id, id_producto):
    """
    Elimina un producto
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Verificar que el producto pertenezca al vendedor
        producto = obtener_producto_por_id(id_producto)
        
        if not producto:
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
        
        if producto['fk_vendedor'] != usuario_id:
            return jsonify({
                'success': False,
                'error': 'No tienes permiso para eliminar este producto'
            }), 403
        
        # Eliminar
        eliminado = eliminar_producto(id_producto)
        
        if not eliminado:
            return jsonify({
                'success': False,
                'error': 'Error al eliminar el producto'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Producto eliminado con éxito'
        }), 200
        
    except Exception as e:
        print(f"Error al eliminar producto: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al eliminar producto: {str(e)}'
        }), 500


@token_requerido
def pausar_producto_controller(usuario_id, id_producto):
    """
    Pausa o activa un producto
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Verificar que el producto pertenezca al vendedor
        producto = obtener_producto_por_id(id_producto)
        
        if not producto:
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado'
            }), 404
        
        if producto['fk_vendedor'] != usuario_id:
            return jsonify({
                'success': False,
                'error': 'No tienes permiso para pausar este producto'
            }), 403
        
        data = request.get_json() or {}
        pausado = data.get('pausado', True)
        
        # Pausar/Activar
        actualizado = pausar_producto(id_producto, pausado)
        
        if not actualizado:
            return jsonify({
                'success': False,
                'error': 'Error al cambiar el estado del producto'
            }), 500
        
        mensaje = 'Producto pausado' if pausado else 'Producto activado'
        
        return jsonify({
            'success': True,
            'message': mensaje
        }), 200
        
    except Exception as e:
        print(f"Error al pausar producto: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al pausar producto: {str(e)}'
        }), 500


# Endpoints públicos (sin autenticación)

def obtener_categorias_controller():
    """
    Obtiene todas las categorías
    """
    try:
        categorias = obtener_categorias()
        
        return jsonify({
            'success': True,
            'categorias': categorias
        }), 200
        
    except Exception as e:
        print(f"Error al obtener categorías: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener categorías'
        }), 500


def obtener_tipos_vehiculo_controller():
    """
    Obtiene todos los tipos de vehículo
    """
    try:
        tipos = obtener_tipos_vehiculo()
        
        return jsonify({
            'success': True,
            'tipos_vehiculo': tipos
        }), 200
        
    except Exception as e:
        print(f"Error al obtener tipos de vehículo: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener tipos de vehículo'
        }), 500