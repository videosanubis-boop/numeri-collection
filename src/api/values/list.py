from fastapi import APIRouter

from model.values import conditions, rarities

router = APIRouter(prefix="/list")


@router.get("/rarities")
def list_rarities():
  return {"rarities": rarities}


@router.get("/conditions")
def list_conditions():
  return {"conditions": conditions}
