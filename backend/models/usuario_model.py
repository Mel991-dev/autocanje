# models/usuario_model.py
from config.database import conexion

def crear_usuario(identificacion, primer_nombre, segundo_nombre, primer_apellido,
                  segundo_apellido, email, contrasena_hash, telefono, direccion,
                  es_vendedor=False, es_comprador=True, es_admin=False):
    conn = conexion()
    cursor = conn.cursor()
    sql = """
        INSERT INTO usuario
        (identificacion, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
         email, contrasena, telefono, direccion, es_vendedor, es_comprador, es_admin)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (identificacion, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
              email, contrasena_hash, telefono, direccion, int(es_vendedor), int(es_comprador), int(es_admin))
    cursor.execute(sql, params)
    conn.commit()
    last_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return last_id

def obtener_usuario_por_email(email):
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuario WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user

def obtener_usuario_por_id(id_usuario):
    conn = conexion()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuario WHERE id_usuario = %s", (id_usuario,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user

def actualizar_usuario(id_usuario, datos):
    """
    Actualiza campos específicos de un usuario
    """
    conn = conexion()
    cursor = conn.cursor()
    
    try:
        # Construir query dinámicamente
        campos = []
        valores = []
        
        for campo, valor in datos.items():
            campos.append(f"{campo} = %s")
            valores.append(valor)
        
        # Agregar id_usuario al final
        valores.append(id_usuario)
        
        sql = f"UPDATE usuario SET {', '.join(campos)} WHERE id_usuario = %s"
        
        cursor.execute(sql, valores)
        conn.commit()
        
        filas_afectadas = cursor.rowcount
        cursor.close()
        conn.close()
        
        return filas_afectadas > 0
        
    except Exception as e:
        print(f"Error al actualizar usuario: {str(e)}")
        cursor.close()
        conn.close()
        return False

def existe_identificacion(identificacion):
    conn = conexion()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM usuario WHERE identificacion = %s", (identificacion,))
    exists = cursor.fetchone() is not None
    cursor.close()
    conn.close()
    return exists

def existe_telefono(telefono):
    conn = conexion()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM usuario WHERE telefono = %s", (telefono,))
    exists = cursor.fetchone() is not None
    cursor.close()
    conn.close()
    return exists
