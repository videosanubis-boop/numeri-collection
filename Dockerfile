FROM python:3.12-slim

# Dipendenze di sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Installa dipendenze Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia il contenuto di src/ nella workdir
COPY src/ .

# Crea la directory per il database persistente
RUN mkdir -p /data

# Il database viene salvato in /data (volume montato)
ENV DATABASE_URL=sqlite:////data/storage.db

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
