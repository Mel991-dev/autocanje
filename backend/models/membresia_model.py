# backend/models/membresia_model.py
from config.database import conexion
from datetime import datetime, timedelta

# ============================================
# HU-5.1: PLANES Y MEMBRESÍAS
# ============================================

def obtener_planes_disponibles():
    """
    CA-5.1.1: Obtiene todos los planes con precios y beneficios
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT 
                id_plan,
                nombre_plan,
                desc_plan,
                precio_plan,
                duracion_dias,
                porc_descuento,
                dias_envio_red,
                permite_reservas,
                activo
            FROM plan_membresia
            WHERE activo = 1
            ORDER BY precio_plan ASC
        """
        
        cursor.execute(sql)
        planes = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return planes
        
    except Exception as e:
        print(f"Error al obtener planes: {str(e)}")
        cursor.close()
        conn.close()
        return []


def crear_membresia_usuario(fk_usuario, fk_plan, renovacion_auto=True):
    """
    CA-5.1.2: Crea o renueva una membresía de usuario
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Obtener duración del plan
        cursor.execute("""
            SELECT duracion_dias 
            FROM plan_membresia 
            WHERE id_plan = %s
        """, (fk_plan,))
        
        plan = cursor.fetchone()
        
        if not plan:
            return None
        
        # Verificar si ya tiene membresía activa
        cursor.execute("""
            SELECT id_membresia, fecha_fin
            FROM membresia_usuario
            WHERE fk_usuario = %s AND activa = 1
            ORDER BY fecha_fin DESC
            LIMIT 1
        """, (fk_usuario,))
        
        membresia_existente = cursor.fetchone()
        
        if membresia_existente:
            # Renovar desde la fecha de vencimiento existente
            nueva_fecha_inicio = membresia_existente['fecha_fin']
            nueva_fecha_fin = nueva_fecha_inicio + timedelta(days=plan['duracion_dias'])
        else:
            # Nueva membresía desde hoy
            nueva_fecha_inicio = datetime.now()
            nueva_fecha_fin = nueva_fecha_inicio + timedelta(days=plan['duracion_dias'])
        
        # Insertar nueva membresía
        sql = """
            INSERT INTO membresia_usuario 
            (fk_usuario, fk_plan, fecha_inicio, fecha_fin, activa, renovacion_auto)
            VALUES (%s, %s, %s, %s, 1, %s)
        """
        
        cursor.execute(sql, (
            fk_usuario,
            fk_plan,
            nueva_fecha_inicio,
            nueva_fecha_fin,
            int(renovacion_auto)
        ))
        
        conn.commit()
        id_membresia = cursor.lastrowid
        
        # Desactivar membresías anteriores
        cursor.execute("""
            UPDATE membresia_usuario
            SET activa = 0
            WHERE fk_usuario = %s AND id_membresia != %s
        """, (fk_usuario, id_membresia))
        
        conn.commit()
        
        cursor.close()
        conn.close()
        
        return id_membresia
        
    except Exception as e:
        print(f"Error al crear membresía: {str(e)}")
        conn.rollback()
        cursor.close()
        conn.close()
        return None


def obtener_membresia_activa(fk_usuario):
    """
    CA-5.1.3: Obtiene la membresía activa del usuario con fechas
    CA-5.1.4: Valida que la membresía esté activa
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT 
                m.id_membresia,
                m.fk_usuario,
                m.fk_plan,
                m.fecha_inicio,
                m.fecha_fin,
                m.activa,
                m.renovacion_auto,
                p.nombre_plan,
                p.desc_plan,
                p.precio_plan,
                p.duracion_dias,
                p.porc_descuento,
                p.dias_envio_red,
                p.permite_reservas,
                DATEDIFF(m.fecha_fin, NOW()) as dias_restantes,
                CASE 
                    WHEN m.fecha_fin < NOW() THEN 0
                    ELSE 1
                END as es_valida
            FROM membresia_usuario m
            INNER JOIN plan_membresia p ON m.fk_plan = p.id_plan
            WHERE m.fk_usuario = %s 
                AND m.activa = 1
                AND m.fecha_fin > NOW()
            ORDER BY m.fecha_fin DESC
            LIMIT 1
        """
        
        cursor.execute(sql, (fk_usuario,))
        membresia = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return membresia
        
    except Exception as e:
        print(f"Error al obtener membresía: {str(e)}")
        cursor.close()
        conn.close()
        return None


def verificar_es_premium(fk_usuario):
    """
    Verificación rápida de si el usuario tiene membresía premium activa
    """
    membresia = obtener_membresia_activa(fk_usuario)
    return membresia is not None and membresia['es_valida'] == 1


# ============================================
# HU-5.2: BENEFICIOS PREMIUM
# ============================================

def calcular_descuento_premium(fk_usuario, subtotal):
    """
    CA-5.2.1: Calcula descuento automático para usuarios premium
    """
    membresia = obtener_membresia_activa(fk_usuario)
    
    if not membresia or membresia['es_valida'] == 0:
        return {
            'es_premium': False,
            'descuento': 0,
            'porcentaje': 0,
            'total_con_descuento': subtotal
        }
    
    porcentaje_descuento = membresia['porc_descuento'] or 10
    monto_descuento = subtotal * (porcentaje_descuento / 100)
    
    return {
        'es_premium': True,
        'descuento': round(monto_descuento, 2),
        'porcentaje': porcentaje_descuento,
        'total_con_descuento': round(subtotal - monto_descuento, 2),
        'membresia': {
            'nombre': membresia['nombre_plan'],
            'fecha_fin': membresia['fecha_fin'],
            'dias_restantes': membresia['dias_restantes']
        }
    }


# ============================================
# HU-5.3: SISTEMA DE RESERVAS
# ============================================

def crear_reserva(fk_usuario, fk_producto, cantidad):
    """
    CA-5.3.1: Solo usuarios premium pueden reservar
    CA-5.3.2: Bloquea temporalmente el stock
    CA-5.2.3: Establece fecha de expiración (72 horas)
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verificar membresía premium
        membresia = obtener_membresia_activa(fk_usuario)
        
        if not membresia or not membresia['permite_reservas']:
            return {
                'success': False,
                'error': 'Solo usuarios premium pueden hacer reservas'
            }
        
        # Verificar stock disponible
        cursor.execute("""
            SELECT stock 
            FROM producto 
            WHERE id_producto = %s
        """, (fk_producto,))
        
        producto = cursor.fetchone()
        
        if not producto or producto['stock'] < cantidad:
            return {
                'success': False,
                'error': 'Stock insuficiente'
            }
        
        # Verificar si ya tiene reserva activa del mismo producto
        cursor.execute("""
            SELECT id_reserva
            FROM reserva
            WHERE fk_usuario = %s 
                AND fk_producto = %s
                AND activa = 1
                AND fecha_exp > NOW()
        """, (fk_usuario, fk_producto))
        
        if cursor.fetchone():
            return {
                'success': False,
                'error': 'Ya tienes una reserva activa de este producto'
            }
        
        # Crear reserva (72 horas de duración)
        fecha_reserva = datetime.now()
        fecha_expiracion = fecha_reserva + timedelta(hours=72)
        
        sql = """
            INSERT INTO reserva
            (fk_usuario, fk_producto, cantidad, fecha_reserva, fecha_exp, activa, convertida_compra)
            VALUES (%s, %s, %s, %s, %s, 1, 0)
        """
        
        cursor.execute(sql, (
            fk_usuario,
            fk_producto,
            cantidad,
            fecha_reserva,
            fecha_expiracion
        ))
        
        # Reducir stock temporalmente
        cursor.execute("""
            UPDATE producto
            SET stock = stock - %s
            WHERE id_producto = %s
        """, (cantidad, fk_producto))
        
        conn.commit()
        id_reserva = cursor.lastrowid
        
        cursor.close()
        conn.close()
        
        return {
            'success': True,
            'id_reserva': id_reserva,
            'fecha_expiracion': fecha_expiracion.isoformat(),
            'horas_restantes': 72
        }
        
    except Exception as e:
        print(f"Error al crear reserva: {str(e)}")
        conn.rollback()
        cursor.close()
        conn.close()
        return {
            'success': False,
            'error': str(e)
        }


