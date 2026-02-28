from flask import Blueprint, request, jsonify, session
from extensions import mongo
from bson import ObjectId
import datetime

reuniones_bp = Blueprint("reuniones", __name__)

@reuniones_bp.route("/", methods=["POST"])
def crear_reunion():
    data = request.json
    reunion = {
        "NombreReunion": data.get("NombreReunion", ""),
        "IdUsuarioCreador": data.get("IdUsuarioCreador", session.get("user_id","")),
        "ReunionRecurrente": data.get("ReunionRecurrente", False),
        "Lugar": data.get("Lugar", {"Latitud": 0, "Longitud": 0, "Direccion": ""}),
        "DescripcionReunion": data.get("DescripcionReunion", ""),
        "status": data.get("status", "activa"),
        "fechaCreacion": datetime.datetime.utcnow()
    }
    if reunion["ReunionRecurrente"]:
        reunion["DiaSemana"] = data.get("DiaSemana", "")
        reunion["Hora"] = data.get("Hora", "")
    else:
        reunion["FechaReunion"] = data.get("FechaReunion", "")
        reunion["Hora"] = data.get("Hora", "")
    result = mongo.db.reuniones.insert_one(reunion)
    reunion["id"] = str(result.inserted_id)
    reunion.pop("_id", None)
    return jsonify({"success": True, "reunion": reunion}), 201

@reuniones_bp.route("/", methods=["GET"])
def listar_reuniones():
    reuniones = list(mongo.db.reuniones.find({}))
    for r in reuniones:
        r["id"] = str(r.pop("_id"))
        try:
            user = mongo.db.usuarios.find_one({"_id": ObjectId(r["IdUsuarioCreador"])}, {"NombreUsuario":1,"Nombre":1})
            if user:
                user["id"] = str(user.pop("_id"))
                r["creador"] = user
        except:
            pass
    return jsonify(reuniones)

@reuniones_bp.route("/<reunion_id>", methods=["GET"])
def obtener_reunion(reunion_id):
    try:
        r = mongo.db.reuniones.find_one({"_id": ObjectId(reunion_id)})
        if not r:
            return jsonify({"error": "No encontrado"}), 404
        r["id"] = str(r.pop("_id"))
        try:
            user = mongo.db.usuarios.find_one({"_id": ObjectId(r["IdUsuarioCreador"])}, {"NombreUsuario":1,"Nombre":1,"fotoDePerfil":1})
            if user:
                user["id"] = str(user.pop("_id"))
                r["creador"] = user
        except:
            pass
        return jsonify(r)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@reuniones_bp.route("/<reunion_id>", methods=["PUT"])
def editar_reunion(reunion_id):
    data = request.json
    update = {}
    for field in ["NombreReunion","ReunionRecurrente","Lugar","DescripcionReunion","status","DiaSemana","Hora","FechaReunion"]:
        if field in data:
            update[field] = data[field]
    mongo.db.reuniones.update_one({"_id": ObjectId(reunion_id)}, {"$set": update})
    return jsonify({"success": True})

@reuniones_bp.route("/<reunion_id>", methods=["DELETE"])
def eliminar_reunion(reunion_id):
    mongo.db.reuniones.delete_one({"_id": ObjectId(reunion_id)})
    return jsonify({"success": True})
