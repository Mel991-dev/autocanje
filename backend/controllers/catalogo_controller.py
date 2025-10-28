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
    obtener_categorias,
    obtener_imagenes_producto
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
        
        # Categorías múltiples - Soporta tanto categoria[] como categoria
        categorias = request.args.getlist('categoria[]')
        if not categorias:
            categorias = request.args.getlist('categoria')
        
        if categorias:
            try:
                # Convertir a enteros y filtrar valores válidos
                filtros['categoria'] = [int(c) for c in categorias if str(c).isdigit()]
            except (ValueError, TypeError):
                pass
        
        # Tipos de vehículo múltiples - Soporta tanto tipo_vehiculo[] como tipo_vehiculo
        tipos_vehiculo = request.args.getlist('tipo_vehiculo[]')
        if not tipos_vehiculo:
            tipos_vehiculo = request.args.getlist('tipo_vehiculo')
            
        if tipos_vehiculo:
            try:
                # Convertir a enteros y filtrar valores válidos
                filtros['tipo_vehiculo'] = [int(t) for t in tipos_vehiculo if str(t).isdigit()]
            except (ValueError, TypeError):
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
    Obtiene el detalle completo de un producto para la vista previa
    
    CA-4.3.1: Información completa del producto
    CA-4.3.2: Múltiples imágenes en galería
    CA-4.3.3: Valoración promedio y comentarios
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
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Error al obtener el producto'
        }), 500


# Función del modelo que ya existe en producto_model.py
# Esta es la versión completa

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

def obtener_producto_detalle(id_producto):
    """
    Obtiene todos los detalles de un producto para la vista detallada
    Incluye: información básica, vendedor, categoría, tipo vehículo e imágenes
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT 
                p.*,
                c.nombre as nombre_categoria,
                c.descripcion as descripcion_categoria,
                tv.nombre as nombre_tipo_vehiculo,
                tv.descripcion as descripcion_tipo_vehiculo,
                u.id_usuario as vendedor_id,
                u.primer_nombre as vendedor_nombre,
                u.primer_apellido as vendedor_apellido,
                u.email as vendedor_email,
                u.telefono as vendedor_telefono
            FROM producto p
            LEFT JOIN categoria c ON p.fk_categoria = c.id_categoria
            LEFT JOIN tipo_vehiculo tv ON p.fk_tipo_vehiculo = tv.id_tipo
            LEFT JOIN usuario u ON p.fk_vendedor = u.id_usuario
            WHERE p.id_producto = %s AND p.pausado = 0
        """
        
        cursor.execute(sql, (id_producto,))
        producto = cursor.fetchone()
        
        if producto:
            # Obtener imágenes del producto (CA-4.3.2)
            imagenes = obtener_imagenes_producto(id_producto)
            producto['imagenes'] = imagenes
            
            # Obtener valoraciones (CA-4.3.3)
            valoraciones = obtener_valoraciones_producto(id_producto)
            producto['valoraciones_detalle'] = valoraciones
        
        cursor.close()
        conn.close()
        
        return producto
        
    except Exception as e:
        print(f"Error al obtener detalle del producto: {str(e)}")
        cursor.close()
        conn.close()
        return None

def obtener_valoraciones_producto(id_producto):
    """
    Obtiene las valoraciones y comentarios de un producto (CA-4.3.3)
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT 
                v.*,
                u.primer_nombre,
                u.primer_apellido,
                DATE_FORMAT(v.fecha_valoracion, '%d de %M, %Y') as fecha_formateada
            FROM valoracion v
            LEFT JOIN usuario u ON v.fk_usuario = u.id_usuario
            WHERE v.fk_producto = %s
            ORDER BY v.fecha_valoracion DESC
            LIMIT 10
        """
        
        cursor.execute(sql, (id_producto,))
        valoraciones = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return valoraciones
        
    except Exception as e:
        print(f"Error al obtener valoraciones: {str(e)}")
        cursor.close()
        conn.close()
        return []

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