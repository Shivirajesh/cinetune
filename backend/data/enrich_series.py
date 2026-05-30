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

session = requests.Session()
retry = Retry(total=5, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
adapter = HTTPAdapter(max_retries=retry)
session.mount("https://", adapter)

def get_cast_and_characters(series_id):
    try:
        res = session.get(
            f"{BASE_URL}/tv/{series_id}/credits",
            params={"api_key": TMDB_API_KEY}, timeout=10
        )
        data = res.json()
        cast = data.get("cast", [])[:10]
        actors = [c["name"].lower() for c in cast]
        characters = [c.get("character", "").lower() for c in cast if c.get("character")]
        return " ".join(actors), " ".join(characters)
    except:
        return "", ""

def get_keywords(series_id):
    try:
        res = session.get(
            f"{BASE_URL}/tv/{series_id}/keywords",
            params={"api_key": TMDB_API_KEY}, timeout=10
        )
        words = res.json().get("results", [])
        return " ".join([k["name"].lower() for k in words])
    except:
        return ""

if __name__ == "__main__":
    print("Loading series.csv...")
    df = pd.read_csv("series.csv")

    df["keywords"] = df["keywords"].astype(str).replace("nan", "")
    df["overview"] = df["overview"].astype(str).replace("nan", "")
    df["genres"] = df["genres"].astype(str).replace("nan", "")

    actors_list = []
    characters_list = []
    keywords_list = []

    print(f"Fetching cast + keywords for {len(df)} series...")
    for i, row in df.iterrows():
        actors, characters = get_cast_and_characters(row["id"])
        keywords = get_keywords(row["id"])
        actors_list.append(actors)
        characters_list.append(characters)
        keywords_list.append(keywords)
        time.sleep(0.3)
        if (i + 1) % 100 == 0:
            print(f"  {i+1}/{len(df)} done...")
            df["actors"] = actors_list + [""] * (len(df) - len(actors_list))
            df["characters"] = characters_list + [""] * (len(df) - len(characters_list))
            df["keywords"] = keywords_list + [""] * (len(df) - len(keywords_list))
            df.to_csv("series.csv", index=False)

    df["actors"] = actors_list
    df["characters"] = characters_list
    df["keywords"] = keywords_list

    # rebuild enriched tags
    df["tags"] = (
        df["overview"].fillna("") + " " +
        df["genres"].fillna("") + " " +
        df["keywords"].fillna("") + " " +
        df["actors"].fillna("") + " " +
        df["characters"].fillna("")
    ).str.lower().str.strip()

    df.to_csv("series.csv", index=False)
    print(f"✅ Done! series.csv enriched with cast and characters.")