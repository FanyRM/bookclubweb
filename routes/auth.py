from flask import Blueprint, request, jsonify, session
from extensions import mongo
from bson import ObjectId
import hashlib

auth_bp = Blueprint("auth", __name__)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = mongo.db.usuarios.find_one({
        "NombreUsuario": data.get("NombreUsuario"),
        "Password": hash_password(data.get("Password", ""))
    })
    if user:
        user["_id"] = str(user["_id"])
        session["user_id"] = user["_id"]
        user.pop("Password", None)
        return jsonify({"success": True, "user": user})
    return jsonify({"success": False, "error": "Credenciales inválidas"}), 401

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})

@auth_bp.route("/me", methods=["GET"])
def me():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"success": False}), 401
    user = mongo.db.usuarios.find_one({"_id": ObjectId(user_id)})
    if user:
        user["_id"] = str(user["_id"])
        user.pop("Password", None)
        return jsonify({"success": True, "user": user})
    return jsonify({"success": False}), 401
