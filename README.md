# Numeri viewer

Una applicazione per vedere le proprie carte e il valore di esse

## Installazione

```sh
cd numeri-viewer

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

python src/main.py
```
## Caricamento Carte

```sh
git add src/storage.db storage.db
git commit -m "Update cards"
git push origin master
copy storage.db src\storage.db
git add src/storage.db
git commit -m "Update cards"
git push origin master
```
