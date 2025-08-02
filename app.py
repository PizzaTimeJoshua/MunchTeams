from flask import Flask, render_template, jsonify, request
import os
import ijson
import pyjson5
import difflib
import re

FORMATS = [
    "gen9vgc2025reghbo3",
    "gen9vgc2025regh",
    "gen9vgc2025regj",
    "gen9vgc2025regibo3",
    "gen9vgc2025regi",
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

def find_replays(pokeSearch,meta,replay_total=100,filters={"teamused":False,
                                                            "rating" : 0,
                                                            "winner": False,
                                                            "allow_duplicate_players" : False,
                                                            "usage_score":0,
                                                            "player_search":[]}):

    search_replays = []

    with open(f"data/search-replays-list-{meta}.json","rb") as file:
        replay_data = ijson.items(file,"item")  # Assume the file is a JSON array
        for replay in replay_data:
            
            # Apply Pokémon search filter (check both teams)
            if pokeSearch:
                if not (set(pokeSearch).issubset(replay["teams"][0]) or set(pokeSearch).issubset(replay["teams"][1])):
                    continue  # Skip if Pokémon aren't found in either team
            
            # Apply Player Search
            if (len(filters.get("player_search"))>0) and (filters.get("player_search")[0]!=""):
                players = set([p.lower().replace(" ","") for p in filters.get("player_search")]) # Lowercase and Remove Spaces
                replay_players = set([p.lower().replace(" ","") for p in replay["players"]])
                if not (players & replay_players):
                    continue


            # Apply teamused filter
            if filters.get("teamused"):
                if not (set(pokeSearch).issubset(replay["teamused"][0]) or set(pokeSearch).issubset(replay["teamused"][1])):
                    continue

            # Apply rating filter
            if filters.get("rating", 0) > 0 and replay.get("rating", 0) > filters["rating"]:
                continue  # Skip if rating is lower than the filter

            # Apply usage filter
            if filters.get("usage_score", 0) > 0 and min(replay.get("usage_score", [600,600])) > filters["usage_score"]:
                continue  # Skip if neither is lower than the filter

            # Apply winner filter
            if filters.get("winner"):
                if not ((set(pokeSearch).issubset(replay["teams"][0]) and replay["winner_index"] == 1) or 
                        (set(pokeSearch).issubset(replay["teams"][1]) and replay["winner_index"] == 2)):
                    continue
                
            sprite_index_team = [ [get_sprite_pokemon(p) for p in replay["teams"][0]], [get_sprite_pokemon(p) for p in replay["teams"][1]] ]
            # Collect the valid replays
            search_replays.append([
                replay["id"],         # 0
                replay["rating"],     # 1
                replay["winner"],     # 2
                replay["players"],    # 3
                sprite_index_team,    # 4
                replay["score"],      # 5
                replay["uploadtime"], # 6
                replay["usage_score"],# 7
                replay["bo3_matches"],# 8
                replay["format"]      # 9
            ])
            
            # Stop once we reach the replay limit
            if len(search_replays) >= replay_total:
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
    filter_usage_score_enabled = request.args.get('filter_usage_score_enabled') == 'true'
    filter_winner = request.args.get('filter_winner') == 'true'

    pokemon_search = request.args.get('pokemon_search')
    filter_players = request.args.get('filter_players')
    filter_format = request.args.get('filter_format')
    filter_rating = request.args.get('filter_rating')
    filter_usage_score = request.args.get('filter_usage_score')

    filters={ "teamused":filter_battleused, "rating" : 0, "winner": filter_winner}

    
    if (filter_rating_enabled and filter_rating.isnumeric()):
        filters["rating"] = int(filter_rating)

    if (filter_usage_score_enabled and filter_usage_score.isnumeric()):
        filters["usage_score"] = int(filter_usage_score)

    pokeSearch = []
    filters["player_search"] = filter_players.split(",")
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

        
    print(pokeSearch,filter_format,filters)
    top_replays = find_replays(pokeSearch, filter_format,filters=filters)
    return jsonify(top_replays)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/replay_default')
def load_replay_default():
    return jsonify(DEFAULT_REPLAYS)


if __name__ == "__main__":
    app.run(debug=True)