# MunchTeams — README.md

> **Live:** https://munchteams.com  
> **Repo:** https://github.com/PizzaTimeJoshua/MunchTeams

## Overview
**MunchTeams** is a replay discovery tool for **public, rated** Pokémon Showdown battles. Search by format and Pokémon to find meta‑relevant games, study teams, and learn lines/tech.

## Key Features
- Search recent **public** replays by format and Pokémon
- Toggle filters for rating, date, and a custom "usage score"
- Replay cards link directly to the battle on Pokémon Showdown
- Fast client experience (see `static/replay_loader_1.5.js`)

## Supported Formats (as configured)
```
- gen9vgc2025reghbo3
- gen9vgc2025regh
- gen9vgc2025regj
- gen9vgc2025regibo3
- gen9vgc2025regi
- gen9nationaldex
- gen9ou
- gen9nationaldexubers
- gen9anythinggoes
- gen9doublesou
```

## Tech Stack
- **Backend:** Python 3 · Flask
- **Data loading:** `ijson` (streaming JSON)
- **Templating:** Jinja2
- **Frontend:** HTML/CSS/JavaScript
- **Process management:** Gunicorn (Procfile)
- **Runtime (example):** `runtime.txt` → Python 3.12.0

## Data Files
- Location: `data/`
- Naming: `search-replays-list-<format>.json`  
  Example: `search-replays-list-gen9vgc2025reghbo3.json`
- Other helper data: `pokedex.json`, `forms_index.json`

## Routes (Flask)
- `GET /` → search UI (format & Pokémon filters)
- `GET /about` → about page
- `GET /replay_default` → returns default replay list payload
- `GET /replay` → returns filtered replay list (query params include `meta`, `pokemon` and filter toggles)

## Project Structure
```
/ data
  pokedex.json, forms_index.json, search-replays-list-<format>.json
/ static
  favicon.ico, pokemonicons-sheet.png, replay_loader_1.5.js
/ templates
  index.html, about.html, 404.html, 500.html
app.py
Procfile
requirements.txt
runtime.txt
```

## Local Setup
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run
```bash
# Dev
export FLASK_APP=app.py  # Windows: set FLASK_APP=app.py
flask run

# Prod-like
gunicorn app:app --workers 2 --bind 127.0.0.1:8000
```

## Data & Ethics
- Only **public** Pokémon Showdown replays are indexed.
- Respect takedown requests and site robots policies; do not ingest private/unlisted content.

## Contributing
Ideas and PRs welcome — search quality, new formats, or UI/UX improvements.


