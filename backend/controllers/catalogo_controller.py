# controllers/catalogo_controller.py
from flask import request, jsonify
from models.producto_model import (
    obtener_productos_catalogo,
    obtener_producto_detalle,
    obtener_estadisticas_catalogo,
    buscar_productos_sugerencias,
    obtener_productos_relacionados,
    obtener_productos_mas_vendidos,
    obtener_tipos_vehiculo,
    obtener_categorias  # Nueva importación
)

def obtener_catalogo_controller():
    """
    Obtiene el catálogo de productos con filtros
    """
    try:
        # Obtener parámetros de query
        filtros = {}
        
        # Búsqueda
        if request.args.get('busqueda'):
            filtros['busqueda'] = request.args.get('busqueda').strip()
        
        # Categorías múltiples
        categorias = request.args.getlist('categoria[]')
        if categorias:
            try:
                filtros['categoria'] = [int(c) for c in categorias if c.isdigit()]
            except ValueError:
                pass
        
        # Tipos de vehículo múltiples
        tipos_vehiculo = request.args.getlist('tipo_vehiculo[]')
        if tipos_vehiculo:
            try:
                filtros['tipo_vehiculo'] = [int(t) for t in tipos_vehiculo if t.isdigit()]
            except ValueError:
                pass
        
        # Rango de precio
        if request.args.get('precio_min'):
            try:
                filtros['precio_min'] = float(request.args.get('precio_min'))
            except ValueError:
                pass
        
        if request.args.get('precio_max'):
            try:
                filtros['precio_max'] = float(request.args.get('precio_max'))
            except ValueError:
                pass
        
        # Valoración mínima
        if request.args.get('valoracion_min'):
            try:
                filtros['valoracion_min'] = float(request.args.get('valoracion_min'))
            except ValueError:
                pass
        
        # Ordenamiento
        orden_validos = ['precio_asc', 'precio_desc', 'valoracion', 'reciente', 'nombre']
        orden = request.args.get('orden', 'reciente')
        if orden in orden_validos:
            filtros['orden'] = orden
        
        # Obtener productos
        productos = obtener_productos_catalogo(filtros)
        
        return jsonify({
            'success': True,
            'total': len(productos),
            'productos': productos,
            'filtros_aplicados': filtros
        }), 200
        
    except Exception as e:
        print(f"Error al obtener catálogo: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Error al obtener catálogo: {str(e)}'
        }), 500


def obtener_producto_detalle_controller(id_producto):
    """
    Obtiene el detalle completo de un producto
    """
    try:
        producto = obtener_producto_detalle(id_producto)
        
        if not producto:
            return jsonify({
                'success': False,
                'error': 'Producto no encontrado o no disponible'
            }), 404
        
        # Obtener productos relacionados
        relacionados = obtener_productos_relacionados(id_producto)
        
        return jsonify({
            'success': True,
            'producto': producto,
            'relacionados': relacionados
        }), 200
        
    except Exception as e:
        print(f"Error al obtener detalle: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener el producto'
        }), 500


def obtener_estadisticas_controller():
    """
    Obtiene estadísticas para los filtros del catálogo
    """
    try:
        stats = obtener_estadisticas_catalogo()
        
        if not stats:
            return jsonify({
                'success': False,
                'error': 'Error al obtener estadísticas'
            }), 500
        
        return jsonify({
            'success': True,
            'estadisticas': stats
        }), 200
        
    except Exception as e:
        print(f"Error al obtener estadísticas: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener estadísticas'
        }), 500


def buscar_sugerencias_controller():
    """
    Busca productos para autocompletado
    """
    try:
        termino = request.args.get('q', '').strip()
        
        if len(termino) < 2:
            return jsonify({
                'success': True,
                'sugerencias': []
            }), 200
        
        limite = int(request.args.get('limite', 5))
        
        sugerencias = buscar_productos_sugerencias(termino, limite)
        
        return jsonify({
            'success': True,
            'sugerencias': sugerencias
        }), 200
        
    except Exception as e:
        print(f"Error al buscar sugerencias: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al buscar sugerencias'
        }), 500


def obtener_mas_vendidos_controller():
    """
    Obtiene los productos más vendidos
    """
    try:
        limite = int(request.args.get('limite', 10))
        productos = obtener_productos_mas_vendidos(limite)
        
        return jsonify({
            'success': True,
            'productos': productos
        }), 200
        
    except Exception as e:
        print(f"Error al obtener más vendidos: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error al obtener productos'
        }), 500


def obtener_categorias_controller():
    """
    Obtiene todas las categorías disponibles
    """
    try:
        categorias = obtener_categorias()
        return jsonify({'success': True, 'categorias': categorias}), 200
    except Exception as e:
        print(f"Error al obtener categorías: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


def obtener_tipos_vehiculo_controller():
    """
    Obtiene todos los tipos de vehículo disponibles
    """
    try:
        tipos = obtener_tipos_vehiculo()
        return jsonify({'success': True, 'tipos': tipos}), 200
    except Exception as e:
        print(f"Error al obtener tipos de vehículo: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500