from fastapi import APIRouter

router = APIRouter()

@router.get("/questions")
async def get_questions():
    # Exemple : retourne une liste fixe de questions
    return [
        {"id": 1, "question": "Combien font 2 + 3 ?", "options": [3, 4, 5], "resultats": 5},
        {"id": 2, "question": "Quelle est la racine carrée de 16 ?", "options": [2, 4, 8], "resultats": 4}
    ]

