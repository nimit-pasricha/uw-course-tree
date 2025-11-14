from flask import Flask, jsonify
from flask_migrate import Migrate
from models import db, Course
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///courses.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
migrate = Migrate(app, db)


@app.route("/api/graph/<string:dept>/<string:number>", methods=["GET"])
def get_course_graph(dept, number):
    # Find root course
    dept_name = dept.replace("%20", " ")
    root_course = Course.query.filter_by(dept=dept_name, number=number).first()

    if not root_course:
        return jsonify({"error": "Course not found"}), 404

    # Buid the graph
    nodes = []
    edges = []
    bfs_queue = [root_course]
    visited = {root_course.id}
    while bfs_queue:
        curr_course = bfs_queue.pop(0)
        nodes.append(
            {
                "id": f"{curr_course.dept}-{curr_course.number}",
                "data": {"label": f"{curr_course.dept} {curr_course.number}", "title": curr_course.title},
                # set a default position; layout handled by the frontend
                "position": {"x": 0, "y": 0},
            }
        )

        for prereq in curr_course.prereqs:
            # Add the relationship as an "edge"
            edges.append(
                {
                    "id": f"e-{curr_course.dept}-{curr_course.number}-{prereq.dept}-{prereq.number}",
                    "source": f"{curr_course.dept}-{curr_course.number}",
                    "target": f"{prereq.dept}-{prereq.number}",
                    "animated": True,  # Makes the edge look cool
                }
            )

            if prereq.id not in visited:
                visited.add(prereq.id)
                bfs_queue.append(prereq)

    return jsonify({"nodes": nodes, "edges": edges})


@app.route("/")
def home():
    return "Home Page"


if __name__ == "__main__":
    app.run(debug=True)