def obtener_reservas_usuario(fk_usuario):
    """
    Obtiene todas las reservas activas del usuario
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT 
                r.id_reserva,
                r.fk_producto,
                r.cantidad,
                r.fecha_reserva,
                r.fecha_exp,
                r.activa,
                p.nombre_producto,
                p.precio,
                p.stock,
                (SELECT url_imagen 
                 FROM imagen_producto 
                 WHERE fk_producto = p.id_producto AND es_principal = 1 
                 LIMIT 1) as imagen_principal,
                TIMESTAMPDIFF(HOUR, NOW(), r.fecha_exp) as horas_restantes,
                CASE 
                    WHEN r.fecha_exp < NOW() THEN 1
                    ELSE 0
                END as expirada
            FROM reserva r
            INNER JOIN producto p ON r.fk_producto = p.id_producto
            WHERE r.fk_usuario = %s
                AND r.activa = 1
                AND r.convertida_compra = 0
            ORDER BY r.fecha_reserva DESC
        """
        
        cursor.execute(sql, (fk_usuario,))
        reservas = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return reservas
        
    except Exception as e:
        print(f"Error al obtener reservas: {str(e)}")
        cursor.close()
        conn.close()
        return []


def cancelar_reserva(id_reserva, fk_usuario):
    """
    CA-5.3.4: Libera el stock si la reserva se cancela o expira
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Obtener datos de la reserva
        cursor.execute("""
            SELECT fk_producto, cantidad
            FROM reserva
            WHERE id_reserva = %s AND fk_usuario = %s AND activa = 1
        """, (id_reserva, fk_usuario))
        
        reserva = cursor.fetchone()
        
        if not reserva:
            return False
        
        # Devolver stock al producto
        cursor.execute("""
            UPDATE producto
            SET stock = stock + %s
            WHERE id_producto = %s
        """, (reserva['cantidad'], reserva['fk_producto']))
        
        # Desactivar reserva
        cursor.execute("""
            UPDATE reserva
            SET activa = 0
            WHERE id_reserva = %s
        """, (id_reserva,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"Error al cancelar reserva: {str(e)}")
        conn.rollback()
        cursor.close()
        conn.close()
        return False


def convertir_reserva_a_compra(id_reserva, fk_compra):
    """
    Marca una reserva como convertida a compra
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE reserva
            SET convertida_compra = 1, activa = 0
            WHERE id_reserva = %s
        """, (id_reserva,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"Error al convertir reserva: {str(e)}")
        conn.rollback()
        cursor.close()
        conn.close()
        return False


def procesar_reservas_expiradas():
    """
    CA-5.3.4: Procesa reservas expiradas y libera stock
    Esta función debe ejecutarse periódicamente (cron job)
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Obtener reservas expiradas
        cursor.execute("""
            SELECT id_reserva, fk_producto, cantidad
            FROM reserva
            WHERE activa = 1
                AND convertida_compra = 0
                AND fecha_exp < NOW()
        """)
        
        reservas_expiradas = cursor.fetchall()
        
        for reserva in reservas_expiradas:
            # Devolver stock
            cursor.execute("""
                UPDATE producto
                SET stock = stock + %s
                WHERE id_producto = %s
            """, (reserva['cantidad'], reserva['fk_producto']))
            
            # Desactivar reserva
            cursor.execute("""
                UPDATE reserva
                SET activa = 0
                WHERE id_reserva = %s
            """, (reserva['id_reserva'],))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return len(reservas_expiradas)
        
    except Exception as e:
        print(f"Error al procesar reservas expiradas: {str(e)}")
        conn.rollback()
        cursor.close()
        conn.close()
        return 0


