from dotenv import load_dotenv
load_dotenv()
import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import recommender
import requests

app = Flask(__name__)
CORS(app)

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend")
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/dashboard")
def dashboard():
    return send_from_directory(FRONTEND_DIR, "dashboard.html")

@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory(os.path.join(FRONTEND_DIR, "static"), filename)

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "message": "Cinetune API is running 🎬"})

@app.route("/api/search", methods=["POST"])
def search():
    data = request.get_json(silent=True) or {}
    query = data.get("query", "").strip()
    tab = data.get("tab", "all")

    if not query:
        return jsonify({"error": "query is required"}), 400

    parsed = recommender.parse_query(query)
    q_type = parsed["type"]
    q_text = parsed["query"]

    if tab == "movies":
        if q_type in ["genre_movie", "genre_series"]:
            results = recommender.get_genre_movies(q_text, n=12)
        elif q_type in ["top_movies", "top_series"]:
            results = recommender.get_top_movies(n=12)
        elif q_type == "direct_search":
            results = recommender.smart_title_search(q_text, media_type="movie", n=12)
            results = [r for r in results if r["type"] == "movie"]
        else:
            results = recommender.get_similar_movies(q_text, n=12)

    elif tab == "series":
        if q_type in ["genre_movie", "genre_series"]:
            results = recommender.get_genre_series(q_text, n=12)
        elif q_type in ["top_movies", "top_series"]:
            results = recommender.get_top_series(n=12)
        elif q_type == "direct_search":
            results = recommender.smart_title_search(q_text, media_type="series", n=12)
            results = [r for r in results if r["type"] == "series"]
        else:
            results = recommender.get_similar_series(q_text, n=12)

    else:  # all tab
        if q_type in ["genre_movie", "genre_series"]:
            movie_r = recommender.get_genre_movies(q_text, n=6)
            series_r = recommender.get_genre_series(q_text, n=6)
            results = []
            for i in range(max(len(movie_r), len(series_r))):
                if i < len(movie_r): results.append(movie_r[i])
                if i < len(series_r): results.append(series_r[i])
        elif q_type in ["top_movies", "top_series"]:
            movie_r = recommender.get_top_movies(n=6)
            series_r = recommender.get_top_series(n=6)
            results = []
            for i in range(max(len(movie_r), len(series_r))):
                if i < len(movie_r): results.append(movie_r[i])
                if i < len(series_r): results.append(series_r[i])
        elif q_type == "direct_search":
            results = recommender.smart_title_search(q_text, media_type="all", n=12)
        elif q_type in ["movie_similarity", "series_similarity"]:
            results = recommender.get_mixed_results(q_text, n=12)
        else:
            results = recommender.get_mixed_results(q_text, n=12)

    for r in results:
        r["poster_url"] = TMDB_IMAGE_BASE + r["poster_path"] if r.get("poster_path") else None

    return jsonify({"query": query, "type": q_type, "results": results})

@app.route("/api/genre/<genre>")
def genre(genre):
    results = recommender.get_genre_movies(genre, n=20)
    return jsonify({"genre": genre, "results": results})

@app.route("/api/detail/<string:media_type>/<int:media_id>")
def detail(media_type, media_id):
    if media_type not in ["movie", "series"]:
        return jsonify({"error": "invalid type"}), 400

    tmdb_type = "movie" if media_type == "movie" else "tv"

    try:
        res = requests.get(
            f"https://api.themoviedb.org/3/{tmdb_type}/{media_id}",
            params={"api_key": TMDB_API_KEY},
            timeout=8
        )
        if res.status_code != 200:
            return jsonify({"error": "not found"}), 404
        data = res.json()

        credits = requests.get(
            f"https://api.themoviedb.org/3/{tmdb_type}/{media_id}/credits",
            params={"api_key": TMDB_API_KEY},
            timeout=8
        )
        cast = credits.json().get("cast", [])[:8] if credits.status_code == 200 else []

        cast_list = [{
            "name": c["name"],
            "character": c.get("character", ""),
            "profile_path": f"https://image.tmdb.org/t/p/w185{c['profile_path']}" if c.get("profile_path") else None
        } for c in cast]

        return jsonify({
            "id": media_id,
            "type": media_type,
            "title": data.get("title") or data.get("name"),
            "overview": data.get("overview", "No description available."),
            "rating": round(float(data.get("vote_average", 0)), 1),
            "genres": [g["name"] for g in data.get("genres", [])],
            "poster_url": f"https://image.tmdb.org/t/p/w500{data['poster_path']}" if data.get("poster_path") else None,
            "backdrop_url": f"https://image.tmdb.org/t/p/w1280{data['backdrop_path']}" if data.get("backdrop_path") else None,
            "release_date": data.get("release_date") or data.get("first_air_date", ""),
            "runtime": data.get("runtime") or (data.get("episode_run_time") or [None])[0],
            "cast": cast_list,
        })

    except requests.exceptions.Timeout:
        return jsonify({"error": "TMDB request timed out"}), 504
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/trending")
def trending():
    res = requests.get(
        "https://api.themoviedb.org/3/trending/all/day",
        params={"api_key": TMDB_API_KEY}
    )
    data = res.json().get("results", [])[:20]
    results = []
    for item in data:
        media_type = item.get("media_type", "movie")
        results.append({
            "id": item["id"],
            "title": item.get("title") or item.get("name"),
            "rating": round(item.get("vote_average", 0), 1),
            "poster_url": f"https://image.tmdb.org/t/p/w500{item['poster_path']}" if item.get("poster_path") else None,
            "type": "series" if media_type == "tv" else "movie",
            "overview": item.get("overview", ""),
            "genres": "",
            "poster_path": item.get("poster_path", ""),
            "match_score": None,
        })
    return jsonify({"results": results})

if __name__ == "__main__":
    recommender.load_all()
    app.run(debug=True, port=5001)