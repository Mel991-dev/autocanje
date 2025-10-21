# controllers/auth_controller.py
from flask import request, jsonify
from models.usuario_model import (
    crear_usuario, obtener_usuario_por_email,
    existe_identificacion, existe_telefono,
    obtener_usuario_por_id, actualizar_usuario
)
from utils.hash import hash_password, verify_password
from utils.jwt_manager import generar_token
from utils.auth_middleware import token_requerido

def registrar_usuario():
    data = request.get_json() or {}
    identificacion = data.get("identificacion")
    primer_nombre = data.get("primer_nombre")
    segundo_nombre = data.get("segundo_nombre")
    primer_apellido = data.get("primer_apellido")
    segundo_apellido = data.get("segundo_apellido")
    email = data.get("email")
    password = data.get("contrasena")
    telefono = data.get("telefono")
    direccion = data.get("direccion")
    es_vendedor = bool(data.get("es_vendedor", False))
    es_comprador = bool(data.get("es_comprador", True))
    es_admin = bool(data.get("es_admin", False))

    # Validaciones básicas
    if not primer_nombre or not primer_apellido or not email or not password:
        return jsonify({"error": "Faltan datos obligatorios (nombres, apellidos, email o password)"}), 400

    # Validar uniqueness
    if identificacion and existe_identificacion(identificacion):
        return jsonify({"error": "La identificación ya está registrada"}), 400

    if telefono and existe_telefono(telefono):
        return jsonify({"error": "El teléfono ya está registrado"}), 400

    # Verificar si email ya existe
    if obtener_usuario_por_email(email):
        return jsonify({"error": "El email ya está registrado"}), 400

    contrasena_hash = hash_password(password)
    id_nuevo = crear_usuario(
        identificacion, primer_nombre, segundo_nombre, primer_apellido,
        segundo_apellido, email, contrasena_hash, telefono, direccion,
        es_vendedor, es_comprador, es_admin
    )

    return jsonify({"mensaje": "Usuario registrado correctamente", "id_usuario": id_nuevo}), 201


def login_usuario():
    if request.method == 'OPTIONS':
        return '', 204
        
    data = request.get_json() or {}
    
    # LOGS DETALLADOS
    print("\n" + "="*50)
    print("INTENTO DE LOGIN")
    print("="*50)
    print(f"Datos recibidos: {data}")
    
    email = data.get("email")
    password = data.get("password") or data.get("contrasena")
    
    print(f"Email: {email}")
    print(f"Password recibido: {'Sí (' + str(len(password)) + ' caracteres)' if password else 'No'}")

    if not email or not password:
        print("ERROR: Faltan email o password")
        return jsonify({
            "error": "Email y contraseña requeridos",
            "success": False
        }), 400

    usuario = obtener_usuario_por_email(email)
    
    if not usuario:
        print(f"ERROR: Usuario no encontrado para email: {email}")
        return jsonify({
            "error": "Credenciales inválidas",
            "success": False
        }), 401

    print(f"Usuario encontrado: {usuario.get('email')}")
    print(f"ID Usuario: {usuario.get('id_usuario')}")
    print(f"Hash en BD (primeros 30 chars): {usuario.get('contrasena')[:30]}...")
    
    # Verificar contraseña
    password_valida = verify_password(password, usuario.get("contrasena"))
    print(f"Verificación de password: {'VÁLIDA ✓' if password_valida else 'INVÁLIDA ✗'}")
    
    if not password_valida:
        print("ERROR: Contraseña incorrecta")
        return jsonify({
            "error": "Credenciales inválidas",
            "success": False
        }), 401

    print("LOGIN EXITOSO ✓")
    print("="*50 + "\n")

    token = generar_token(usuario.get("id_usuario"), rol={
        "es_admin": bool(usuario.get("es_admin")),
        "es_vendedor": bool(usuario.get("es_vendedor")),
        "es_comprador": bool(usuario.get("es_comprador"))
    })

    usuario_sin_password = dict(usuario)
    usuario_sin_password.pop("contrasena", None)

    return jsonify({
        "token": token,
        "usuario": usuario_sin_password,
        "success": True
    }), 200

