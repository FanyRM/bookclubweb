from flask import Blueprint, render_template

pages_bp = Blueprint("pages", __name__)

@pages_bp.route("/")
def index():
    return render_template("index.html")

@pages_bp.route("/login")
def login():
    return render_template("index.html")

@pages_bp.route("/registro")
def registro():
    return render_template("index.html")

@pages_bp.route("/libros")
def libros():
    return render_template("index.html")

@pages_bp.route("/libros/<libro_id>")
def libro_detalle(libro_id):
    return render_template("index.html")

@pages_bp.route("/perfil/<user_id>")
def perfil(user_id):
    return render_template("index.html")

@pages_bp.route("/criticas/<critica_id>")
def critica_detalle(critica_id):
    return render_template("index.html")

@pages_bp.route("/reuniones")
def reuniones():
    return render_template("index.html")

@pages_bp.route("/reuniones/<reunion_id>")
def reunion_detalle(reunion_id):
    return render_template("index.html")
