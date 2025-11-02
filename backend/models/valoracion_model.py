# backend/models/valoracion_model.py
from config.database import conexion

def crear_valoracion(fk_usuario, fk_producto, fk_compra, calificacion, comentario):
    """
    Crea una nueva valoración para un producto
    CA-6.1.2: El usuario puede dejar una calificación (1 a 5 estrellas) y un comentario
    CA-6.1.3: El comentario debe almacenarse junto a la compra y el producto
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        sql = """
            INSERT INTO valoracion 
            (fk_usuario, fk_producto, fk_compra, calificacion, comentario, fecha_valoracion)
            VALUES (%s, %s, %s, %s, %s, NOW())
        """
        
        cursor.execute(sql, (fk_usuario, fk_producto, fk_compra, calificacion, comentario))
        conn.commit()
        
        id_valoracion = cursor.lastrowid
        
        # CA-6.2.3: Actualizar promedio del producto automáticamente
        actualizar_promedio_valoracion(fk_producto)
        
        cursor.close()
        conn.close()
        
        return id_valoracion
        
    except Exception as e:
        print(f"Error al crear valoración: {str(e)}")
        cursor.close()
        conn.close()
        return None


def obtener_valoraciones_producto(fk_producto, limite=10):
    """
    Obtiene las valoraciones de un producto
    CA-6.1.4: Los comentarios deben ser visibles para otros usuarios
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
            INNER JOIN usuario u ON v.fk_usuario = u.id_usuario
            WHERE v.fk_producto = %s
            ORDER BY v.fecha_valoracion DESC
            LIMIT %s
        """
        
        cursor.execute(sql, (fk_producto, limite))
        valoraciones = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return valoraciones
        
    except Exception as e:
        print(f"Error al obtener valoraciones: {str(e)}")
        cursor.close()
        conn.close()
        return []


def verificar_puede_valorar(fk_usuario, fk_producto):
    """
    Verifica si un usuario puede valorar un producto
    CA-6.1.1: Solo los compradores de un producto pueden calificarlo
    
    Returns:
        dict: {
            'puede_valorar': bool,
            'ya_valoro': bool,
            'compras_validas': list
        }
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verificar si ya valoró
        cursor.execute("""
            SELECT id_valoracion 
            FROM valoracion 
            WHERE fk_usuario = %s AND fk_producto = %s
        """, (fk_usuario, fk_producto))
        
        ya_valoro = cursor.fetchone() is not None
        
        # Obtener compras completadas del producto
        cursor.execute("""
            SELECT DISTINCT c.id_compra, c.fecha_compra
            FROM compra c
            INNER JOIN detalle_compra dc ON c.id_compra = dc.fk_compra
            WHERE c.fk_comprador = %s 
                AND dc.fk_producto = %s
                AND c.estado = 'completado'
            ORDER BY c.fecha_compra DESC
        """, (fk_usuario, fk_producto))
        
        compras_validas = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return {
            'puede_valorar': len(compras_validas) > 0 and not ya_valoro,
            'ya_valoro': ya_valoro,
            'compras_validas': compras_validas
        }
        
    except Exception as e:
        print(f"Error al verificar permisos de valoración: {str(e)}")
        cursor.close()
        conn.close()
        return {
            'puede_valorar': False,
            'ya_valoro': False,
            'compras_validas': []
        }


def actualizar_promedio_valoracion(fk_producto):
    """
    Actualiza el promedio de valoración de un producto
    CA-6.2.1: El sistema debe calcular el promedio de valoraciones
    CA-6.2.3: Las valoraciones deben actualizarse automáticamente
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Calcular promedio y total de valoraciones
        cursor.execute("""
            SELECT 
                AVG(calificacion) as promedio,
                COUNT(*) as total
            FROM valoracion
            WHERE fk_producto = %s
        """, (fk_producto,))
        
        resultado = cursor.fetchone()
        
        promedio = float(resultado['promedio']) if resultado['promedio'] else 0
        total = int(resultado['total'])
        
        # Actualizar en la tabla producto
        cursor.execute("""
            UPDATE producto 
            SET promedio_valoracion = %s, valoraciones = %s
            WHERE id_producto = %s
        """, (promedio, total, fk_producto))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"Error al actualizar promedio: {str(e)}")
        cursor.close()
        conn.close()
        return False


def obtener_valoracion_usuario(fk_usuario, fk_producto):
    """
    Obtiene la valoración existente de un usuario para un producto
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT * FROM valoracion
            WHERE fk_usuario = %s AND fk_producto = %s
        """
        
        cursor.execute(sql, (fk_usuario, fk_producto))
        valoracion = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return valoracion
        
    except Exception as e:
        print(f"Error al obtener valoración del usuario: {str(e)}")
        cursor.close()
        conn.close()
        return None