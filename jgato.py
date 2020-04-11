#!/usr/bin/python3

import flask
import json
import psycopg2

app = flask.Flask(__name__)
conn = psycopg2.connect("dbname=jgato user=postgres")

@app.route('/')
def category_picker():
    """
    URL: /

    Initial screen to pick categories.

    Options:
    ...
    
    """

    key_query_map = {
        "jeopardy_round": 
            "SELECT DISTINCT cat.id as id, cl.game_id as show_number, cat.title as name, cl.airdate "
            "FROM clues AS cl, categories AS cat "
            "WHERE cat.id = cl.category_id AND (cl.value = 200 OR cl.value = 600);",
        "double_jeopardy_round": 
            "SELECT DISTINCT cat.id as id, cl.game_id as show_number, cat.title as name, cl.airdate "
            "FROM clues AS cl, categories AS cat "
            "WHERE cat.id = cl.category_id and cl.value > 1000;",
        "final_jeopardy_round": 
            "SELECT DISTINCT cat.id as id, cl.game_id as show_number, cat.title as name, cl.airdate "
            "FROM clues AS cl, categories AS cat "
            "WHERE cat.id = cl.category_id and cl.value = 0;",
    }
    result_d = {k: {"categories": []} for k in key_query_map.keys()}

    cur = conn.cursor()
    for round_key, round_query in key_query_map.items():
        cur.execute(round_query)
        row = cur.fetchone()
        while row is not None:
            category_d = {
                "id": row[0],
                "show_number": row[2],
                "name": row[2],
                "airdate": str(row[3]),
            }
            result_d[round_key]["categories"].append(category_d)
            row = cur.fetchone()

    return(json.dumps(result_d))

@app.route("/play")
def game_board():
    """
    URL: /play

    With categories picked, send back full game data.

    Options:
    id(int): Required the ID of the category to return.
    """

    # TODO update description
    return "Category!"


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=1)
