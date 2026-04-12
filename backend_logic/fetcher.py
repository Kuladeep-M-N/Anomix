import json
import pandas as pd
from pytrends.request import TrendReq
import firebase_admin
from firebase_admin import credentials, firestore
import os
import random
import time

# --- MOCK DATA FOR FALLBACK ---
MOCK_TRENDS = ["AI", "SpaceX", "Sustainable Energy", "Virtual Reality", "Quantum Computing"]

# --- VELOCITY MATRIX POOLS ---
BASELINE_SIGNAL_POOL = [
    {"keyword": "Artificial Intelligence", "volume": 95, "vector": "up", "summary": "Steady upward trajectory in enterprise adoption queries.", "threat_level": "emerging"},
    {"keyword": "Machine Learning", "volume": 88, "vector": "steady", "summary": "Consistent high volume across academic and tech sectors.", "threat_level": "emerging"},
    {"keyword": "Cybersecurity", "volume": 82, "vector": "up", "summary": "Recent high-profile breaches driving sustained search volume.", "threat_level": "elevated"},
    {"keyword": "Blockchain", "volume": 74, "vector": "down", "summary": "Slight cooling in mainstream interest, focus shifting to utility.", "threat_level": "emerging"},
    {"keyword": "Quantum Computing", "volume": 71, "vector": "up", "summary": "Steady growth following continuous research breakthroughs.", "threat_level": "emerging"},
    {"keyword": "Neural Networks", "volume": 68, "vector": "steady", "summary": "Stable interest from AI practitioners and researchers.", "threat_level": "emerging"},
    {"keyword": "Cloud Computing", "volume": 65, "vector": "steady", "summary": "Mature technology showing consistent baseline volume.", "threat_level": "emerging"},
    {"keyword": "Data Science", "volume": 61, "vector": "down", "summary": "Slight decrease possibly due to shifting nomenclature.", "threat_level": "emerging"},
]

