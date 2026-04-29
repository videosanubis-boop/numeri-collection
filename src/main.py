from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import model
from api import router

app = FastAPI(
  title="Numeri viewer",
  openapi_url="/api/openapi.json",
  docs_url="/api/docs",
  redoc_url="/api/redoc",
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_methods=["*"],
  allow_headers=["*"],
  allow_credentials=True,
)

# Inizializza il database sempre, non solo in __main__
model.init()

app.include_router(router)
app.mount("/", StaticFiles(directory=Path(__file__).parent / "view", html=True))

if __name__ == "__main__":
  uvicorn.run("main:app", host="0.0.0.0", port=8000, workers=2, reload=True)
