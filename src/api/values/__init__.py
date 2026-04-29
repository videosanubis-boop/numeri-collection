from fastapi import APIRouter

from api.values import list

router = APIRouter(prefix="/values", tags=["Values"])

router.include_router(list.router)
