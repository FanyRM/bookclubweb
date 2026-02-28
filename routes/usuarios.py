from flask import Blueprint, request, jsonify, session
from extensions import mongo
from bson import ObjectId
import hashlib
import datetime

usuarios_bp = Blueprint("usuarios", __name__)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def serialize(doc):
    if doc:
        doc["id"] = str(doc.pop("_id"))
    return doc

@usuarios_bp.route("/", methods=["POST"])
def crear_usuario():
    data = request.json
    # Check unique username/email
    if mongo.db.usuarios.find_one({"NombreUsuario": data.get("NombreUsuario")}):
        return jsonify({"error": "NombreUsuario ya existe"}), 400
    if mongo.db.usuarios.find_one({"correoElectronico": data.get("correoElectronico")}):
        return jsonify({"error": "Correo ya registrado"}), 400
    usuario = {
        "Etiquetas": data.get("Etiquetas", []),
        "Nombre": data.get("Nombre", ""),
        "ApellidoP": data.get("ApellidoP", ""),
        "ApellidoM": data.get("ApellidoM", ""),
        "Edad": data.get("Edad", ""),
        "correoElectronico": data.get("correoElectronico", ""),
        "NombreUsuario": data.get("NombreUsuario", ""),
        "Password": hash_password(data.get("Password", "")),
        "Descripcion": data.get("Descripcion", ""),
        "fotoDePerfil": data.get("fotoDePerfil", ""),
        "fechaCreacion": datetime.datetime.utcnow()
    }
    result = mongo.db.usuarios.insert_one(usuario)
    usuario["id"] = str(result.inserted_id)
    usuario.pop("_id", None)
    usuario.pop("Password", None)
    return jsonify({"success": True, "usuario": usuario}), 201

@usuarios_bp.route("/", methods=["GET"])
def listar_usuarios():
    usuarios = list(mongo.db.usuarios.find({}, {"Password": 0}))
    for u in usuarios:
        u["id"] = str(u.pop("_id"))
    return jsonify(usuarios)

@usuarios_bp.route("/<user_id>", methods=["GET"])
def obtener_usuario(user_id):
    try:
        u = mongo.db.usuarios.find_one({"_id": ObjectId(user_id)}, {"Password": 0})
        if not u:
            return jsonify({"error": "No encontrado"}), 404
        u["id"] = str(u.pop("_id"))
        # Get books and reviews
        libros = list(mongo.db.libros.find({"idUsuarioCreador": user_id}))
        for l in libros:
            l["id"] = str(l.pop("_id"))
        criticas = list(mongo.db.criticas.find({"idUsuario": user_id}))
        for c in criticas:
            c["id"] = str(c.pop("_id"))
        u["libros"] = libros
        u["criticas"] = criticas
        return jsonify(u)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@usuarios_bp.route("/<user_id>", methods=["PUT"])
def editar_usuario(user_id):
    data = request.json
    update = {}
    for field in ["Etiquetas","Nombre","ApellidoP","ApellidoM","Edad","correoElectronico","Descripcion","fotoDePerfil","youtubeChannelId"]:
        if field in data:
            update[field] = data[field]
    if "Password" in data and data["Password"]:
        update["Password"] = hash_password(data["Password"])
    mongo.db.usuarios.update_one({"_id": ObjectId(user_id)}, {"$set": update})
    return jsonify({"success": True})

@usuarios_bp.route("/<user_id>", methods=["DELETE"])
def eliminar_usuario(user_id):
    mongo.db.usuarios.delete_one({"_id": ObjectId(user_id)})
    return jsonify({"success": True})
