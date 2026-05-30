from dotenv import load_dotenv
load_dotenv()
import os
import requests
import pandas as pd
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
BASE_URL = "https://api.themoviedb.org/3"

# session with auto-retry
session = requests.Session()
retry = Retry(total=5, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
adapter = HTTPAdapter(max_retries=retry)
session.mount("https://", adapter)

def get_genre_map():
    res = session.get(f"{BASE_URL}/genre/tv/list", params={"api_key": TMDB_API_KEY})
    genres = res.json().get("genres", [])
    return {g["id"]: g["name"] for g in genres}

def get_series(pages=100):
    series = []
    for page in range(1, pages + 1):
        try:
            res = session.get(f"{BASE_URL}/tv/popular", params={
                "api_key": TMDB_API_KEY,
                "page": page
            }, timeout=10)
            data = res.json()
            for show in data.get("results", []):
                series.append({
                    "id": show["id"],
                    "title": show.get("name", ""),
                    "overview": show.get("overview", ""),
                    "genres": show.get("genre_ids", []),
                    "popularity": show.get("popularity", 0),
                    "rating": show.get("vote_average", 0),
                    "poster_path": show.get("poster_path", ""),
                    "first_air_date": show.get("first_air_date", ""),
                })
            time.sleep(0.3)
            print(f"Page {page}/100 done")
        except Exception as e:
            print(f"Page {page} failed: {e}, retrying in 5s...")
            time.sleep(5)
            continue
    return series

def get_keywords(series_id):
    try:
        res = session.get(f"{BASE_URL}/tv/{series_id}/keywords",
                         params={"api_key": TMDB_API_KEY}, timeout=10)
        words = res.json().get("results", [])
        return " ".join([k["name"] for k in words])
    except:
        return ""

if __name__ == "__main__":
    genre_map = get_genre_map()
    series = get_series(pages=100)

    df = pd.DataFrame(series)
    df = df.reset_index(drop=True)

    df["genres"] = df["genres"].apply(
        lambda ids: " ".join([genre_map.get(i, "") for i in ids]) if isinstance(ids, list) else ""
    )

    print("Fetching keywords...")
    df["keywords"] = df["id"].apply(lambda sid: get_keywords(sid))
    time.sleep(0.3)

    df["tags"] = (
        df["overview"].fillna("") + " " +
        df["genres"].fillna("") + " " +
        df["keywords"].fillna("")
    )
    df["tags"] = df["tags"].str.lower()

    df.to_csv("series.csv", index=False)
    print(f"Saved {len(df)} series.")