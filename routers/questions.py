from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/questions", tags=["questions"])

# Questions de positionnement 3e
questions = [
    {"id": 1, "question": "Développer : (x + 3)(x - 2)", "resultats": "x^2 + x - 6", "notion": "Calcul littéral"},
    {"id": 2, "question": "Résoudre l'équation : 2x - 5 = 9", "resultats": "x = 7", "notion": "Équations"},
    {"id": 3, "question": "Quelle est la moyenne de : 5, 8, 12, 15 ?", "resultats": "10", "notion": "Statistiques"},
    {"id": 4, "question": "Dans un triangle rectangle, si les côtés sont 3 cm et 4 cm, quelle est la longueur de l'hypoténuse ?", "resultats": "5", "notion": "Pythagore"},
    {"id": 5, "question": "Si f(x) = 2x + 1, calculer f(3)", "resultats": "7", "notion": "Fonctions"},
]

# Modèle de réponse de l'élève
class Resultats(BaseModel):
    question_id: int
    resultats: str

class QuestionsResultats(BaseModel):
    note: int
    mention: str
    appreciation: str
    acquises: List[str]
    non_acquises: List[str]

@router.get("/questions")
async def get_questions():
    return [{"id": q["id"], "question": q["question"]} for q in questions]

@router.post("/resultats", response_model=QuestionsResultats)
async def correct_questions(reponses: List[Resultats]):
    total = len(questions)
    score = 0
    notions_acquises = []
    notions_non_acquises = []

    for rep in reponses:
        q = next((q for q in questions if q["id"] == rep.question_id), None)
        if q:
            if rep.resultats.replace(" ", "") == q["resultats"].replace(" ", ""):
                score += 1
                notions_acquises.append(q["notion"])
            else:
                notions_non_acquises.append(q["notion"])

    note = int((score / total) * 20)

    if note >= 16:
        mention = "Très bien"
        appreciation = "Excellente maîtrise des notions."
    elif note >= 12:
        mention = "Bien"
        appreciation = "Bon niveau, quelques révisions conseillées."
    elif note >= 8:
        mention = "Passable"
        appreciation = "Notions partiellement acquises, renforcement nécessaire."
    else:
        mention = "Insuffisant"
        appreciation = "Renforcement urgent requis."

    return QuestionsResultats(
        note=note,
        mention=mention,
        appreciation=appreciation,
        acquises=notions_acquises,
        non_acquises=notions_non_acquises,
    )

