# backend/models/compra_model.py
from config.database import conexion
from datetime import datetime

def crear_compra(fk_comprador, subtotal, descuento_aplicado, total, compra_premium=False):
    """
    Crea una nueva compra
    CA-4.5.1: Genera el registro de compra
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        sql = """
            INSERT INTO compra 
            (fk_comprador, fecha_compra, subtotal, descuento_aplicado, total, 
             estado, compra_premium)
            VALUES (%s, NOW(), %s, %s, %s, 'pendiente', %s)
        """
        
        cursor.execute(sql, (
            fk_comprador,
            subtotal,
            descuento_aplicado,
            total,
            int(compra_premium)
        ))
        
        conn.commit()
        id_compra = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return id_compra
        
    except Exception as e:
        print(f"Error al crear compra: {str(e)}")
        cursor.close()
        conn.close()
        return None


def crear_detalle_compra(fk_compra, fk_producto, cantidad, precio_unitario):
    """
    Crea el detalle de una compra (productos comprados)
    CA-4.5.2: Genera el detalle del comprobante
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        subtotal_detalle = cantidad * precio_unitario
        
        sql = """
            INSERT INTO detalle_compra 
            (fk_compra, fk_producto, cantidad, precio_unitario, subtotal_detalle)
            VALUES (%s, %s, %s, %s, %s)
        """
        
        cursor.execute(sql, (
            fk_compra,
            fk_producto,
            cantidad,
            precio_unitario,
            subtotal_detalle
        ))
        
        conn.commit()
        id_detalle = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return id_detalle
        
    except Exception as e:
        print(f"Error al crear detalle de compra: {str(e)}")
        cursor.close()
        conn.close()
        return None


def crear_pago(fk_compra, fk_metodo_pago, monto, transaccion_id=None):
    """
    Registra el pago de una compra
    CA-4.5.1: Registra el método de pago seleccionado
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        sql = """
            INSERT INTO pago 
            (fk_compra, fk_metodo_pago, monto, estado, transaccion_id, fecha_pago)
            VALUES (%s, %s, %s, 'completado', %s, NOW())
        """
        
        cursor.execute(sql, (
            fk_compra,
            fk_metodo_pago,
            monto,
            transaccion_id
        ))
        
        conn.commit()
        id_pago = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return id_pago
        
    except Exception as e:
        print(f"Error al crear pago: {str(e)}")
        cursor.close()
        conn.close()
        return None


def actualizar_stock_producto(fk_producto, cantidad):
    """
    Actualiza el stock de un producto después de la compra
    CA-4.5.4: Actualiza el inventario
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        sql = """
            UPDATE producto 
            SET stock = stock - %s
            WHERE id_producto = %s AND stock >= %s
        """
        
        cursor.execute(sql, (cantidad, fk_producto, cantidad))
        conn.commit()
        
        filas_afectadas = cursor.rowcount
        
        cursor.close()
        conn.close()
        
        return filas_afectadas > 0
        
    except Exception as e:
        print(f"Error al actualizar stock: {str(e)}")
        cursor.close()
        conn.close()
        return False


def actualizar_estado_compra(id_compra, nuevo_estado):
    """
    Actualiza el estado de una compra
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        sql = "UPDATE compra SET estado = %s WHERE id_compra = %s"
        cursor.execute(sql, (nuevo_estado, id_compra))
        conn.commit()
        
        filas_afectadas = cursor.rowcount
        
        cursor.close()
        conn.close()
        
        return filas_afectadas > 0
        
    except Exception as e:
        print(f"Error al actualizar estado: {str(e)}")
        cursor.close()
        conn.close()
        return False


def obtener_compra_completa(id_compra):
    """
    Obtiene toda la información de una compra para el comprobante
    CA-4.5.2: Datos del comprobante
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Obtener datos de la compra y comprador
        sql_compra = """
            SELECT 
                c.*,
                u.primer_nombre,
                u.primer_apellido,
                u.email,
                u.telefono,
                u.direccion
            FROM compra c
            INNER JOIN usuario u ON c.fk_comprador = u.id_usuario
            WHERE c.id_compra = %s
        """
        
        cursor.execute(sql_compra, (id_compra,))
        compra = cursor.fetchone()
        
        if not compra:
            cursor.close()
            conn.close()
            return None
        
        # Obtener detalles de la compra (productos)
        sql_detalles = """
            SELECT 
                dc.*,
                p.nombre_producto,
                p.fk_categoria,
                cat.nombre as nombre_categoria,
                (SELECT url_imagen 
                 FROM imagen_producto 
                 WHERE fk_producto = p.id_producto AND es_principal = 1 
                 LIMIT 1) as imagen_principal
            FROM detalle_compra dc
            INNER JOIN producto p ON dc.fk_producto = p.id_producto
            LEFT JOIN categoria cat ON p.fk_categoria = cat.id_categoria
            WHERE dc.fk_compra = %s
        """
        
        cursor.execute(sql_detalles, (id_compra,))
        detalles = cursor.fetchall()
        
        compra['detalles'] = detalles
        
        # Obtener información del pago
        sql_pago = """
            SELECT 
                p.*,
                mp.nombre as nombre_metodo_pago
            FROM pago p
            INNER JOIN metodo_pago mp ON p.fk_metodo_pago = mp.id_metodo_pago
            WHERE p.fk_compra = %s
            LIMIT 1
        """
        
        cursor.execute(sql_pago, (id_compra,))
        pago = cursor.fetchone()
        
        compra['pago'] = pago
        
        cursor.close()
        conn.close()
        
        return compra
        
    except Exception as e:
        print(f"Error al obtener compra completa: {str(e)}")
        cursor.close()
        conn.close()
        return None


def obtener_metodos_pago():
    """
    Obtiene los métodos de pago activos
    CA-4.5.1: Lista de métodos de pago disponibles
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = "SELECT * FROM metodo_pago WHERE activo = 1 ORDER BY nombre"
        cursor.execute(sql)
        metodos = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return metodos
        
    except Exception as e:
        print(f"Error al obtener métodos de pago: {str(e)}")
        cursor.close()
        conn.close()
        return []


def crear_envio(fk_compra, direccion_entrega, es_prioritario, dias_estimados):
    """
    Crea el registro de envío para una compra
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        # Estado inicial: En preparación (ID 1)
        sql = """
            INSERT INTO envio 
            (fk_compra, fk_estado_envio, direccion_entrega, 
             fecha_estimada, es_prioritario, dias_estimados)
            VALUES (%s, 1, %s, DATE_ADD(NOW(), INTERVAL %s DAY), %s, %s)
        """
        
        cursor.execute(sql, (
            fk_compra,
            direccion_entrega,
            dias_estimados,
            int(es_prioritario),
            dias_estimados
        ))
        
        conn.commit()
        id_envio = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return id_envio
        
    except Exception as e:
        print(f"Error al crear envío: {str(e)}")
        cursor.close()
        conn.close()
        return None