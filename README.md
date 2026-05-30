# 🎬 CineTune — AI-Powered Movie & Series Recommendation System

> Movies & Series, tuned to your taste.

CineTune is a full-stack AI recommendation web app that suggests movies and TV series based on content similarity, genre/mood, actor names, character names, and smart search queries. Built with a Python ML backend and a React frontend with premium cinematic UI.

---

##  Live Demo

<img width="1470" height="956" alt="home page" src="https://github.com/user-attachments/assets/27d64e19-cb2f-4682-a45b-ac33f3e66480" />


---

##  Features

-  **Smart Search** — Search by movie name, series name, genre, mood, actor name, character name, or concept (e.g. "lawyer series", "Chris Hemsworth movies", "Zorro")
-  **Movie Recommendations** — Content-based similarity using TF-IDF + Cosine Similarity
-  **Series Recommendations** — Same ML pipeline applied to TV series dataset
-  **All / Movies / Series Tabs** — Filter recommendations by content type
-  **Trending Today** — Live trending movies and series from TMDB API
- ️ **Watchlist** — Save movies/series with a heart button, persisted in localStorage
-  **Because You Liked…** — Personalized recommendations based on your most recently added watchlist item
-  **Search History** — Last 4 searches saved as quick-access chips
-  **Detail Modal** — Click any card to see full details: backdrop, poster, overview, cast, genres, rating, runtime
-  **Mobile Responsive** — Works on all screen sizes
-  **Cinematic UI** — Black + deep red glassmorphism design with Framer Motion animations

---

##  How the Recommendation Engine Works

CineTune uses a **content-based filtering** approach:

1. **Data Collection** — Movies and series fetched from TMDB API (~2000 movies, ~2000 series)
2. **Feature Engineering** — Each title's `tags` column combines:
   - Overview/description
   - Genres
   - TMDB keywords
   - Cast names (actors/actresses)
   - Character names
3. **TF-IDF Vectorization** — Converts the `tags` text into numerical vectors using `TfidfVectorizer` with 5000 features
4. **Cosine Similarity** — Computes similarity scores between all titles
5. **Precomputed Matrix** — Similarity matrix saved as `.pkl` file for instant responses
6. **Match Score** — Each recommendation shows a `% match` score derived from cosine similarity

> Example: Searching "movies like Inception" → finds movies with similar overview, genres, and keywords → returns top 12 matches with similarity percentages

---

##  Project Architecture

```
User (React Frontend)
        ↓
Flask REST API (Python)
        ↓
Smart Search Parser (parse_query)
        ↓
Recommendation Engine (TF-IDF + Cosine Similarity)
        ↓
Enriched CSV Datasets (movies.csv / series.csv)
        ↓
TMDB API (posters, details, cast, trending)
```

---

##  Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Python | Core language |
| Flask | REST API server |
| Flask-CORS | Cross-origin requests |
| pandas | Data loading and manipulation |
| numpy | Numerical operations |
| scikit-learn | TF-IDF Vectorization + Cosine Similarity |
| requests | TMDB API calls |
| pickle | Precomputed similarity matrix caching |

### Frontend
| Technology | Purpose |
|---|---|
| React (Vite) | UI framework |
| Framer Motion | Animations and transitions |
| Axios | API calls |
| React Router | Page navigation |
| localStorage | Watchlist and search history persistence |

### Data & APIs
| Source | Usage |
|---|---|
| TMDB API | Movie/series data, posters, cast, trending, details |
| MovieLens (enriched) | Base movie dataset |
| Kaggle Spotify Dataset | (planned for music phase) |

---

##  Project Structure

```
Cinetune/
├── backend/
│   ├── app.py                 # Flask server + API routes
│   ├── recommender.py         # ML engine (TF-IDF + Cosine Similarity)
│   └── data/
│       ├── movies.csv         # Enriched movie dataset
│       ├── series.csv         # Enriched series dataset
│       ├── fetch_movies.py    # TMDB movie fetcher
│       ├── fetch_series.py    # TMDB series fetcher
│       ├── enrich_movies.py   # Cast + character enrichment
│       └── enrich_series.py   # Cast + character enrichment
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx    # Login/landing page
│       │   └── Dashboard.jsx  # Main search + recommendation page
│       └── components/
│           ├── MovieCard.jsx      # Reusable card with watchlist button
│           ├── DetailModal.jsx    # Full detail modal with cast
│           ├── TrendingRow.jsx    # Live trending horizontal row
│           ├── WatchlistRow.jsx   # Saved items row
│           └── BecauseYouLiked.jsx # Personalized recommendations
├── venv/                      # Python virtual environment
├── requirements.txt
└── README.md
```

---

## ️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- TMDB API Key (free at [themoviedb.org](https://www.themoviedb.org/signup))

### 1. Clone the repository
```bash
git clone https://github.com/Shivirajesh/cinetune.git
cd cinetune
```

### 2. Backend setup
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Fetch datasets (one-time setup)
```bash
cd backend/data
python3 fetch_movies.py --keywords   # ~20 mins
python3 fetch_series.py              # ~20 mins
python3 enrich_movies.py             # ~15 mins
python3 enrich_series.py             # ~15 mins
```

### 4. Start the backend
```bash
cd backend
python3 app.py
# Running on http://localhost:5001
```

### 5. Frontend setup
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### 6. Open the app
Go to `http://localhost:5173` and log in with any email + password.

---

##  API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/search` | Smart search (movies + series) |
| GET | `/api/trending` | Live trending from TMDB |
| GET | `/api/detail/:type/:id` | Full movie/series details + cast |
| GET | `/api/genre/:genre` | Genre-based recommendations |
| GET | `/api/health` | Health check |

---

##  Smart Search Examples

| Query | Result |
|---|---|
| `movies like Inception` | Similar mind-bending movies |
| `series like Breaking Bad` | Similar crime/drama series |
| `thriller movies` | Top rated thriller movies |
| `Chris Hemsworth` | Thor, Extraction, Avengers |
| `lawyer series` | Suits, Better Call Saul, Lincoln Lawyer |
| `horror series` | Top horror TV shows |
| `Iron Man` | Iron Man trilogy + Avengers |
| `romantic movies` | Top romance films |

---

##  Roadmap

- [x] Movie recommendations (TF-IDF + Cosine Similarity)
- [x] Series recommendations
- [x] Smart search parser
- [x] TMDB API integration (posters, details, cast)
- [x] Trending Today section
- [x] Watchlist with localStorage
- [x] "Because You Liked" personalized section
- [x] Search history chips
- [x] Detail modal with cast
- [x] Mobile responsive UI
- [x] Actor/actress + character name search
---

##  Built By

**Shivam Rajesh**
- GitHub: [@Shivirajesh](https://github.com/Shivirajesh)

---

##  License

This project is for educational and portfolio purposes.

---

>  If you found this project interesting, feel free to star the repo!
