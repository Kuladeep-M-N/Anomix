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
        doc_ref = db.collection("observatorium").document("global_snapshot")
        doc_ref.set({
            "active_trend": active_trend,
            "last_updated": time.time(),
            "data": final_data,
            "is_mock": is_mock
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
