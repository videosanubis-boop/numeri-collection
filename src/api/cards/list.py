from fastapi import APIRouter, HTTPException

from services import ServiceError, cards

from model import SessionDep

router = APIRouter(prefix="/list")

@router.get("")
def list_cards(session: SessionDep):
  try:
    result = cards.list_cards(session=session)

    return {"cards": result}
  except ServiceError as e:
    raise HTTPException(status_code=500, detail={"service_error": str(e)})
