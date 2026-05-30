from dotenv import load_dotenv
load_dotenv()
import os
import requests
import pandas as pd
import time
import argparse

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
BASE_URL = "https://api.themoviedb.org/3"


def safe_get(url, params, session, retries=5, delay=2):
    """GET with exponential backoff."""
    for attempt in range(retries):
        try:
            res = session.get(url, params=params, timeout=10)
            if res.status_code == 429:
                wait = int(res.headers.get("Retry-After", 10))
                print(f"  ⏳ Rate limited. Waiting {wait}s...")
                time.sleep(wait)
                continue
            res.raise_for_status()
            return res.json()
        except Exception as e:
            wait = delay * (2 ** attempt)
            print(f"  ⚠️  Attempt {attempt+1}/{retries} failed: {e}. Retrying in {wait}s...")
            time.sleep(wait)
    print(f"  ❌ All retries failed for {url}")
    return {}


def get_genre_map(session):
    data = safe_get(f"{BASE_URL}/genre/movie/list", {"api_key": TMDB_API_KEY}, session)
    return {g["id"]: g["name"] for g in data.get("genres", [])}


def get_movies(pages, session):
    movies = []
    for page in range(1, pages + 1):
        data = safe_get(f"{BASE_URL}/movie/popular", {"api_key": TMDB_API_KEY, "page": page}, session)
        for movie in data.get("results", []):
            movies.append({
                "id":          movie["id"],
                "title":       movie["title"],
                "overview":    movie.get("overview", ""),
                "genres":      movie.get("genre_ids", []),
                "popularity":  movie.get("popularity", 0),
                "rating":      movie.get("vote_average", 0),
                "poster_path": movie.get("poster_path", ""),
            })
        time.sleep(0.3)
        print(f"  Page {page}/{pages} — {len(movies)} movies collected")
    return movies


def enrich_keywords(df, session, out_path):
    """Optional step: fetch keywords and re-save CSV."""
    print(f"\n🔑 Fetching keywords for {len(df)} movies (this takes ~20 mins)...")
    keywords = []
    for i, movie_id in enumerate(df["id"]):
        data = safe_get(f"{BASE_URL}/movie/{movie_id}/keywords", {"api_key": TMDB_API_KEY}, session)
        words = data.get("keywords", [])
        keywords.append(" ".join([k["name"] for k in words]))
        time.sleep(0.6)   # gentle: ~1.5 req/s
        if (i + 1) % 100 == 0:
            print(f"  {i+1}/{len(df)} done...")
    df["keywords"] = keywords
    df["tags"] = (
        df["overview"].fillna("") + " " +
        df["genres"].fillna("") + " " +
        df["keywords"].fillna("")
    ).str.lower().str.strip()
    df.to_csv(out_path, index=False)
    print(f"✅ Keywords enriched and saved to {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--pages",    type=int,  default=100)
    parser.add_argument("--keywords", action="store_true",
                        help="Also fetch keywords (optional, slow)")
    args = parser.parse_args()

    OUT     = "movies.csv"
    session = requests.Session()

    # ── Step 1: Fetch movies (fast, ~2 mins) ─────────────────
    print("📡 Fetching genre map...")
    genre_map = get_genre_map(session)

    print(f"\n🎬 Fetching {args.pages} pages of popular movies...")
    movies = get_movies(args.pages, session)

    df = pd.DataFrame(movies)
    df["genres"] = df["genres"].apply(
        lambda ids: " ".join([genre_map.get(i, "") for i in ids])
    )
    df.drop_duplicates(subset="id", inplace=True)
    df["keywords"] = ""
    df["tags"] = (df["overview"].fillna("") + " " + df["genres"].fillna("")).str.lower().str.strip()

    df.to_csv(OUT, index=False)
    print(f"\n✅ Saved {len(df)} movies to {OUT}")

    # ── Step 2 (optional): keyword enrichment ────────────────
    if args.keywords:
        enrich_keywords(df, session, OUT)
    else:
        print("💡 Tip: run with --keywords to enrich tags with TMDB keywords")