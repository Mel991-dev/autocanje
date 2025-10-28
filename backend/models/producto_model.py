# models/producto_model.py
from config.database import conexion

def crear_producto(fk_vendedor, fk_categoria, fk_tipo_vehiculo, nombre_producto, 
                   descripcion, precio, stock, pausado=False):
    """
    Crea un nuevo producto en la base de datos
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        sql = """
            INSERT INTO producto 
            (fk_vendedor, fk_categoria, fk_tipo_vehiculo, nombre_producto, 
             descripcion, precio, stock, pausado)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (fk_vendedor, fk_categoria, fk_tipo_vehiculo, nombre_producto,
                  descripcion, precio, stock, int(pausado))
        
        cursor.execute(sql, params)
        conn.commit()
        
        last_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return last_id
        
    except Exception as e:
        print(f"Error al crear producto: {str(e)}")
        cursor.close()
        conn.close()
        return None


def obtener_productos_vendedor(fk_vendedor):
    """
    Obtiene todos los productos de un vendedor específico
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT p.*, 
                   c.nombre as nombre_categoria,
                   tv.nombre as nombre_tipo_vehiculo,
                   (SELECT url_imagen FROM imagen_producto 
                    WHERE fk_producto = p.id_producto AND es_principal = 1 
                    LIMIT 1) as imagen_principal
            FROM producto p
            LEFT JOIN categoria c ON p.fk_categoria = c.id_categoria
            LEFT JOIN tipo_vehiculo tv ON p.fk_tipo_vehiculo = tv.id_tipo
            WHERE p.fk_vendedor = %s
            ORDER BY p.fecha_publicacion DESC
        """
        
        cursor.execute(sql, (fk_vendedor,))
        productos = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return productos
        
    except Exception as e:
        print(f"Error al obtener productos: {str(e)}")
        cursor.close()
        conn.close()
        return []


def obtener_producto_por_id(id_producto):
    """
    Obtiene un producto específico por su ID
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT p.*, 
                   c.nombre as nombre_categoria,
                   tv.nombre as nombre_tipo_vehiculo
            FROM producto p
            LEFT JOIN categoria c ON p.fk_categoria = c.id_categoria
            LEFT JOIN tipo_vehiculo tv ON p.fk_tipo_vehiculo = tv.id_tipo
            WHERE p.id_producto = %s
        """
        
        cursor.execute(sql, (id_producto,))
        producto = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return producto
        
    except Exception as e:
        print(f"Error al obtener producto: {str(e)}")
        cursor.close()
        conn.close()
        return None


def actualizar_producto(id_producto, datos):
    """
    Actualiza los datos de un producto
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        campos = []
        valores = []
        
        for campo, valor in datos.items():
            if campo == 'pausado':
                campos.append(f"{campo} = %s")
                valores.append(int(valor))
            else:
                campos.append(f"{campo} = %s")
                valores.append(valor)
        
        valores.append(id_producto)
        
        sql = f"UPDATE producto SET {', '.join(campos)} WHERE id_producto = %s"
        
        cursor.execute(sql, valores)
        conn.commit()
        
        filas_afectadas = cursor.rowcount
        cursor.close()
        conn.close()
        
        return filas_afectadas > 0
        
    except Exception as e:
        print(f"Error al actualizar producto: {str(e)}")
        cursor.close()
        conn.close()
        return False


def eliminar_producto(id_producto):
    """
    Elimina un producto de la base de datos
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        # Primero eliminar imágenes asociadas
        cursor.execute("DELETE FROM imagen_producto WHERE fk_producto = %s", (id_producto,))
        
        # Luego eliminar el producto
        cursor.execute("DELETE FROM producto WHERE id_producto = %s", (id_producto,))
        
        conn.commit()
        filas_afectadas = cursor.rowcount
        
        cursor.close()
        conn.close()
        
        return filas_afectadas > 0
        
    except Exception as e:
        print(f"Error al eliminar producto: {str(e)}")
        cursor.close()
        conn.close()
        return False


