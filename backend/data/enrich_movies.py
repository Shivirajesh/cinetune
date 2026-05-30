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

def get_cast_and_characters(movie_id):
    try:
        res = session.get(
            f"{BASE_URL}/movie/{movie_id}/credits",
            params={"api_key": TMDB_API_KEY}, timeout=10
        )
        data = res.json()
        cast = data.get("cast", [])[:10]  # top 10 cast
        actors = [c["name"].lower() for c in cast]
        characters = [c.get("character", "").lower() for c in cast if c.get("character")]
        return " ".join(actors), " ".join(characters)
    except:
        return "", ""

if __name__ == "__main__":
    print("Loading movies.csv...")
    df = pd.read_csv("movies.csv")

    # force string types
    df["keywords"] = df["keywords"].astype(str).replace("nan", "")
    df["overview"] = df["overview"].astype(str).replace("nan", "")
    df["genres"] = df["genres"].astype(str).replace("nan", "")

    actors_list = []
    characters_list = []

    print(f"Fetching cast for {len(df)} movies...")
    for i, row in df.iterrows():
        actors, characters = get_cast_and_characters(row["id"])
        actors_list.append(actors)
        characters_list.append(characters)
        time.sleep(0.25)
        if (i + 1) % 100 == 0:
            print(f"  {i+1}/{len(df)} done...")
            # save progress every 100
            df["actors"] = actors_list + [""] * (len(df) - len(actors_list))
            df["characters"] = characters_list + [""] * (len(df) - len(characters_list))
            df.to_csv("movies.csv", index=False)

    df["actors"] = actors_list
    df["characters"] = characters_list

    # rebuild enriched tags
    df["tags"] = (
        df["overview"].fillna("") + " " +
        df["genres"].fillna("") + " " +
        df["keywords"].fillna("") + " " +
        df["actors"].fillna("") + " " +
        df["characters"].fillna("")
    ).str.lower().str.strip()

    df.to_csv("movies.csv", index=False)
    print(f"✅ Done! movies.csv enriched with cast and characters.")