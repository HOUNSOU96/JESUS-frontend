# backend/routers/remediation.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/remediation")
def get_videos(niveau: str):
    videos = [
        {
            "id": "video_entiers_naturels",
            "titre": "Entiers naturels(6e)",
            "niveau": "6e",
            "videoUrl": f"http://localhost:8000/RemediationVideos/6e/Entiersnaturels.mp4"
        },
        # ... ajoute ici toutes les autres vidéos
    ]
    return videos
