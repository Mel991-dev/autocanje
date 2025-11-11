# backend/utils/premium_middleware.py

from functools import wraps
from flask import jsonify, request
from models.membresia_model import verificar_es_premium, obtener_membresia_activa

def premium_requerido(f):
    """
    Decorator para validar que el usuario tenga membresía premium activa.
    
    Uso:
    @token_requerido
    @premium_requerido
    def mi_endpoint_premium(usuario_id):
        # código del endpoint
    
    Debe usarse DESPUÉS de @token_requerido ya que necesita el usuario_id
    """
    @wraps(f)
    def decorated(usuario_id, *args, **kwargs):
        try:
            # Verificar si el usuario tiene membresía premium activa
            if not verificar_es_premium(usuario_id):
                return jsonify({
                    'success': False,
                    'error': 'Se requiere membresía premium activa para acceder a este beneficio',
                    'premium_required': True,
                    'upgrade_url': '/premium'
                }), 403
            
            # Si es premium, ejecutar la función
            return f(usuario_id, *args, **kwargs)
            
        except Exception as e:
            print(f"Error en middleware premium: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Error al verificar membresía premium'
            }), 500
    
    return decorated


def premium_opcional(f):
    """
    Decorator para endpoints donde la membresía premium es opcional
    pero otorga beneficios adicionales.
    
    Inyecta la información de membresía en el endpoint sin bloquear el acceso.
    
    Uso:
    @token_requerido
    @premium_opcional
    def mi_endpoint(usuario_id, es_premium=False, membresia=None):
        if es_premium:
            # Aplicar beneficios premium
        else:
            # Comportamiento regular
    """
    @wraps(f)
    def decorated(usuario_id, *args, **kwargs):
        try:
            # Obtener información de membresía
            membresia = obtener_membresia_activa(usuario_id)
            es_premium = membresia is not None and membresia['es_valida'] == 1
            
            # Inyectar información en el endpoint
            kwargs['es_premium'] = es_premium
            kwargs['membresia'] = membresia
            
            return f(usuario_id, *args, **kwargs)
            
        except Exception as e:
            print(f"Error en middleware premium opcional: {str(e)}")
            # En caso de error, continuar sin membresía
            kwargs['es_premium'] = False
            kwargs['membresia'] = None
            return f(usuario_id, *args, **kwargs)
    
    return decorated


def validar_beneficio_premium(usuario_id, beneficio_requerido):
    """
    Función auxiliar para validar beneficios específicos de la membresía.
    
    Args:
        usuario_id: ID del usuario
        beneficio_requerido: 'reservas', 'descuento', 'envio_prioritario'
    
    Returns:
        tuple: (bool, dict) - (es_valido, info_membresia)
    """
    try:
        membresia = obtener_membresia_activa(usuario_id)
        
        if not membresia or membresia['es_valida'] != 1:
            return False, None
        
        # Validar beneficio específico según el tipo
        if beneficio_requerido == 'reservas':
            if not membresia.get('permite_reservas', False):
                return False, membresia
        
        elif beneficio_requerido == 'descuento':
            if not membresia.get('porc_descuento', 0) > 0:
                return False, membresia
        
        elif beneficio_requerido == 'envio_prioritario':
            if not membresia.get('dias_envio_red', 0) > 0:
                return False, membresia
        
        return True, membresia
        
    except Exception as e:
        print(f"Error al validar beneficio premium: {str(e)}")
        return False, None


