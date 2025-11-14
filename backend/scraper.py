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

    soup = BeautifulSoup(resp.text, "html.parser")

    course_blocks = soup.find_all("div", class_="courseblock")

    print(f"Found {len(course_blocks)} courses. Parsing...")

    courses_added = 0

    with app.app_context():
        db.session.query(Course).delete()
        db.session.commit()

        for block in course_blocks:
            title_div = block.find("p", class_="courseblocktitle")
            if not title_div:
                continue