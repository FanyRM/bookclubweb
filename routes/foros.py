from flask import Blueprint, request, jsonify, session
from extensions import mongo
from bson import ObjectId
import datetime

foros_bp = Blueprint("foros", __name__)

# tipo: "libro" o "reunion"
@foros_bp.route("/mensajes", methods=["GET"])
def listar_mensajes():
    tipo = request.args.get("tipo")
    ref_id = request.args.get("refId")
    mensajes = list(mongo.db.foros.find({"tipo": tipo, "refId": ref_id}).sort("fechaCreacion", 1))
    for m in mensajes:
        m["id"] = str(m.pop("_id"))
        try:
            user = mongo.db.usuarios.find_one({"_id": ObjectId(m["idUsuario"])}, {"NombreUsuario":1,"fotoDePerfil":1})
            if user:
                user["id"] = str(user.pop("_id"))
                m["usuario"] = user
        except:
            pass
    return jsonify(mensajes)

@foros_bp.route("/mensajes", methods=["POST"])
def crear_mensaje():
    data = request.json
    mensaje = {
        "tipo": data.get("tipo"),  # "libro" o "reunion"
        "refId": data.get("refId"),
        "idUsuario": data.get("idUsuario", session.get("user_id","")),
        "Contenido": data.get("Contenido", ""),
        "idMensajePadre": data.get("idMensajePadre"),  # Para hilos
        "fechaCreacion": datetime.datetime.utcnow()
    }
    result = mongo.db.foros.insert_one(mensaje)
    mensaje["id"] = str(result.inserted_id)
    mensaje.pop("_id", None)
    return jsonify({"success": True, "mensaje": mensaje}), 201

@foros_bp.route("/mensajes/<msg_id>", methods=["DELETE"])
def eliminar_mensaje(msg_id):
    mongo.db.foros.delete_one({"_id": ObjectId(msg_id)})
    return jsonify({"success": True})
