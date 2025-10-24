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