def validar_limite_beneficio(usuario_id, tipo_beneficio, limite_permitido):
    """
    Valida límites de uso de beneficios premium.
    
    Ejemplo: Validar que un usuario no tenga más de X reservas activas.
    
    Args:
        usuario_id: ID del usuario
        tipo_beneficio: 'reservas', 'descuentos_mes', etc.
        limite_permitido: número máximo permitido
    
    Returns:
        tuple: (bool, int) - (dentro_del_limite, uso_actual)
    """
    try:
        from config.database import conexion
        
        conn = conexion()
        cursor = conn.cursor(dictionary=True)
        
        uso_actual = 0
        
        if tipo_beneficio == 'reservas':
            # Contar reservas activas del usuario
            cursor.execute("""
                SELECT COUNT(*) as total
                FROM reserva
                WHERE fk_usuario = %s 
                    AND activa = 1 
                    AND convertida_compra = 0
                    AND fecha_exp > NOW()
            """, (usuario_id,))
            
            resultado = cursor.fetchone()
            uso_actual = resultado['total'] if resultado else 0
        
        cursor.close()
        conn.close()
        
        return uso_actual < limite_permitido, uso_actual
        
    except Exception as e:
        print(f"Error al validar límite de beneficio: {str(e)}")
        return False, 0


# ============================================
# DECORADORES ESPECÍFICOS POR BENEFICIO
# ============================================

def reservas_requerido(f):
    """
    Decorator específico para endpoints que requieren el beneficio de reservas.
    """
    @wraps(f)
    def decorated(usuario_id, *args, **kwargs):
        es_valido, membresia = validar_beneficio_premium(usuario_id, 'reservas')
        
        if not es_valido:
            return jsonify({
                'success': False,
                'error': 'Tu plan premium no incluye el beneficio de reservas',
                'upgrade_required': True
            }), 403
        
        return f(usuario_id, *args, **kwargs)
    
    return decorated


def descuento_disponible(f):
    """
    Decorator para verificar que el usuario tenga beneficio de descuento.
    """
    @wraps(f)
    def decorated(usuario_id, *args, **kwargs):
        es_valido, membresia = validar_beneficio_premium(usuario_id, 'descuento')
        
        if not es_valido:
            return jsonify({
                'success': False,
                'error': 'No tienes descuentos disponibles en tu plan',
                'descuento': 0
            }), 200  # No es error 403, solo sin descuento
        
        return f(usuario_id, *args, **kwargs)
    
    return decorated


def envio_prioritario_disponible(f):
    """
    Decorator para endpoints de envío que requieren membresía premium.
    """
    @wraps(f)
    def decorated(usuario_id, *args, **kwargs):
        es_valido, membresia = validar_beneficio_premium(usuario_id, 'envio_prioritario')
        
        if not es_valido:
            # No bloquear, pero marcar como envío regular
            kwargs['es_prioritario'] = False
            kwargs['dias_envio'] = 5  # Días regulares
        else:
            kwargs['es_prioritario'] = True
            kwargs['dias_envio'] = membresia['dias_envio_red']
        
        return f(usuario_id, *args, **kwargs)
    
    return decorated


# ============================================
# FUNCIÓN DE LOGGING PARA AUDITORÍA
# ============================================

def log_uso_beneficio(usuario_id, tipo_beneficio, detalles=None):
    """
    Registra el uso de beneficios premium para auditoría y análisis.
    
    Args:
        usuario_id: ID del usuario
        tipo_beneficio: 'reserva', 'descuento', 'envio_prioritario'
        detalles: dict con información adicional
    """
    try:
        from datetime import datetime
        print(f"[PREMIUM] {datetime.now()} - Usuario {usuario_id} usó beneficio: {tipo_beneficio}")
        if detalles:
            print(f"[PREMIUM] Detalles: {detalles}")
        
        # Aquí podrías guardar en una tabla de auditoría si lo necesitas
        # INSERT INTO auditoria_premium (usuario_id, tipo_beneficio, fecha, detalles)
        
    except Exception as e:
        print(f"Error al registrar uso de beneficio: {str(e)}")


# ============================================
# EXPORTAR DECORADORES
# ============================================

__all__ = [
    'premium_requerido',
    'premium_opcional',
    'reservas_requerido',
    'descuento_disponible',
    'envio_prioritario_disponible',
    'validar_beneficio_premium',
    'validar_limite_beneficio',
    'log_uso_beneficio'
]