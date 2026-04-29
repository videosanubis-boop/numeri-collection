from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from model import SessionDep
from services import ServiceError, cards

router = APIRouter(prefix="/create")


class CardCreateRequest(BaseModel):
  name: str
  code: str
  rarity: str
  condition: str
  lang: str
  price: float
  image_url: str
  status: str = "owned"
  # order: NON serve, è automatico


@router.post("")
def create_card(session: SessionDep, body: CardCreateRequest):
  try:
    card = cards.create_card(
      session=session,
      name=body.name,
      code=body.code,
      rarity=body.rarity,
      condition=body.condition,
      lang=body.lang,
      price=body.price,
      image_url=body.image_url,
      status=body.status,
    )

    return {"id": card.id}
  except ServiceError as e:
    raise HTTPException(status_code=500, detail={"service_error": str(e)})
