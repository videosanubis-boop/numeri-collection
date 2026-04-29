from fastapi import APIRouter

from api.cards import create, delete, list, total, update

router = APIRouter(prefix="/card", tags=["Cards"])

router.include_router(create.router)
router.include_router(list.router)
router.include_router(update.router)
router.include_router(delete.router)
router.include_router(total.router)
