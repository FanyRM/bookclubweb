from flask import Blueprint, jsonify
import requests
import os

youtube_bp = Blueprint("youtube", __name__)

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "")

@youtube_bp.route("/channel/<handle>/videos", methods=["GET"])
def get_channel_videos(handle):
    if not YOUTUBE_API_KEY:
        return jsonify({"error": "API Key no configurada"}), 500
    
    try:
        # Primero, resolver el handle a channel ID
        search_url = "https://www.googleapis.com/youtube/v3/search"
        search_params = {
            "key": YOUTUBE_API_KEY,
            "q": handle,
            "part": "snippet",
            "type": "channel",
            "maxResults": 1
        }
        
        search_response = requests.get(search_url, params=search_params)
        search_data = search_response.json()
        
        if "error" in search_data:
            return jsonify({"error": search_data["error"]["message"]}), 400
        
        if not search_data.get("items"):
            return jsonify({"error": "Canal no encontrado"}), 404
        
        channel_id = search_data["items"][0]["snippet"]["channelId"]
        
        # Ahora obtener videos del canal
        videos_url = "https://www.googleapis.com/youtube/v3/search"
        videos_params = {
            "key": YOUTUBE_API_KEY,
            "channelId": channel_id,
            "part": "snippet",
            "order": "date",
            "maxResults": 12,
            "type": "video"
        }
        
        videos_response = requests.get(videos_url, params=videos_params)
        videos_data = videos_response.json()
        
        if "error" in videos_data:
            return jsonify({"error": videos_data["error"]["message"]}), 400
        
        videos = []
        for item in videos_data.get("items", []):
            videos.append({
                "id": item["id"]["videoId"],
                "title": item["snippet"]["title"],
                "description": item["snippet"]["description"],
                "thumbnail": item["snippet"]["thumbnails"]["medium"]["url"],
                "publishedAt": item["snippet"]["publishedAt"]
            })
        
        return jsonify({"success": True, "videos": videos})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
