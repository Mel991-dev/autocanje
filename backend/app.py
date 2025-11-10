# app.py
from flask import Flask, send_from_directory
from routes.auth_routes import auth_bp
from routes.producto_routes import producto_bp
from routes.catalogo_routes import catalogo_bp
from routes.carrito_routes import carrito_bp
from routes.compra_routes import compra_bp
from routes.valoracion_routes import valoracion_bp
from routes.membresia_routes import membresia_bp
import os

app = Flask(__name__)

# Servir archivos estáticos (imágenes)
@app.route('/uploads/productos/<path:filename>')
def uploaded_file(filename):
    return send_from_directory('uploads/productos', filename)

# Endpoint alternativo para compatibilidad
@app.route('/uploads/<path:filename>')
def uploaded_file_legacy(filename):
    """Endpoint de compatibilidad para rutas antiguas"""
    # Primero intenta buscar en productos/
    if os.path.exists(os.path.join('uploads/productos', filename)):
        return send_from_directory('uploads/productos', filename)
    # Si no, busca en la raíz de uploads/
    return send_from_directory('uploads', filename)

@app.before_request
def handle_preflight():
    from flask import request, make_response
    if request.method == "OPTIONS":
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'  # ✅ PATCH incluido
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Max-Age'] = '3600'
        return response, 200

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'  # ✅ PATCH incluido
    return response

app.register_blueprint(auth_bp)
app.register_blueprint(producto_bp)
app.register_blueprint(catalogo_bp)
app.register_blueprint(carrito_bp)
app.register_blueprint(compra_bp)
app.register_blueprint(valoracion_bp)
app.register_blueprint(membresia_bp)


if __name__ == "__main__":
    # Crear carpeta de uploads si no existe
    os.makedirs('uploads/productos', exist_ok=True)
    print("🚀 Servidor iniciado en http://127.0.0.1:5000")
    print("📁 Carpeta de uploads verificada")
    app.run(debug=True, host='127.0.0.1', port=5000)