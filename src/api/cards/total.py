from fastapi import APIRouter, HTTPException

from model import SessionDep
from services import ServiceError, cards

router = APIRouter(prefix="/total")


@router.get("")
def get_total_price(session: SessionDep):
  try:
    total = cards.calculate_total_price(session=session)
    return {"total_price": total, "currency": "EUR"}
  except ServiceError as e:
    raise HTTPException(status_code=500, detail={"service_error": str(e)})
