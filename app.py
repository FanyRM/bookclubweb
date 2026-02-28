from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
import os
from extensions import mongo
from routes.youtube import youtube_bp

app = Flask(__name__)
app.config["MONGO_URI"] = os.environ.get("MONGO_URI", "mongodb://localhost:27017/bookclub")
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "bookclub-secret-key-2024")

mongo.init_app(app)
CORS(app)

from routes.usuarios import usuarios_bp
from routes.libros import libros_bp
from routes.criticas import criticas_bp
from routes.foros import foros_bp
from routes.reuniones import reuniones_bp
from routes.auth import auth_bp
from routes.pages import pages_bp

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(usuarios_bp, url_prefix="/api/usuarios")
app.register_blueprint(libros_bp, url_prefix="/api/libros")
app.register_blueprint(criticas_bp, url_prefix="/api/criticas")
app.register_blueprint(foros_bp, url_prefix="/api/foros")
app.register_blueprint(reuniones_bp, url_prefix="/api/reuniones")
app.register_blueprint(youtube_bp, url_prefix="/api/youtube")
app.register_blueprint(pages_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
