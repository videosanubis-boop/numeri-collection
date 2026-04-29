import os
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine

_db_url = os.getenv("DATABASE_URL", "sqlite:///storage.db")
engine = create_engine(_db_url)


def get_session():
  global engine

  with Session(engine) as session:
    yield session


def init():
  global engine

  SQLModel.metadata.create_all(engine)


SessionDep = Annotated[Session, Depends(get_session)]
