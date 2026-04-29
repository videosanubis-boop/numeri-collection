import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from model import SessionDep
from services import ServiceError, cards

router = APIRouter(prefix="/update")


class CardUpdateRequest(BaseModel):
  id: uuid.UUID

  new_name: str | None
  new_code: str | None
  new_rarity: str | None
  new_condition: str | None
  new_lang: str | None
  new_price: float | None
  new_image_url: str | None
  new_status: str | None = None
  new_order: int | None = None


@router.put("")
def update_card(session: SessionDep, body: CardUpdateRequest):
  try:
    card = cards.update_card(
      session=session,
      id=body.id,
      new_name=body.new_name,
      new_code=body.new_code,
      new_rarity=body.new_rarity,
      new_condition=body.new_condition,
      new_lang=body.new_lang,
      new_price=body.new_price,
      new_image_url=body.new_image_url,
      new_status=body.new_status,
      new_order=body.new_order,
    )

    return {"id": card.id}
  except ServiceError as e:
    raise HTTPException(status_code=500, detail={"service_error": str(e)})
