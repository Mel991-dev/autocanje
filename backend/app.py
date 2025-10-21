from flask import Flask
from routes.auth_routes import auth_bp

app = Flask(__name__)

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

if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port=5000)