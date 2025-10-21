# utils/auth_middleware.py
from functools import wraps
from flask import request, jsonify
from utils.jwt_manager import verificar_token

def token_requerido(f):
    """
    Decorador para proteger rutas que requieren autenticación
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Obtener token del header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Formato: "Bearer <token>"
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({
                    'success': False,
                    'error': 'Formato de token inválido'
                }), 401
        
        if not token:
            return jsonify({
                'success': False,
                'error': 'Token de autenticación requerido'
            }), 401
        
        # Verificar token
        payload = verificar_token(token)
        
        if not payload:
            return jsonify({
                'success': False,
                'error': 'Token inválido o expirado'
            }), 401
        
        # Pasar el usuario_id a la función
        return f(payload['usuario_id'], *args, **kwargs)
    
    return decorated