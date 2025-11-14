import requests
from bs4 import BeautifulSoup
import re
from app import app
from models import db, Course

URL = "https://guide.wisc.edu/courses/comp_sci/"

def scrape_courses():
    print(f"Fetching data from {URL}...")

    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    resp = requests.get(URL, headers=headers)
    resp.raise_for_status()
