from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine

engine = create_engine("sqlite:///storage.db")


def get_session():
  global engine

  with Session(engine) as session:
    yield session


def init():
  global engine

  SQLModel.metadata.create_all(engine)


SessionDep = Annotated[Session, Depends(get_session)]
