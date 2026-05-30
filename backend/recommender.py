import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MOVIES_CSV = os.path.join(BASE_DIR, "data", "movies.csv")
SERIES_CSV = os.path.join(BASE_DIR, "data", "series.csv")
MOVIES_PKL = os.path.join(BASE_DIR, "data", "movies_similarity.pkl")
SERIES_PKL = os.path.join(BASE_DIR, "data", "series_similarity.pkl")

df_movies = None
df_series = None
movies_similarity = None
series_similarity = None


# ── Loaders ────────────────────────────────────────────────

def load_movies():
    global df_movies, movies_similarity
    print("Loading movies dataset...")
    df_movies = pd.read_csv(MOVIES_CSV)
    df_movies["tags"] = df_movies["tags"].fillna("")

    if os.path.exists(MOVIES_PKL):
        print("Loading precomputed movies matrix...")
        with open(MOVIES_PKL, "rb") as f:
            movies_similarity = pickle.load(f)
    else:
        print("Computing movies similarity matrix...")
        tfidf = TfidfVectorizer(stop_words="english", max_features=5000)
        matrix = tfidf.fit_transform(df_movies["tags"])
        movies_similarity = cosine_similarity(matrix)
        with open(MOVIES_PKL, "wb") as f:
            pickle.dump(movies_similarity, f)
        print("Movies matrix saved.")


def load_series():
    global df_series, series_similarity
    print("Loading series dataset...")
    df_series = pd.read_csv(SERIES_CSV)
    df_series["tags"] = df_series["tags"].fillna("")

    if os.path.exists(SERIES_PKL):
        print("Loading precomputed series matrix...")
        with open(SERIES_PKL, "rb") as f:
            series_similarity = pickle.load(f)
    else:
        print("Computing series similarity matrix...")
        tfidf = TfidfVectorizer(stop_words="english", max_features=5000)
        matrix = tfidf.fit_transform(df_series["tags"])
        series_similarity = cosine_similarity(matrix)
        with open(SERIES_PKL, "wb") as f:
            pickle.dump(series_similarity, f)
        print("Series matrix saved.")


def load_all():
    load_movies()
    load_series()


# ── Movie Recommendations ───────────────────────────────────

def get_similar_movies(title, n=12):
    global df_movies, movies_similarity
    matches = df_movies[df_movies["title"].str.lower().str.contains(title.lower())]
    if matches.empty:
        return []
    idx = matches.index[0]
    scores = sorted(enumerate(movies_similarity[idx]), key=lambda x: x[1], reverse=True)
    scores = [s for s in scores if s[0] != idx][:n]
    results = []
    for i, score in scores:
        movie = df_movies.iloc[i]
        results.append({
            "id": int(movie["id"]),
            "title": movie["title"],
            "rating": round(float(movie["rating"]), 1),
            "genres": movie["genres"],
            "poster_path": movie["poster_path"],
            "overview": movie["overview"],
            "match_score": round(float(score) * 100, 1),
            "type": "movie"
        })
    return results


def get_genre_movies(genre, n=12):
    global df_movies
    filtered = df_movies[df_movies["genres"].str.lower().str.contains(genre.lower())]
    filtered = filtered.sort_values("rating", ascending=False).head(n)
    results = []
    for _, movie in filtered.iterrows():
        results.append({
            "id": int(movie["id"]),
            "title": movie["title"],
            "rating": round(float(movie["rating"]), 1),
            "genres": movie["genres"],
            "poster_path": movie["poster_path"],
            "overview": movie["overview"],
            "match_score": None,
            "type": "movie"
        })
    return results


# ── Series Recommendations ──────────────────────────────────

def get_similar_series(title, n=12):
    global df_series, series_similarity
    matches = df_series[df_series["title"].str.lower().str.contains(title.lower())]
    if matches.empty:
        return []
    idx = matches.index[0]
    scores = sorted(enumerate(series_similarity[idx]), key=lambda x: x[1], reverse=True)
    scores = [s for s in scores if s[0] != idx][:n]
    results = []
    for i, score in scores:
        show = df_series.iloc[i]
        results.append({
            "id": int(show["id"]),
            "title": show["title"],
            "rating": round(float(show["rating"]), 1),
            "genres": show["genres"],
            "poster_path": show["poster_path"],
            "overview": show["overview"],
            "match_score": round(float(score) * 100, 1),
            "type": "series"
        })
    return results