def obtener_reservas_proximas_expirar(horas=24):
    """
    CA-5.3.3: Obtiene reservas que están próximas a expirar
    Para enviar notificaciones
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT 
                r.id_reserva,
                r.fk_usuario,
                r.fk_producto,
                r.cantidad,
                r.fecha_exp,
                p.nombre_producto,
                u.email,
                u.primer_nombre,
                TIMESTAMPDIFF(HOUR, NOW(), r.fecha_exp) as horas_restantes
            FROM reserva r
            INNER JOIN producto p ON r.fk_producto = p.id_producto
            INNER JOIN usuario u ON r.fk_usuario = u.id_usuario
            WHERE r.activa = 1
                AND r.convertida_compra = 0
                AND r.fecha_exp > NOW()
                AND TIMESTAMPDIFF(HOUR, NOW(), r.fecha_exp) <= %s
        """
        
        cursor.execute(sql, (horas,))
        reservas = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return reservas
        
    except Exception as e:
        print(f"Error al obtener reservas próximas a expirar: {str(e)}")
        cursor.close()
        conn.close()
        return []


# ============================================
# HU-5.4: LÓGICA DE ENVÍO
# ============================================

def calcular_tiempo_entrega(fk_usuario):
    """
    CA-5.4.1: Calcula tiempo de entrega según membresía
    CA-5.4.2: Usuarios premium tienen menor tiempo
    """
    membresia = obtener_membresia_activa(fk_usuario)
    
    if membresia and membresia['es_valida'] == 1:
        # Usuario premium
        dias_entrega = membresia['dias_envio_red'] or 2
        es_prioritario = True
        tipo = 'Premium - Entrega Prioritaria'
    else:
        # Usuario regular
        dias_entrega = 5
        es_prioritario = False
        tipo = 'Regular'
    
    fecha_estimada = datetime.now() + timedelta(days=dias_entrega)
    
    return {
        'dias_estimados': dias_entrega,
        'fecha_estimada': fecha_estimada.isoformat(),
        'es_prioritario': es_prioritario,
        'tipo_envio': tipo
    }