def pausar_producto(id_producto, pausado=True):
    """
    Pausa o activa un producto
    """
    return actualizar_producto(id_producto, {'pausado': pausado})


# Funciones auxiliares para categorías y tipos de vehículo

def obtener_categorias():
    """
    Obtiene todas las categorías disponibles
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM categoria ORDER BY nombre")
        categorias = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return categorias
        
    except Exception as e:
        print(f"Error al obtener categorías: {str(e)}")
        cursor.close()
        conn.close()
        return []


def obtener_tipos_vehiculo():
    """
    Obtiene todos los tipos de vehículo disponibles
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM tipo_vehiculo ORDER BY nombre")
        tipos = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return tipos
        
    except Exception as e:
        print(f"Error al obtener tipos de vehículo: {str(e)}")
        cursor.close()
        conn.close()
        return []


# Funciones para manejo de imágenes

def crear_imagen_producto(fk_producto, url_imagen, es_principal=False):
    """
    Asocia una imagen a un producto
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        # Si es principal, quitar el flag de las demás
        if es_principal:
            cursor.execute(
                "UPDATE imagen_producto SET es_principal = 0 WHERE fk_producto = %s",
                (fk_producto,)
            )
        
        sql = """
            INSERT INTO imagen_producto (fk_producto, url_imagen, es_principal)
            VALUES (%s, %s, %s)
        """
        
        cursor.execute(sql, (fk_producto, url_imagen, int(es_principal)))
        conn.commit()
        
        last_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return last_id
        
    except Exception as e:
        print(f"Error al crear imagen: {str(e)}")
        cursor.close()
        conn.close()
        return None


def obtener_imagenes_producto(fk_producto):
    """
    Obtiene todas las imágenes de un producto
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT * FROM imagen_producto 
            WHERE fk_producto = %s 
            ORDER BY es_principal DESC, id_imagen_prod ASC
        """
        
        cursor.execute(sql, (fk_producto,))
        imagenes = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return imagenes
        
    except Exception as e:
        print(f"Error al obtener imágenes: {str(e)}")
        cursor.close()
        conn.close()
        return []


def eliminar_imagen_producto(id_imagen):
    """
    Elimina una imagen de producto
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM imagen_producto WHERE id_imagen_prod = %s", (id_imagen,))
        conn.commit()
        
        filas_afectadas = cursor.rowcount
        cursor.close()
        conn.close()
        
        return filas_afectadas > 0
        
    except Exception as e:
        print(f"Error al eliminar imagen: {str(e)}")
        cursor.close()
        conn.close()
        return False
    
