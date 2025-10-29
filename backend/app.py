from flask import Flask, send_from_directory
from routes.auth_routes import auth_bp
from routes.producto_routes import producto_bp
from routes.catalogo_routes import catalogo_bp
import os

app = Flask(__name__)

# Servir archivos estáticos (imágenes)
@app.route('/uploads/productos/<path:filename>')
def uploaded_file(filename):
    return send_from_directory('uploads/productos', filename)

# AGREGAR: Endpoint alternativo para compatibilidad
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
    from flask import request
    if request.method == "OPTIONS":
        from flask import make_response
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        return response, 200

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response

app.register_blueprint(auth_bp)
app.register_blueprint(producto_bp)
app.register_blueprint(catalogo_bp)

if __name__ == "__main__":
    # Crear carpeta de uploads si no existe
    os.makedirs('uploads/productos', exist_ok=True)
    app.run(debug=True, host='127.0.0.1', port=5000)