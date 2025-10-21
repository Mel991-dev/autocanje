from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password):
    print("🔐 Generando hash con Werkzeug")
    return generate_password_hash(password)

def verify_password(password, hashed):
    print(f"🔍 Verificando password con Werkzeug")
    print(f"   Hash recibido: {hashed[:40]}...")
    resultado = check_password_hash(hashed, password)
    print(f"   Resultado: {'✓ VÁLIDO' if resultado else '✗ INVÁLIDO'}")
    return resultado