# backend/models/carrito_model.py
from config.database import conexion

def agregar_al_carrito(fk_usuario, fk_producto, cantidad=1):
    """
    Agrega un producto al carrito o actualiza la cantidad si ya existe
    CA-4.4.1: Añadir productos al carrito
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verificar si el producto ya está en el carrito
        cursor.execute("""
            SELECT id_carrito, cantidad 
            FROM carrito 
            WHERE fk_usuario = %s AND fk_producto = %s
        """, (fk_usuario, fk_producto))
        
        item_existente = cursor.fetchone()
        
        if item_existente:
            # Actualizar cantidad
            nueva_cantidad = item_existente['cantidad'] + cantidad
            cursor.execute("""
                UPDATE carrito 
                SET cantidad = %s, fecha_actualizacion = NOW()
                WHERE id_carrito = %s
            """, (nueva_cantidad, item_existente['id_carrito']))
            
            id_carrito = item_existente['id_carrito']
        else:
            # Insertar nuevo item
            cursor.execute("""
                INSERT INTO carrito (fk_usuario, fk_producto, cantidad, fecha_agregado)
                VALUES (%s, %s, %s, NOW())
            """, (fk_usuario, fk_producto, cantidad))
            
            id_carrito = cursor.lastrowid
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return id_carrito
        
    except Exception as e:
        print(f"Error al agregar al carrito: {str(e)}")
        cursor.close()
        conn.close()
        return None


def obtener_carrito_usuario(fk_usuario):
    """
    Obtiene todos los items del carrito de un usuario con información completa
    CA-4.4.5: Persistencia de datos del carrito
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT 
                c.id_carrito,
                c.fk_producto,
                c.cantidad,
                c.fecha_agregado,
                c.fecha_actualizacion,
                p.nombre_producto,
                p.precio,
                p.stock,
                p.pausado,
                cat.nombre as categoria,
                u.primer_nombre as vendedor_nombre,
                u.primer_apellido as vendedor_apellido,
                (SELECT url_imagen 
                 FROM imagen_producto 
                 WHERE fk_producto = p.id_producto AND es_principal = 1 
                 LIMIT 1) as imagen_principal,
                (p.precio * c.cantidad) as subtotal_item
            FROM carrito c
            INNER JOIN producto p ON c.fk_producto = p.id_producto
            LEFT JOIN categoria cat ON p.fk_categoria = cat.id_categoria
            LEFT JOIN usuario u ON p.fk_vendedor = u.id_usuario
            WHERE c.fk_usuario = %s
            ORDER BY c.fecha_actualizacion DESC
        """
        
        cursor.execute(sql, (fk_usuario,))
        items = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return items
        
    except Exception as e:
        print(f"Error al obtener carrito: {str(e)}")
        cursor.close()
        conn.close()
        return []


def actualizar_cantidad_carrito(id_carrito, nueva_cantidad, fk_usuario):
    """
    Actualiza la cantidad de un item del carrito
    CA-4.4.2: Modificar cantidades
    CA-4.4.3: Recalcular total automáticamente
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        # Verificar que el item pertenezca al usuario
        cursor.execute("""
            SELECT c.id_carrito, p.stock 
            FROM carrito c
            INNER JOIN producto p ON c.fk_producto = p.id_producto
            WHERE c.id_carrito = %s AND c.fk_usuario = %s
        """, (id_carrito, fk_usuario))
        
        item = cursor.fetchone()
        
        if not item:
            cursor.close()
            conn.close()
            return {'success': False, 'error': 'Item no encontrado'}
        
        stock_disponible = item[1]
        
        # Validar que la cantidad no exceda el stock
        if nueva_cantidad > stock_disponible:
            cursor.close()
            conn.close()
            return {
                'success': False, 
                'error': f'Stock insuficiente. Disponible: {stock_disponible}'
            }
        
        # Validar cantidad mínima
        if nueva_cantidad < 1:
            cursor.close()
            conn.close()
            return {'success': False, 'error': 'La cantidad debe ser al menos 1'}
        
        # Actualizar cantidad
        cursor.execute("""
            UPDATE carrito 
            SET cantidad = %s, fecha_actualizacion = NOW()
            WHERE id_carrito = %s
        """, (nueva_cantidad, id_carrito))
        
        conn.commit()
        filas_afectadas = cursor.rowcount
        
        cursor.close()
        conn.close()
        
        return {
            'success': filas_afectadas > 0,
            'nueva_cantidad': nueva_cantidad
        }
        
    except Exception as e:
        print(f"Error al actualizar cantidad: {str(e)}")
        cursor.close()
        conn.close()
        return {'success': False, 'error': str(e)}


