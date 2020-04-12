#!/usr/bin/python3

import flask
import psycopg2

from flask import jsonify
from flask import request
from werkzeug.http import HTTP_STATUS_CODES

app = flask.Flask(__name__)
conn = psycopg2.connect("dbname=jgato user=postgres")

def error_response(message=None, status_code=400):
    """
    Use this to throw a RESTful error code.

    Options:
     - message: String to describe error.
     - status_code: Defaults to 400 (bad request).
    """
    payload = {'error': HTTP_STATUS_CODES.get(status_code, 'Unknown error')}
    if message:
        payload['message'] = message
    response = jsonify(payload)
    response.status_code = status_code
    return response 

@app.route('/', methods=['POST', 'GET'])
def category_picker():
    """
    URL: /

    Initial screen to pick categories.

    Provides all available data unless filtered with following options.

    Options:
     - page_num: If specified, limits results to start at this page.
     - per_page: Results per page, default 50 if page_num used.
     - which_round: If specified, provide only this round. Must be one of
         jeopardy_round, double_jeopardy_round, or final_jeopardy_round.
    """

    # Process requests to filter, or provide everything by default
    page_num = request.args.get("page_num", None, type=int)
    per_page = request.args.get("per_page", 50, type=int)
    which_round = request.args.get("which_round", None, type=str)

    if page_num and page_num < 0:
        return(error_response("Invalid value '{}' provided for page_num. Must be a positive int." . \
            format(page_num)))
    if per_page and per_page < 0:
        return(error_response("Invalid value '{}' provided for per_page. Must be a positive int." . \
            format(per_page)))

    limit_str = ""
    if page_num:
        limit_str = " OFFSET {} LIMIT {}".format((page_num - 1) * per_page, per_page)

    clue_query_map = {
        "jeopardy_round": 
            "SELECT DISTINCT cl.game_id as show_number, cat.id as id, cat.title as name, cl.airdate "
            "FROM clues AS cl, categories AS cat "
            "WHERE cat.id = cl.category_id AND (cl.value = 200 OR cl.value = 600) "
            "ORDER BY cl.game_id, cat.id{};".format(limit_str),
        "double_jeopardy_round": 
            "SELECT DISTINCT cl.game_id as show_number, cat.id as id, cat.title as name, cl.airdate "
            "FROM clues AS cl, categories AS cat "
            "WHERE cat.id = cl.category_id and cl.value > 1000 "
            "ORDER BY cl.game_id, cat.id{};".format(limit_str),
        "final_jeopardy_round": 
            "SELECT DISTINCT cl.game_id as show_number, cat.id as id, cat.title as name, cl.airdate "
            "FROM clues AS cl, categories AS cat "
            "WHERE cat.id = cl.category_id and cl.value = 0 "
            "ORDER BY cl.game_id, cat.id{};".format(limit_str),
    }

    rounds = tuple(clue_query_map.keys())
    if which_round:
        if which_round not in clue_query_map:
            return(error_response("Invalid value '{}' provided for which_round. Must be one of: {}." . \
                format(which_round, tuple(clue_query_map.keys()))))
        rounds = (which_round, )

    # Query DB and return results
    cur = conn.cursor()
    result_d = {k: {"categories": []} for k in rounds}
    for round_key in rounds:
        round_query = clue_query_map[round_key]
        cur.execute(round_query)
        row = cur.fetchone()
        while row is not None:
            category_d = {
                "show_number": row[0],
                "id": row[1],
                "name": row[2],
                "airdate": str(row[3]),
            }
            result_d[round_key]["categories"].append(category_d)
            row = cur.fetchone()

    return(jsonify(result_d))

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
