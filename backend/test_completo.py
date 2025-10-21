# test_completo.py
from utils.hash import hash_password, verify_password

# Simular registro
password_original = "12345678"
print(f"Password original: '{password_original}'")
print(f"Longitud: {len(password_original)}")

# Generar hash (como en el registro)
hash_generado = hash_password(password_original)
print(f"\nHash generado:\n{hash_generado}")

# Verificar inmediatamente (como en el login)
resultado = verify_password(password_original, hash_generado)
print(f"\nVerificación inmediata: {resultado}")

# Si falla, probar variaciones
if not resultado:
    print("\n❌ FALLÓ - Probando variaciones:")
    variaciones = [
        password_original.strip(),
        password_original + "\n",
        password_original + "\r\n",
        password_original.encode('utf-8').decode('utf-8')
    ]
    
    for i, var in enumerate(variaciones):
        test = verify_password(var, hash_generado)
        print(f"  Variación {i+1}: {repr(var)} = {test}")