def eliminar_item_carrito(id_carrito, fk_usuario):
    """
    Elimina un item específico del carrito
    CA-4.4.4: Eliminar productos del carrito
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        # Verificar que el item pertenezca al usuario antes de eliminar
        cursor.execute("""
            DELETE FROM carrito 
            WHERE id_carrito = %s AND fk_usuario = %s
        """, (id_carrito, fk_usuario))
        
        conn.commit()
        filas_afectadas = cursor.rowcount
        
        cursor.close()
        conn.close()
        
        return filas_afectadas > 0
        
    except Exception as e:
        print(f"Error al eliminar item: {str(e)}")
        cursor.close()
        conn.close()
        return False


def vaciar_carrito(fk_usuario):
    """
    Elimina todos los items del carrito de un usuario
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            DELETE FROM carrito 
            WHERE fk_usuario = %s
        """, (fk_usuario,))
        
        conn.commit()
        filas_afectadas = cursor.rowcount
        
        cursor.close()
        conn.close()
        
        return filas_afectadas
        
    except Exception as e:
        print(f"Error al vaciar carrito: {str(e)}")
        cursor.close()
        conn.close()
        return 0


def obtener_totales_carrito(fk_usuario):
    """
    Calcula los totales del carrito (subtotal, envío, descuentos, total)
    CA-4.4.3: Recalcular totales automáticamente
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Obtener items del carrito
        cursor.execute("""
            SELECT 
                SUM(p.precio * c.cantidad) as subtotal,
                COUNT(c.id_carrito) as total_items,
                SUM(c.cantidad) as total_productos
            FROM carrito c
            INNER JOIN producto p ON c.fk_producto = p.id_producto
            WHERE c.fk_usuario = %s AND p.pausado = 0 AND p.stock > 0
        """, (fk_usuario,))
        
        resultado = cursor.fetchone()
        
        # Obtener si el usuario tiene membresía premium
        cursor.execute("""
            SELECT m.activa, p.porc_descuento
            FROM membresia_usuario m
            INNER JOIN plan_membresia p ON m.fk_plan = p.id_plan
            WHERE m.fk_usuario = %s 
                AND m.activa = 1 
                AND m.fecha_fin > NOW()
            ORDER BY m.fecha_fin DESC
            LIMIT 1
        """, (fk_usuario,))
        
        membresia = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        # Calcular totales
        subtotal = float(resultado['subtotal'] or 0)
        total_items = int(resultado['total_items'] or 0)
        total_productos = int(resultado['total_productos'] or 0)
        
        # Envío gratis si supera $100,000
        envio = 0 if subtotal > 100000 else 15000
        
        # Descuento premium (10% por defecto)
        descuento_premium = 0
        es_premium = False
        
        if membresia and membresia['activa']:
            es_premium = True
            porcentaje = membresia['porc_descuento'] or 10
            descuento_premium = subtotal * (porcentaje / 100)
        
        total = subtotal + envio - descuento_premium
        
        return {
            'subtotal': round(subtotal, 2),
            'envio': envio,
            'descuento_premium': round(descuento_premium, 2),
            'total': round(total, 2),
            'total_items': total_items,
            'total_productos': total_productos,
            'es_premium': es_premium,
            'envio_gratis_en': max(0, 100000 - subtotal) if subtotal < 100000 else 0
        }
        
    except Exception as e:
        print(f"Error al calcular totales: {str(e)}")
        return {
            'subtotal': 0,
            'envio': 15000,
            'descuento_premium': 0,
            'total': 15000,
            'total_items': 0,
            'total_productos': 0,
            'es_premium': False,
            'envio_gratis_en': 100000
        }


def verificar_disponibilidad_carrito(fk_usuario):
    """
    Verifica que todos los productos del carrito estén disponibles
    Retorna items con problemas de stock
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT 
                c.id_carrito,
                c.fk_producto,
                c.cantidad,
                p.nombre_producto,
                p.stock,
                p.pausado,
                CASE 
                    WHEN p.pausado = 1 THEN 'pausado'
                    WHEN p.stock = 0 THEN 'agotado'
                    WHEN c.cantidad > p.stock THEN 'stock_insuficiente'
                    ELSE 'disponible'
                END as estado
            FROM carrito c
            INNER JOIN producto p ON c.fk_producto = p.id_producto
            WHERE c.fk_usuario = %s
                AND (p.pausado = 1 OR p.stock = 0 OR c.cantidad > p.stock)
        """
        
        cursor.execute(sql, (fk_usuario,))
        items_problematicos = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return items_problematicos
        
    except Exception as e:
        print(f"Error al verificar disponibilidad: {str(e)}")
        cursor.close()
        conn.close()
        return []