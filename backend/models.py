from flask_sqlalchemy import SQLAlchemy
from typing import List, Optional
from sqlalchemy import String, Integer, Text, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship

db = SQLAlchemy()

prerequisites = Table(
    "prerequisites",
    db.metadata,
    Column("course_id", Integer, ForeignKey("course.id"), primary_key=True),
    Column("prereq_id", Integer, ForeignKey("course.id"), primary_key=True)
)

class Course(db.Model):
    __tablename__ = "course"

    id: Mapped[int] = mapped_column(primary_key=True)
    dept: Mapped[str] = mapped_column(String(10))    # eg: "COMP SCI"
    number: Mapped[str] = mapped_column(String(10))  # eg: "544"
    title: Mapped[str] = mapped_column(String(200))  # eg: "Intro to Big Data Systems"
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    credits: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    prereqs: Mapped[List["Course"]] = relationship(
        "Course",
        secondary=prerequisites,
        primaryjoin=(prerequisites.c.course_id == id),
        secondaryjoin=(prerequisites.c.prereq_id == id),
        backref="needed_by",
        lazy="select" # only find prereqs when explicitly select .prereqs
    )

    def to_dict(self) -> dict[str, int | str | list[int] | None]:
        return {
            "id": self.id,
            "code": f"{self.dept} {self.number}",
            "title": self.title,
            "description": self.description,
            "credits": self.credits,
            "prereq_ids": [p.id for p in self.prereqs]
        }
