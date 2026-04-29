import uuid

from fastapi import APIRouter, HTTPException

from model import SessionDep
from services import ServiceError, cards

router = APIRouter(prefix="/delete")


@router.delete("/{id}")
def delete_card(session: SessionDep, id: uuid.UUID):
  try:
    card = cards.delete_card(session=session, id=id)

    return {"id": card.id}
  except ServiceError as e:
    raise HTTPException(status_code=500, detail={"service_error": str(e)})
