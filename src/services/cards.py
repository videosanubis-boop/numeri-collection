import uuid

from sqlmodel import Session, col, func, select, text

from model.cards import Card
from services import ServiceError


def get_next_order(session: Session) -> int:
  """Restituisce il prossimo order disponibile (max + 1)"""
  max_order = session.exec(select(func.max(Card.order))).one()
  return (max_order if max_order is not None else -1) + 1


def create_card(
  session: Session,
  name: str,
  code: str,
  rarity: str,
  condition: str,
  lang: str,
  price: float,
  image_url: str,
  status: str = "owned",
):
  """
  Crea una nuova carta con order automatico (ultimo + 1).
  """
  try:
    next_order = get_next_order(session)

    card = Card(
      name=name,
      code=code,
      rarity=rarity,
      condition=condition,
      lang=lang,
      price=price,
      order=next_order,
      image_url=image_url,
      status=status,
    )

    session.add(card)
    session.commit()
    session.refresh(card)
    return card
  except Exception as e:
    session.rollback()
    raise ServiceError(service=__name__, message=str(e))


def list_cards(session: Session):
  try:
    statement = select(Card).order_by(col(Card.order))
    cards = session.exec(statement).all()
    return list(cards)
  except Exception as e:
    raise ServiceError(service=__name__, message=str(e))


def update_card(
  session: Session,
  id: uuid.UUID,
  new_name: str | None,
  new_code: str | None,
  new_rarity: str | None,
  new_condition: str | None,
  new_lang: str | None,
  new_price: float | None,
  new_image_url: str | None,
  new_status: str | None = None,
  new_order: int | None = None,
):
  """
  Aggiorna una carta. Se new_order è diverso dall'attuale, riordina tutte le carte.
  Esempio: cards=[c1=0, c2=1, c3=2, c4=3], sposto c4 a posizione 1
  Risultato: [c1=0, c4=1, c2=2, c3=3]
  """
  try:
    card = session.exec(select(Card).where(Card.id == id)).one()
    old_order = card.order

    if new_order is not None and new_order != old_order:
      # Prendi tutte le carte ordinate per order
      all_cards = session.exec(select(Card).order_by(col(Card.order))).all()

      # Rimuovi la carta corrente dalla lista
      other_cards = [c for c in all_cards if c.id != id]

      # Inserisci la carta nella nuova posizione
      # new_order è la posizione target (0-based)
      target = max(0, min(new_order, len(other_cards)))
      other_cards.insert(target, card)

      # Prima fase: assegna order negativi temporanei a tutte
      for i, c in enumerate(other_cards):
        c.order = -9999 + i
      session.flush()

      # Seconda fase: assegna gli order definitivi in ordine
      for i, c in enumerate(other_cards):
        c.order = i
      session.flush()

    # Aggiorna gli altri campi
    if new_name is not None and new_name != card.name:
      card.name = new_name
    if new_code is not None and new_code != card.code:
      card.code = new_code
    if new_rarity is not None and new_rarity != card.rarity:
      card.rarity = new_rarity
    if new_condition is not None and new_condition != card.condition:
      card.condition = new_condition
    if new_lang is not None and new_lang != card.lang:
      card.lang = new_lang
    if new_price is not None and new_price != card.price:
      card.price = new_price
    if new_image_url is not None and new_image_url != card.image_url:
      card.image_url = new_image_url
    if new_status is not None and new_status != card.status:
      card.status = new_status

    session.add(card)
    session.commit()
    session.refresh(card)
    return card
  except Exception as e:
    session.rollback()
    raise ServiceError(service=__name__, message=str(e))


def delete_card(
  session: Session,
  id: uuid.UUID,
):
  try:
    statement = select(Card).where(Card.id == id)
    card = session.exec(statement).one()
    session.delete(card)
    session.commit()
    return card
  except Exception as e:
    session.rollback()
    raise ServiceError(service=__name__, message=str(e))


def calculate_total_price(
  session: Session,
):
  try:
    # Somma tutte le carte, escludendo solo quelle esplicitamente "missing"
    statement = select(Card)
    cards = session.exec(statement).all()
    # Conta solo le carte che NON sono missing (o hanno status NULL = default owned)
    total = sum(
      card.price
      for card in cards
      if (card.status != "missing" if hasattr(card, "status") and card.status else True)
    )
    return total
  except Exception as e:
    raise ServiceError(service=__name__, message=str(e))
