from flask import Blueprint, request, jsonify, session
from extensions import mongo
from bson import ObjectId
import datetime

libros_bp = Blueprint("libros", __name__)

@libros_bp.route("/", methods=["POST"])
def crear_libro():
    data = request.json
    libro = {
        "NombreLibro": data.get("NombreLibro", ""),
        "idUsuarioCreador": data.get("idUsuarioCreador", session.get("user_id","")),
        "Portada": data.get("Portada", ""),
        "Descripcion": data.get("Descripcion", ""),
        "Calificacion": data.get("Calificacion", 0),
        "DondeLeer": data.get("DondeLeer", []),
        "fechaCreacion": datetime.datetime.utcnow()
    }
    result = mongo.db.libros.insert_one(libro)
    libro["id"] = str(result.inserted_id)
    libro.pop("_id", None)
    return jsonify({"success": True, "libro": libro}), 201

@libros_bp.route("/", methods=["GET"])
def listar_libros():
    libros = list(mongo.db.libros.find({}))
    for l in libros:
        l["id"] = str(l.pop("_id"))
        # Enrich with creator
        try:
            creator = mongo.db.usuarios.find_one({"_id": ObjectId(l["idUsuarioCreador"])}, {"NombreUsuario":1,"Nombre":1,"fotoDePerfil":1})
            if creator:
                creator["id"] = str(creator.pop("_id"))
                l["creador"] = creator
        except:
            pass
    return jsonify(libros)

@libros_bp.route("/<libro_id>", methods=["GET"])
def obtener_libro(libro_id):
    try:
        l = mongo.db.libros.find_one({"_id": ObjectId(libro_id)})
        if not l:
            return jsonify({"error": "No encontrado"}), 404
        l["id"] = str(l.pop("_id"))
        # Enrich
        try:
            creator = mongo.db.usuarios.find_one({"_id": ObjectId(l["idUsuarioCreador"])}, {"NombreUsuario":1,"Nombre":1,"fotoDePerfil":1,"ApellidoP":1})
            if creator:
                creator["id"] = str(creator.pop("_id"))
                l["creador"] = creator
        except:
            pass
        # Get criticas
                # Get criticas
        criticas = list(mongo.db.criticas.find({"idLibro": libro_id}))
        for c in criticas:
            c["id"] = str(c.pop("_id"))
            # Enriquecer con datos del usuario
            try:
                user = mongo.db.usuarios.find_one({"_id": ObjectId(c["idUsuario"])}, {"NombreUsuario":1,"fotoDePerfil":1,"Nombre":1})
                if user:
                    user["id"] = str(user.pop("_id"))
                    c["usuario"] = user
            except:
                pass
        l["criticas"] = criticas
        return jsonify(l)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@libros_bp.route("/<libro_id>", methods=["PUT"])
def editar_libro(libro_id):
    data = request.json
    update = {}
    for field in ["NombreLibro","Portada","Descripcion","Calificacion","DondeLeer"]:
        if field in data:
            update[field] = data[field]
    mongo.db.libros.update_one({"_id": ObjectId(libro_id)}, {"$set": update})
    return jsonify({"success": True})

@libros_bp.route("/<libro_id>", methods=["DELETE"])
def eliminar_libro(libro_id):
    mongo.db.libros.delete_one({"_id": ObjectId(libro_id)})
    return jsonify({"success": True})