def obtener_estados_envio():
    """
    Obtiene todos los estados de envío disponibles
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        cursor.execute("SELECT * FROM estado_envio ORDER BY id_estado")
        estados = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return estados
        
    except Exception as e:
        print(f"Error al obtener estados de envío: {str(e)}")
        cursor.close()
        conn.close()
        return []


def obtener_historial_envio(id_envio):
    """
    CA-5.4.3: Obtiene el historial completo de un envío para rastreo
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT 
                e.id_envio,
                e.fk_compra,
                e.direccion_entrega,
                e.fecha_estimada,
                e.es_prioritario,
                e.dias_estimados,
                es.id_estado,
                es.nombre as estado_nombre,
                es.descripcion as estado_descripcion,
                c.fecha_compra,
                c.total,
                u.primer_nombre,
                u.primer_apellido,
                u.telefono,
                u.email
            FROM envio e
            INNER JOIN estado_envio es ON e.fk_estado_envio = es.id_estado
            INNER JOIN compra c ON e.fk_compra = c.id_compra
            INNER JOIN usuario u ON c.fk_comprador = u.id_usuario
            WHERE e.id_envio = %s
        """
        
        cursor.execute(sql, (id_envio,))
        envio = cursor.fetchone()
        
        cursor.close()
        conn.close()
        
        return envio
        
    except Exception as e:
        print(f"Error al obtener historial de envío: {str(e)}")
        cursor.close()
        conn.close()
        return None


def actualizar_estado_envio(id_envio, nuevo_estado_id):
    """
    Actualiza el estado de un envío
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE envio
            SET fk_estado_envio = %s
            WHERE id_envio = %s
        """, (nuevo_estado_id, id_envio))
        
        conn.commit()
        filas_afectadas = cursor.rowcount
        
        cursor.close()
        conn.close()
        
        return filas_afectadas > 0
        
    except Exception as e:
        print(f"Error al actualizar estado de envío: {str(e)}")
        conn.rollback()
        cursor.close()
        conn.close()
        return False


def obtener_envios_usuario(fk_usuario):
    """
    Obtiene todos los envíos de un usuario con seguimiento
    """
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    
    try:
        sql = """
            SELECT 
                e.id_envio,
                e.fk_compra,
                e.direccion_entrega,
                e.fecha_estimada,
                e.es_prioritario,
                e.dias_estimados,
                es.nombre as estado,
                es.descripcion as estado_descripcion,
                c.fecha_compra,
                c.total,
                c.id_compra as numero_orden
            FROM envio e
            INNER JOIN estado_envio es ON e.fk_estado_envio = es.id_estado
            INNER JOIN compra c ON e.fk_compra = c.id_compra
            WHERE c.fk_comprador = %s
            ORDER BY c.fecha_compra DESC
        """
        
        cursor.execute(sql, (fk_usuario,))
        envios = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        return envios
        
    except Exception as e:
        print(f"Error al obtener envíos del usuario: {str(e)}")
        cursor.close()
        conn.close()
        return []