VELOCITY_ANOMALY_POOL = [
    {"keyword": "AGI Breakthrough", "spike": 4100, "source": "Signal", "vector": "up", "threat_level": "critical", "summary": "Sudden search spike following alleged leaked research benchmarks."},
    {"keyword": "SpaceX Starship", "spike": 2850, "source": "Signal", "vector": "up", "threat_level": "critical", "summary": "Massive global interest surge leading up to orbital test flight."},
    {"keyword": "AI Stock Crash", "spike": 1940, "source": "Noise", "vector": "up", "threat_level": "elevated", "summary": "Panic selling queries trending due to unverified regulatory rumors."},
    {"keyword": "GPT-5 Launch", "spike": 1200, "source": "Signal", "vector": "up", "threat_level": "elevated", "summary": "Anticipatory searches spiking after cryptic executive tweets."},
    {"keyword": "Deepfake Senate", "spike": 980, "source": "Noise", "vector": "up", "threat_level": "emerging", "summary": "Viral video debunked, but search volume maintains long-tail presence."},
    {"keyword": "Quantum Supremacy", "spike": 780, "source": "Signal", "vector": "up", "threat_level": "emerging", "summary": "Renewed interest following competitor claims of qubit scaling."},
    {"keyword": "Rogue AI Alert", "spike": 620, "source": "Noise", "vector": "up", "threat_level": "emerging", "summary": "Sci-fi trending topic overlapping with genuine safety concerns."},
    {"keyword": "Neural Implant FDA", "spike": 450, "source": "Signal", "vector": "up", "threat_level": "emerging", "summary": "Approval speculation driving focused medical tech searches."},
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_PATH = os.path.join(BASE_DIR, 'serviceAccountKey.json')
COORDINATES_PATH = os.path.join(BASE_DIR, 'coordinates.json')

pytrends = TrendReq(hl='en-US', tz=360)

try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("[OK] Firebase initialized.")
except Exception as e:
    print(f"[ERROR] Firebase init failed: {e}")
    exit(1)

def load_coordinates():
    with open(COORDINATES_PATH, 'r') as f:
        return json.load(f)

def fetch_trending_spikes():
    """Fetches current trending searches, with a mock fallback if pytrends fails."""
    try:
        df = pytrends.trending_searches(pn='united_states')
        top_trends = df[0].tolist()
        return top_trends[0]
    except Exception as e:
        print(f"[WARN] Live trend fetch failed (Google 404/Scraping blocked). Using mock rotation.")
        return random.choice(MOCK_TRENDS)

def fetch_interest_by_region(pytrends, keyword):
    """Fetches world interest by region and filters out zero-interest zones."""
    try:
        pytrends.build_payload([keyword], timeframe='now 1-d')
        region_df = pytrends.interest_by_region(resolution='COUNTRY', inc_low_vol=True, inc_geo_code=True)
        if region_df.empty:
            return pd.DataFrame()
        # Filter for non-zero scores
        region_df = region_df[region_df[keyword] > 0]
        return region_df
    except Exception as e:
        print(f"[ERROR] Interest fetch failed: {e}")
        return pd.DataFrame()

def get_subtopics_fallback():
    """Returns the 'Mission Control' themed mock topics as requested."""
    return ["Market Velocity", "Search Volatility", "Viral Sentiment"]

def generate_velocity_data():
    """Generates the Velocity Matrix payload: Baseline Signal + Velocity Anomalies."""
    baseline = random.sample(BASELINE_SIGNAL_POOL, 5)
    anomalies = random.sample(VELOCITY_ANOMALY_POOL, 5)
    # Sort anomalies descending by spike for dramatic visual impact
    anomalies_sorted = sorted(anomalies, key=lambda x: x['spike'], reverse=True)
    return {
        "baseline_signal": baseline,
        "velocity_anomalies": anomalies_sorted,
        "generated_at": time.time()
    }

def process_and_upload(df, active_trend, is_mock=False):
    """Merges trends with coordinates and uploads to Firestore with metadata enrichment."""
    try:
        country_coords = load_coordinates()
        final_data = []
        for country, row in df.iterrows():
            if country in country_coords:
                score = int(row[active_trend])
                
                # Metadata Enrichment: Add Rising topics for high-interest zones
                metadata = []
                if score > 50:
                    metadata = get_subtopics_fallback()

                # Fix: country_coords[country] is a list [lat, lng]
                lat, lng = country_coords[country]

                final_data.append({
                    "country": country,
                    "score": score,
                    "lat": lat,
                    "lng": lng,
                    "metadata": metadata
                })

        # "The Projection" - Single Snapshot Update
        velocity_data = generate_velocity_data()
        doc_ref = db.collection("observatorium").document("global_snapshot")
        doc_ref.set({
            "active_trend": active_trend,
            "last_updated": time.time(),
            "data": final_data,
            "is_mock": is_mock,
            "velocity_data": velocity_data
        })
        status = "Projected (Live)" if not is_mock else "Projected (Mock Fallback)"
        print(f"[SUCCESS] Data {status} with Metadata ({len(final_data)} entries) to The Observatorium!")
    except Exception as e:
        print(f"[ERROR] Firestore Upload Failed: {e}")

if __name__ == "__main__":
    # 1. Harvest Trends
    keyword = fetch_trending_spikes()
    
    # 2. Extract Regional Scores
    print(f"[INFO] Fetching global interest for: '{keyword}'...")
    results_df = fetch_interest_by_region(pytrends, keyword)
    
    if results_df.empty:
        print("[WARN] interest_by_region failed. Using mock scores for visualization.")
        # Fallback to mock countries for visualization stability
        mock_data = pd.DataFrame({
            keyword: [85, 92, 45, 78, 30, 65, 88, 72, 12, 55],
        }, index=["United States", "India", "Germany", "Japan", "Brazil", "United Kingdom", "Canada", "France", "Australia", "Mexico"])
        process_and_upload(mock_data, keyword, is_mock=True)
    else:
        # 3. Project to Firestore
        process_and_upload(results_df, keyword, is_mock=False)
