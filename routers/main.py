from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import json
from pathlib import Path

app = FastAPI()

# Autorise les appels depuis React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

questions = [
    {
        "id": 1,
        "question": "Quelle est la mesure d’un angle droit ?",
        "options": ["45°", "90°", "180°", "360°"],
        "resultats": "90°",
    },
    {
        "id": 2,
        "question": "Combien y a-t-il de côtés dans un triangle ?",
        "options": ["2", "3", "4", "5"],
        "resultats": "3",
    },
    {
        "id": 3,
        "question": "Quelle est la valeur de 2^3 ?",
        "options": ["6", "8", "9", "5"],
        "resultats": "8",
    },
]

class QuestionsResultats(BaseModel):
    resultats: Dict[int, str]

class QuestionsResultats(BaseModel):
    score: int
    total: int
    message: str

@app.get("/api/questions")
def get_questions():
    q_no_resultats = [{k: v for k, v in q.items() if k != "resultats"} for q in questions]
    return {"questions": q_no_resultats}

@app.post("/api/questions/resultats", response_model=QuestionsResultats)
def post_resultats(data: QuestionsResultats):
    score = 0
    for q in questions:
        if q["id"] in data.resultats and data.resultats[q["id"]] == q["resultats"]:
            score += 1
    total = len(questions)
    message = "Bravo, tu as un bon niveau !" if score >= 2 else "Il faudrait revoir quelques notions."
    return QuestionsResultats(score=score, total=total, message=message)
