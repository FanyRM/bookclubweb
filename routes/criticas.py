from flask import Blueprint, request, jsonify, session
from extensions import mongo
from bson import ObjectId
import datetime

criticas_bp = Blueprint("criticas", __name__)

@criticas_bp.route("/", methods=["POST"])
def crear_critica():
    data = request.json
    critica = {
        "idLibro": data.get("idLibro", ""),
        "idUsuario": data.get("idUsuario", session.get("user_id","")),
        "Titulo": data.get("Titulo", ""),
        "Contenido": data.get("Contenido", ""),  # rich text HTML
        "Calificacion": data.get("Calificacion", 0),
        "fechaCreacion": datetime.datetime.utcnow()
    }
    result = mongo.db.criticas.insert_one(critica)
    critica["id"] = str(result.inserted_id)
    critica.pop("_id", None)
    return jsonify({"success": True, "critica": critica}), 201

@criticas_bp.route("/", methods=["GET"])
def listar_criticas():
    libro_id = request.args.get("idLibro")
    query = {}
    if libro_id:
        query["idLibro"] = libro_id
    criticas = list(mongo.db.criticas.find(query))
    for c in criticas:
        c["id"] = str(c.pop("_id"))
        try:
            user = mongo.db.usuarios.find_one({"_id": ObjectId(c["idUsuario"])}, {"NombreUsuario":1,"fotoDePerfil":1,"Nombre":1})
            if user:
                user["id"] = str(user.pop("_id"))
                c["usuario"] = user
        except:
            pass
    return jsonify(criticas)

@criticas_bp.route("/<critica_id>", methods=["GET"])
def obtener_critica(critica_id):
    c = mongo.db.criticas.find_one({"_id": ObjectId(critica_id)})
    if not c:
        return jsonify({"error": "No encontrado"}), 404
    c["id"] = str(c.pop("_id"))
    try:
        user = mongo.db.usuarios.find_one({"_id": ObjectId(c["idUsuario"])}, {"NombreUsuario":1,"fotoDePerfil":1,"Nombre":1,"ApellidoP":1})
        if user:
            user["id"] = str(user.pop("_id"))
            c["usuario"] = user
        libro = mongo.db.libros.find_one({"_id": ObjectId(c["idLibro"])}, {"NombreLibro":1,"Portada":1})
        if libro:
            libro["id"] = str(libro.pop("_id"))
            c["libro"] = libro
    except:
        pass
    return jsonify(c)

@criticas_bp.route("/<critica_id>", methods=["PUT"])
def editar_critica(critica_id):
    data = request.json
    update = {}
    for field in ["Titulo","Contenido","Calificacion"]:
        if field in data:
            update[field] = data[field]
    mongo.db.criticas.update_one({"_id": ObjectId(critica_id)}, {"$set": update})
    return jsonify({"success": True})

@criticas_bp.route("/<critica_id>", methods=["DELETE"])
def eliminar_critica(critica_id):
    mongo.db.criticas.delete_one({"_id": ObjectId(critica_id)})
    return jsonify({"success": True})