@token_requerido
def obtener_perfil(usuario_id):
    """
    Obtiene la información del perfil del usuario autenticado
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        usuario = obtener_usuario_por_id(usuario_id)
        
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404
        
        # Eliminar contraseña de la respuesta
        usuario_sin_password = dict(usuario)
        usuario_sin_password.pop('contrasena', None)
        
        return jsonify({
            'success': True,
            'usuario': usuario_sin_password
        }), 200
        
    except Exception as e:
        print(f"Error al obtener perfil: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error al obtener perfil: {str(e)}'
        }), 500


@token_requerido
def actualizar_perfil(usuario_id):
    """
    Actualiza la información del perfil del usuario
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json() or {}
        
        # Campos permitidos para actualizar (ahora incluye email y roles)
        campos_permitidos = {
            'identificacion', 'primer_nombre', 'segundo_nombre', 
            'primer_apellido', 'segundo_apellido', 'email', 
            'telefono', 'direccion', 'es_vendedor', 
            'es_comprador', 'es_admin'
        }
        
        # Filtrar solo campos permitidos
        datos_actualizacion = {}
        for campo in campos_permitidos:
            if campo in data:
                # Convertir booleanos para roles
                if campo in ['es_vendedor', 'es_comprador', 'es_admin']:
                    datos_actualizacion[campo] = bool(data.get(campo))
                else:
                    datos_actualizacion[campo] = data.get(campo)
        
        # Validar que haya al menos un campo para actualizar
        if not datos_actualizacion:
            return jsonify({
                'success': False,
                'error': 'No hay campos para actualizar'
            }), 400
        
        # Obtener usuario actual
        usuario_actual = obtener_usuario_por_id(usuario_id)
        
        # Validar email único si se está actualizando
        if 'email' in datos_actualizacion and datos_actualizacion['email']:
            if datos_actualizacion['email'] != usuario_actual.get('email'):
                usuario_email_existente = obtener_usuario_por_email(datos_actualizacion['email'])
                if usuario_email_existente:
                    return jsonify({
                        'success': False,
                        'error': 'El email ya está registrado'
                    }), 400
        
        # Validar teléfono único si se está actualizando
        if 'telefono' in datos_actualizacion and datos_actualizacion['telefono']:
            if datos_actualizacion['telefono'] != usuario_actual.get('telefono'):
                if existe_telefono(datos_actualizacion['telefono']):
                    return jsonify({
                        'success': False,
                        'error': 'El teléfono ya está registrado'
                    }), 400
        
        # Validar identificación única si se está actualizando
        if 'identificacion' in datos_actualizacion and datos_actualizacion['identificacion']:
            if datos_actualizacion['identificacion'] != usuario_actual.get('identificacion'):
                if existe_identificacion(datos_actualizacion['identificacion']):
                    return jsonify({
                        'success': False,
                        'error': 'La identificación ya está registrada'
                    }), 400
        
        # Actualizar usuario
        actualizado = actualizar_usuario(usuario_id, datos_actualizacion)
        
        if not actualizado:
            return jsonify({
                'success': False,
                'error': 'Error al actualizar el perfil'
            }), 500
        
        # Obtener usuario actualizado
        usuario = obtener_usuario_por_id(usuario_id)
        usuario_sin_password = dict(usuario)
        usuario_sin_password.pop('contrasena', None)
        
        # Generar nuevo token con roles actualizados
        token = generar_token(usuario_id, rol={
            "es_admin": bool(usuario.get("es_admin")),
            "es_vendedor": bool(usuario.get("es_vendedor")),
            "es_comprador": bool(usuario.get("es_comprador"))
        })
        
        return jsonify({
            'success': True,
            'message': 'Perfil actualizado correctamente',
            'usuario': usuario_sin_password,
            'token': token  # Nuevo token con roles actualizados
        }), 200
        
    except Exception as e:
        print(f"Error al actualizar perfil: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Error al actualizar perfil: {str(e)}'
        }), 500


@token_requerido
def cambiar_contrasena(usuario_id):
    """
    Cambia la contraseña del usuario
    """
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json() or {}
        
        contrasena_actual = data.get('contrasena_actual')
        contrasena_nueva = data.get('contrasena_nueva')
        
        # Validaciones
        if not contrasena_actual or not contrasena_nueva:
            return jsonify({
                'success': False,
                'error': 'Se requieren la contraseña actual y la nueva'
            }), 400
        
        if len(contrasena_nueva) < 8:
            return jsonify({
                'success': False,
                'error': 'La contraseña debe tener al menos 8 caracteres'
            }), 400
        
        # Obtener usuario
        usuario = obtener_usuario_por_id(usuario_id)
        
        if not usuario:
            return jsonify({
                'success': False,
                'error': 'Usuario no encontrado'
            }), 404
        
        # Verificar contraseña actual
        if not verify_password(contrasena_actual, usuario.get('contrasena')):
            return jsonify({
                'success': False,
                'error': 'La contraseña actual es incorrecta'
            }), 401
        
        # Hash de la nueva contraseña
        nuevo_hash = hash_password(contrasena_nueva)
        
        # Actualizar contraseña
        actualizado = actualizar_usuario(usuario_id, {'contrasena': nuevo_hash})
        
        if not actualizado:
            return jsonify({
                'success': False,
                'error': 'Error al cambiar la contraseña'
            }), 500
        
        return jsonify({
            'success': True,
            'message': 'Contraseña actualizada correctamente'
        }), 200
        
    except Exception as e:
        print(f"Error al cambiar contraseña: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'Error al cambiar contraseña: {str(e)}'
        }), 500