def obtener_productos_catalogo(filtros=None):
    """
    Obtiene productos del catálogo público con filtros avanzados
    
    Args:
        filtros (dict): {
            'busqueda': str,
            'categoria': int,
            'tipo_vehiculo': int,
            'precio_min': float,
            'precio_max': float,
            'valoracion_min': float,
            'orden': str ('precio_asc', 'precio_desc', 'valoracion', 'reciente')
        }
    
    Returns:
        list: Lista de productos con información completa
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Query base
        sql = """
            SELECT 
                p.id_producto,
                p.nombre_producto,
                p.descripcion,
                p.precio,
                p.stock,
                p.promedio_valoracion,
                p.valoraciones,
                p.fecha_publicacion,
                c.id_categoria,
                c.nombre as nombre_categoria,
                tv.id_tipo as id_tipo_vehiculo,
                tv.nombre as nombre_tipo_vehiculo,
                u.primer_nombre as vendedor_nombre,
                u.primer_apellido as vendedor_apellido,
                (SELECT url_imagen 
                 FROM imagen_producto 
                 WHERE fk_producto = p.id_producto AND es_principal = 1 
                 LIMIT 1) as imagen_principal,
                (SELECT COUNT(*) 
                 FROM imagen_producto 
                 WHERE fk_producto = p.id_producto) as total_imagenes
            FROM producto p
            LEFT JOIN categoria c ON p.fk_categoria = c.id_categoria
            LEFT JOIN tipo_vehiculo tv ON p.fk_tipo_vehiculo = tv.id_tipo
            LEFT JOIN usuario u ON p.fk_vendedor = u.id_usuario
            WHERE p.pausado = 0 AND p.stock > 0
        """
        
        params = []
        
        # Aplicar filtros
        if filtros:
            # Búsqueda por nombre o descripción
            if filtros.get('busqueda'):
                sql += " AND (p.nombre_producto LIKE %s OR p.descripcion LIKE %s)"
                busqueda_param = f"%{filtros['busqueda']}%"
                params.extend([busqueda_param, busqueda_param])
            
            # Filtro por categoría
            if filtros.get('categoria'):
                sql += " AND p.fk_categoria = %s"
                params.append(filtros['categoria'])
            
            # Filtro por tipo de vehículo
            if filtros.get('tipo_vehiculo'):
                sql += " AND p.fk_tipo_vehiculo = %s"
                params.append(filtros['tipo_vehiculo'])
            
            # Filtro por rango de precio
            if filtros.get('precio_min') is not None:
                sql += " AND p.precio >= %s"
                params.append(filtros['precio_min'])
            
            if filtros.get('precio_max') is not None:
                sql += " AND p.precio <= %s"
                params.append(filtros['precio_max'])
            
            # Filtro por valoración mínima
            if filtros.get('valoracion_min'):
                sql += " AND p.promedio_valoracion >= %s"
                params.append(filtros['valoracion_min'])
        
        # Ordenamiento
        orden = filtros.get('orden', 'reciente') if filtros else 'reciente'
        
        if orden == 'precio_asc':
            sql += " ORDER BY p.precio ASC"
        elif orden == 'precio_desc':
            sql += " ORDER BY p.precio DESC"
        elif orden == 'valoracion':
            sql += " ORDER BY p.promedio_valoracion DESC, p.valoraciones DESC"
        elif orden == 'nombre':
            sql += " ORDER BY p.nombre_producto ASC"
        else:  # reciente (default)
            sql += " ORDER BY p.fecha_publicacion DESC"
        
        # Ejecutar query
        cursor.execute(sql, params)
        productos = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return productos
        
    except Exception as e:
        print(f"Error al obtener catálogo: {str(e)}")
        import traceback
        traceback.print_exc()
        cursor.close()
        conn.close()
        return []


def obtener_producto_detalle(id_producto):
    """
    Obtiene todos los detalles de un producto para la vista detallada
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
            # Obtener imágenes del producto
            imagenes = obtener_imagenes_producto(id_producto)
            producto['imagenes'] = imagenes
        
        cursor.close()
        conn.close()
        
        return producto
        
    except Exception as e:
        print(f"Error al obtener detalle del producto: {str(e)}")
        cursor.close()
        conn.close()
        return None


