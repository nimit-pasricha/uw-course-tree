import requests
from bs4 import BeautifulSoup
from app import app
from models import db, Course

URL = "https://guide.wisc.edu/courses/comp_sci/"

def scrape_courses() -> None:
    
    

    print(f"Fetching data from {URL}...")

    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    resp = requests.get(URL, headers=headers)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    course_blocks = soup.find_all("div", class_="courseblock")

    print(f"Found {len(course_blocks)} courses. Parsing...")

    courses_added = 0

    with app.app_context():
        print("Deleting old data...")
        db.session.query(Course).delete()
        db.session.commit()

        for block in course_blocks:
            try:
                # 1. Extract Course Code (e.g., "COMP SCI 200")
                code_span = block.find("span", class_="courseblockcode")
                if not code_span:
                    continue

                full_code = code_span.get_text().strip().replace("\xa0", " ")
                parts = full_code.rsplit(" ", 1)
                if len(parts) == 2:
                    dept, number = parts
                else:
                    dept = "UNKNOWN"
                    number = full_code

                # 2. Extract title
                title_p = block.find("p", class_="courseblocktitle")
                full_title_text = title_p.get_text().strip()

                if "—" in full_title_text:
                    title = full_title_text.split("—", 1)[1].strip()
                else:
                    title = full_title_text.replace(full_code, "").strip()

                
                # 3. Extract Credits
                credits_p = block.find('p', class_='courseblockcredits')
                credits_text = credits_p.get_text().strip() if credits_p else ""

                credits_num = credits_text.split(" ")[0]

                # 4. Extract Description
                desc_p = block.find('p', class_='courseblockdesc')
                description = desc_p.get_text().strip() if desc_p else ""

                db.session.add(
                    Course(
                        dept=dept,
                        number=number,
                        title=title,
                        description=description,
                        credits=credits_num
                    )
                )
                courses_added += 1
            except Exception as e:
                print(f"Error parsing course: {e}")
        
        db.session.commit()
        print(f"Successfully added {courses_added} courses.")

if __name__ == "__main__":
    scrape_courses()