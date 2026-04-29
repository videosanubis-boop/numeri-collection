import uuid

from sqlmodel import Field, SQLModel

from model.values import conditions, rarities


class Card(SQLModel, table=True):
  __tablename__: str = "cards"

  id: uuid.UUID = Field(primary_key=True, default_factory=uuid.uuid4)
  name: str = Field(unique=True)
  code: str = Field()
  rarity: str = Field()
  condition: str = Field()
  lang: str = Field(max_length=2)
  price: float = Field()
  image_url: str = Field()
  order: int = Field()
  status: str | None = Field(default="owned")  # Opzionale per retrocompatibilità

  def model_post_init(self, __context):
    if self.rarity not in rarities:
      raise Exception("Rarità non valida")
    if self.condition not in conditions:
      raise Exception("Condizione non valida")
    if self.status and self.status not in ("owned", "to_replace", "missing"):
      raise Exception("Status non valido")
    # Se status è None, imposta default
    if not self.status:
      self.status = "owned"
