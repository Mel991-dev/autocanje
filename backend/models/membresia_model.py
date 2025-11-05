from config.database import conexion

def get_all_membresias():
    db = conexion()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM membresias")
    membresias = cursor.fetchall()
    cursor.close()
    db.close()
    return membresias

def get_membresia_by_id(id_membresia):
    db = conexion()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM membresias WHERE id_membresia = %s", (id_membresia,))
    membresia = cursor.fetchone()
    cursor.close()
    db.close()
    return membresia

def create_membresia(nombre, descripcion, precio, duracion_meses, beneficios):
    db = conexion()
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO membresias (nombre, descripcion, precio, duracion_meses, beneficios)
        VALUES (%s, %s, %s, %s, %s)
    """, (nombre, descripcion, precio, duracion_meses, beneficios))
    db.commit()
    cursor.close()
    db.close()
    return True

def update_membresia(id_membresia, nombre, descripcion, precio, duracion_meses, beneficios):
    db = conexion()
    cursor = db.cursor()
    cursor.execute("""
        UPDATE membresias
        SET nombre=%s, descripcion=%s, precio=%s, duracion_meses=%s, beneficios=%s
        WHERE id_membresia=%s
    """, (nombre, descripcion, precio, duracion_meses, beneficios, id_membresia))
    db.commit()
    cursor.close()
    db.close()
    return True

def delete_membresia(id_membresia):
    db = conexion()
    cursor = db.cursor()
    cursor.execute("DELETE FROM membresias WHERE id_membresia=%s", (id_membresia,))
    db.commit()
    cursor.close()
    db.close()
    return True
