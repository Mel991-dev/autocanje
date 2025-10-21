import jwt
import datetime

SECRET_KEY = "clave_super_secreta"  # cámbiala por una variable de entorno

def generar_token(usuario_id, rol=None):
    """
    Genera un token JWT con el ID del usuario y opcionalmente sus roles
    
    Args:
        usuario_id: ID del usuario
        rol: Diccionario con roles (es_admin, es_vendedor, es_comprador)
    
    Returns:
        Token JWT como string
    """
    payload = {
        "usuario_id": usuario_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=3),
        "iat": datetime.datetime.utcnow()
    }
    
    # Agregar roles al payload si existen
    if rol:
        payload["rol"] = rol
    
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def verificar_token(token):
    """
    Verifica y decodifica un token JWT
    
    Args:
        token: Token JWT a verificar
    
    Returns:
        Payload decodificado o None si el token es inválido/expirado
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None