from fastapi import APIRouter

from api import cards, values

router = APIRouter(prefix="/api")

router.include_router(values.router)
router.include_router(cards.router)