def get_genre_series(genre, n=12):
    global df_series
    filtered = df_series[df_series["genres"].str.lower().str.contains(genre.lower())]
    filtered = filtered.sort_values("rating", ascending=False).head(n)
    results = []
    for _, show in filtered.iterrows():
        results.append({
            "id": int(show["id"]),
            "title": show["title"],
            "rating": round(float(show["rating"]), 1),
            "genres": show["genres"],
            "poster_path": show["poster_path"],
            "overview": show["overview"],
            "match_score": None,
            "type": "series"
        })
    return results


# ── Smart Search Parser ─────────────────────────────────────

def parse_query(text):
    import re
    text_lower = text.lower().strip()

    # ── Series triggers ────────────────────────────────────
    series_triggers = ["series like", "shows like", "tv shows like",
                       "web series like", "show like"]
    for trigger in series_triggers:
        if trigger in text_lower:
            query = text_lower.replace(trigger, "").strip()
            return {"type": "series_similarity", "query": query}

    # ── Movie triggers ─────────────────────────────────────
    movie_triggers = ["movies like", "films like", "similar to",
                      "movie like", "film like"]
    for trigger in movie_triggers:
        if trigger in text_lower:
            query = text_lower.replace(trigger, "").strip()
            return {"type": "movie_similarity", "query": query}

    # ── Concept/theme searches ─────────────────────────────
    concept_map = {
        "lawyer": "lawyer attorney court legal",
        "doctor": "doctor hospital medical surgery",
        "police": "police detective investigation crime",
        "spy": "spy espionage secret agent cia",
        "space": "space galaxy universe astronaut",
        "zombie": "zombie apocalypse undead",
        "vampire": "vampire supernatural blood",
        "superhero": "superhero superpower marvel dc",
        "marvel": "marvel superhero avengers",
        "dc": "dc comics batman superman",
        "heist": "heist robbery theft crime",
        "mafia": "mafia gangster mob crime",
        "war": "war military battle soldier",
        "historical": "historical period history",
        "royal": "royal kingdom palace throne",
        "school": "school college student teenager",
        "survival": "survival wilderness stranded",
        "hacker": "hacker technology cyber computer",
    }

    for concept, expanded in concept_map.items():
        if concept in text_lower:
            if any(w in text_lower for w in ["series", "show", "tv"]):
                return {"type": "series_similarity", "query": expanded}
            else:
                return {"type": "movie_similarity", "query": expanded}

    # ── Genre keywords — each maps to ITSELF now ───────────
    genre_keywords = {
        "thriller": "thriller",
        "horror": "horror",
        "comedy": "comedy",
        "romance": "romance",
        "romantic": "romance",
        "action": "action",
        "drama": "drama",
        "sci-fi": "sci-fi",
        "science fiction": "sci-fi",
        "animation": "animation",
        "animated": "animation",
        "documentary": "documentary",
        "fantasy": "fantasy",
        "crime": "crime",
        "mystery": "mystery",
        "adventure": "adventure",
        "musical": "musical",
        "biopic": "biography",
        "biographical": "biography",
        "biography": "biography",
        "historical": "history",
        "war": "war",
        "psychological": "psychological thriller",
        "suspense": "suspense thriller",
        "dark": "dark thriller",
        "sad": "emotional drama",
        "emotional": "emotional drama",
        "feel good": "feel-good comedy",
        "funny": "comedy",
        "scary": "horror",
        "family": "family",
        "superhero": "superhero action",
    }

    for keyword, mapped in genre_keywords.items():
        if keyword in text_lower:
            if any(w in text_lower for w in ["series", "show", "tv", "web series"]):
                return {"type": "genre_series", "query": mapped}
            else:
                return {"type": "genre_movie", "query": mapped}

    # ── Time-based queries ─────────────────────────────────
    time_words = ["new", "latest", "recent", "top", "best",
                  "popular", "trending", "must watch", "must-watch"]
    for word in time_words:
        if word in text_lower:
            if any(w in text_lower for w in ["series", "show", "tv", "web series"]):
                return {"type": "top_series", "query": ""}
            else:
                return {"type": "top_movies", "query": ""}

    # ── Year-based queries ─────────────────────────────────
    year_match = re.search(r'\b(19|20)\d{2}\b', text_lower)
    if year_match:
        if any(w in text_lower for w in ["series", "show", "tv"]):
            return {"type": "top_series", "query": ""}
        else:
            return {"type": "top_movies", "query": ""}

    # ── Default — treat as direct title/actor/character search ──
    return {"type": "direct_search", "query": text}