def obtener_estadisticas_catalogo():
    """
    Obtiene estadísticas generales del catálogo para mostrar en filtros
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Obtener rangos de precio
        cursor.execute("""
            SELECT 
                MIN(precio) as precio_minimo,
                MAX(precio) as precio_maximo,
                AVG(precio) as precio_promedio,
                COUNT(*) as total_productos
            FROM producto
            WHERE pausado = 0 AND stock > 0
        """)
        stats = cursor.fetchone()
        
        # Contar productos por categoría
        cursor.execute("""
            SELECT 
                c.id_categoria,
                c.nombre,
                COUNT(p.id_producto) as cantidad
            FROM categoria c
            LEFT JOIN producto p ON c.id_categoria = p.fk_categoria 
                AND p.pausado = 0 AND p.stock > 0
            GROUP BY c.id_categoria, c.nombre
            HAVING cantidad > 0
            ORDER BY cantidad DESC
        """)
        categorias_stats = cursor.fetchall()
        
        # Contar productos por tipo de vehículo
        cursor.execute("""
            SELECT 
                tv.id_tipo,
                tv.nombre,
                COUNT(p.id_producto) as cantidad
            FROM tipo_vehiculo tv
            LEFT JOIN producto p ON tv.id_tipo = p.fk_tipo_vehiculo 
                AND p.pausado = 0 AND p.stock > 0
            GROUP BY tv.id_tipo, tv.nombre
            HAVING cantidad > 0
            ORDER BY cantidad DESC
        """)
        tipos_stats = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            'general': stats,
            'por_categoria': categorias_stats,
            'por_tipo_vehiculo': tipos_stats
        }
        
    except Exception as e:
        print(f"Error al obtener estadísticas: {str(e)}")
        cursor.close()
        conn.close()
        return None


def buscar_productos_sugerencias(termino, limite=5):
    """
    Busca productos para autocompletado/sugerencias
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT DISTINCT
                id_producto,
                nombre_producto,
                precio,
                (SELECT url_imagen 
                 FROM imagen_producto 
                 WHERE fk_producto = p.id_producto AND es_principal = 1 
                 LIMIT 1) as imagen_principal
            FROM producto p
            WHERE p.pausado = 0 
                AND p.stock > 0
                AND p.nombre_producto LIKE %s
            ORDER BY p.nombre_producto ASC
            LIMIT %s
        """
        
        cursor.execute(sql, (f"%{termino}%", limite))
        sugerencias = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return sugerencias
        
    except Exception as e:
        print(f"Error al buscar sugerencias: {str(e)}")
        cursor.close()
        conn.close()
        return []


def obtener_productos_relacionados(id_producto, limite=4):
    """
    Obtiene productos relacionados basados en categoría y tipo de vehículo
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Primero obtener categoría y tipo del producto actual
        cursor.execute("""
            SELECT fk_categoria, fk_tipo_vehiculo 
            FROM producto 
            WHERE id_producto = %s
        """, (id_producto,))
        
        producto_actual = cursor.fetchone()
        
        if not producto_actual:
            return []
        
        # Buscar productos similares
        sql = """
            SELECT 
                p.id_producto,
                p.nombre_producto,
                p.precio,
                p.promedio_valoracion,
                p.valoraciones,
                c.nombre as nombre_categoria,
                (SELECT url_imagen 
                 FROM imagen_producto 
                 WHERE fk_producto = p.id_producto AND es_principal = 1 
                 LIMIT 1) as imagen_principal
            FROM producto p
            LEFT JOIN categoria c ON p.fk_categoria = c.id_categoria
            WHERE p.pausado = 0 
                AND p.stock > 0
                AND p.id_producto != %s
                AND (
                    p.fk_categoria = %s 
                    OR p.fk_tipo_vehiculo = %s
                )
            ORDER BY 
                (p.fk_categoria = %s) DESC,
                (p.fk_tipo_vehiculo = %s) DESC,
                p.promedio_valoracion DESC
            LIMIT %s
        """
        
        cursor.execute(sql, (
            id_producto,
            producto_actual['fk_categoria'],
            producto_actual['fk_tipo_vehiculo'],
            producto_actual['fk_categoria'],
            producto_actual['fk_tipo_vehiculo'],
            limite
        ))
        
        relacionados = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return relacionados
        
    except Exception as e:
        print(f"Error al obtener productos relacionados: {str(e)}")
        cursor.close()
        conn.close()
        return []


def obtener_productos_mas_vendidos(limite=10):
    """
    Obtiene los productos más vendidos (placeholder - cuando implementes ventas)
    Por ahora retorna los mejor valorados
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT 
                p.id_producto,
                p.nombre_producto,
                p.precio,
                p.promedio_valoracion,
                p.valoraciones,
                c.nombre as nombre_categoria,
                (SELECT url_imagen 
                 FROM imagen_producto 
                 WHERE fk_producto = p.id_producto AND es_principal = 1 
                 LIMIT 1) as imagen_principal
            FROM producto p
            LEFT JOIN categoria c ON p.fk_categoria = c.id_categoria
            WHERE p.pausado = 0 AND p.stock > 0
            ORDER BY p.promedio_valoracion DESC, p.valoraciones DESC
            LIMIT %s
        """
        
        cursor.execute(sql, (limite,))
        productos = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return productos
        
    except Exception as e:
        print(f"Error al obtener productos más vendidos: {str(e)}")
        cursor.close()
        conn.close()
        return []