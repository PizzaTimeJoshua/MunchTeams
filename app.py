from flask import Flask, render_template, jsonify, request
import os
import pyjson5
import difflib
import re
import pandas as pd

FORMATS = [
    "gen9vgc2024regg",
    "gen9vgc2024reggbo3",
    "gen9vgc2024regf",
    "gen9vgc2024regfbo3",
    "gen9nationaldex",
    "gen9ou",
    "gen9nationaldexubers",
    "gen9anythinggoes",
    "gen9doublesou",
    "gen9ubers",
    "gen9nationaldexdoubles"
]

app = Flask(__name__)


def safe_load_files():
    global pokedexData,indexData
     # Load Sprite Index
    if os.path.exists("data/forms_index.json"):
        with open('data/forms_index.json', 'r', encoding="utf8") as file:
            indexRaw = file.read()
        indexData = pyjson5.loads(indexRaw)

    # Load Pokedex
    if os.path.exists("data/pokedex.json"):
        with open('data/pokedex.json', 'r', encoding="utf8") as file:
            pokedexRaw = file.read()
        pokedexData = pyjson5.loads(pokedexRaw)

def find_replays(pokeSearch,meta,replay_total=100,filters={ "teamused":False, "rating" : 0, "winner": False, "allow_duplicate_players" : False}):
    global thread_status
    with open(f"data/search-replays-list-{meta}.json","rb") as file:
        replay_data = pyjson5.load(file)
    search_replays = []
    
    df = pd.DataFrame(replay_data)

    search_filter = []

    # PokeSearch team filter
    if (pokeSearch != []) :
        search_filter.append(df['teams'].apply(lambda x: set(pokeSearch).issubset(x[0])) |  df['teams'].apply(lambda x: set(pokeSearch).issubset(x[1])))

    # Used in Battle Filter
    if (filters["teamused"] and (pokeSearch != [])):
        search_filter.append(df['teamused'].apply(lambda x: set(pokeSearch).issubset(x[0])) |  df['teamused'].apply(lambda x: set(pokeSearch).issubset(x[1])))

    # Rating Filter
    if (filters["rating"]>0):
        search_filter.append((df['rating'] >= filters["rating"]))

    # Winner Filter
    if (filters["winner"] and (pokeSearch != [])):
        search_filter.append((df['teams'].apply(lambda x: set(pokeSearch).issubset(x[0])) & (df['winner_index'] == 1)) | (df['teams'].apply(lambda x: set(pokeSearch).issubset(x[1])) & (df['winner_index'] == 2))  )
    # Duplicate Players Filter
    if not (filters.get("allow_duplicate_players",False)):
        search_filter.append((~df.duplicated(subset=['winner'], keep='first')))
    
    

    final_filter = search_filter[0]
    for condition in search_filter[1:]:
        final_filter &= condition

    replays = df[final_filter]
    
    for _, replay in replays.iterrows():

        sprite_index_team = [ [get_sprite_pokemon(p) for p in replay["teams"][0]], [get_sprite_pokemon(p) for p in replay["teams"][1]] ]

        search_replays.append([replay["id"],replay["rating"],replay["winner"],replay["players"],sprite_index_team,replay["score"],replay["uploadtime"]])
        if (len(search_replays) >= replay_total):
            break
    return search_replays

safe_load_files()

def get_sprite_pokemon(poke):
    word = poke.lower()
    word = re.sub(r'[^a-z0-9]+', '', word)
    if word in indexData.keys():
        sprite_num = indexData[word]
    elif word in pokedexData.keys():
        sprite_num = pokedexData[word].get("num",0)
    else:
        return 0 #(0,0)
    return sprite_num #divmod(sprite_num,12)

DEFAULT_REPLAYS = find_replays("", FORMATS[0])
@app.route('/')
def index():
    return render_template('index.html',available_formats = FORMATS)

@app.route('/replay')
def load_replay():
    filter_battleused = request.args.get('filter_battleused') == 'true'
    filter_rating_enabled = request.args.get('filter_rating_enabled') == 'true'
    filter_winner = request.args.get('filter_winner') == 'true'

    pokemon_search = request.args.get('pokemon_search')
    filter_format = request.args.get('filter_format')
    filter_rating = request.args.get('filter_rating')

    filters={ "teamused":filter_battleused, "rating" : 0, "winner": filter_winner}

    
    if (filter_rating_enabled and filter_rating.isnumeric()):
        filters["rating"] = int(filter_rating)

    pokeSearch = []
    for poke in pokemon_search.split(","):
        word = poke.lower()
        possibilities = pokedexData.keys()
        normalized_possibilities = {p.lower(): p for p in possibilities}
        result = difflib.get_close_matches(word, normalized_possibilities.keys(),10)
        normalized_result = [normalized_possibilities[r] for r in result]
        if len(normalized_result)>0:
            close = normalized_result[0]
            pokeName = pokedexData[close].get("name","")
            if (pokeName != ""): 
                pokeSearch.append(pokeName) 

        
    print(pokeSearch,filters)
    top_replays = find_replays(pokeSearch, filter_format,filters=filters)
    return jsonify(top_replays)

@app.route('/replay_default')
def load_replay_default():
    return jsonify(DEFAULT_REPLAYS)


if __name__ == "__main__":
    app.run(debug=True)