# Mixed results based on tabs
def get_mixed_results(query, n=12):
    """For 'All' tab — returns mix of movies and series"""
    movie_results = get_similar_movies(query, n=6)
    series_results = get_similar_series(query, n=6)
    # interleave them
    mixed = []
    for i in range(max(len(movie_results), len(series_results))):
        if i < len(movie_results):
            mixed.append(movie_results[i])
        if i < len(series_results):
            mixed.append(series_results[i])
    return mixed[:n]

# for top movies and series
def get_top_movies(n=12):
    global df_movies
    top = df_movies.sort_values("rating", ascending=False).head(n)
    results = []
    for _, movie in top.iterrows():
        results.append({
            "id": int(movie["id"]),
            "title": movie["title"],
            "rating": round(float(movie["rating"]), 1),
            "genres": movie["genres"],
            "poster_path": movie["poster_path"],
            "overview": movie["overview"],
            "match_score": None,
            "type": "movie"
        })
    return results

def get_top_series(n=12):
    global df_series
    top = df_series.sort_values("rating", ascending=False).head(n)
    results = []
    for _, show in top.iterrows():
        results.append({
            "id": int(show["id"]),
            "title": show["title"],
            "rating": round(float(show["rating"]), 1),
            "genres": show["genres"],
            "poster_path": show["poster_path"],
            "overview": show["overview"],
            "match_score": None,
            "type": "series"
        })
    return results

def direct_search(query, n=12):
    """Search by title, actor, character name directly"""
    global df_movies, df_series
    query_lower = query.lower().strip()

    # search movies
    movie_matches = df_movies[
        df_movies["tags"].str.contains(query_lower, na=False)
    ].copy()
    movie_matches["type"] = "movie"

    # search series
    series_matches = df_series[
        df_series["tags"].str.contains(query_lower, na=False)
    ].copy()
    series_matches["type"] = "series"

    # combine and sort by rating
    combined = pd.concat([movie_matches, series_matches])
    combined = combined.sort_values("rating", ascending=False).head(n)

    results = []
    for _, item in combined.iterrows():
        results.append({
            "id": int(item["id"]),
            "title": item["title"],
            "rating": round(float(item["rating"]), 1),
            "genres": item["genres"],
            "poster_path": item["poster_path"],
            "overview": item["overview"],
            "match_score": None,
            "type": item["type"]
        })
    return results

def smart_title_search(query, media_type="all", n=12):
    """
    If query exactly matches a title → show that title first, then similar
    If no exact match → fall back to direct_search (actor/character/keyword)
    """
    global df_movies, df_series
    query_lower = query.lower().strip()
    results = []

    if media_type in ["movie", "all"]:
        # check exact title match in movies
        exact = df_movies[df_movies["title"].str.lower() == query_lower]
        if not exact.empty:
            movie = exact.iloc[0]
            results.append({
                "id": int(movie["id"]),
                "title": movie["title"],
                "rating": round(float(movie["rating"]), 1),
                "genres": movie["genres"],
                "poster_path": movie["poster_path"],
                "overview": movie["overview"],
                "match_score": 100.0,
                "type": "movie"
            })
            # then add similar movies
            similar = get_similar_movies(query_lower, n=n-1)
            results += similar

    if media_type in ["series", "all"] and len(results) < n:
        # check exact title match in series
        exact = df_series[df_series["title"].str.lower() == query_lower]
        if not exact.empty:
            show = exact.iloc[0]
            results.insert(0, {
                "id": int(show["id"]),
                "title": show["title"],
                "rating": round(float(show["rating"]), 1),
                "genres": show["genres"],
                "poster_path": show["poster_path"],
                "overview": show["overview"],
                "match_score": 100.0,
                "type": "series"
            })
            similar = get_similar_series(query_lower, n=n-1)
            results += [r for r in similar if r["id"] != int(show["id"])]

    # no exact match found — fall back to direct search
    if not results:
        results = direct_search(query, n=n)

    # deduplicate
    seen = set()
    unique = []
    for r in results:
        if r["id"] not in seen:
            seen.add(r["id"])
            unique.append(r)

    return unique[:n]