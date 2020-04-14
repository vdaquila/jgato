#!/usr/bin/python3

import flask
from flask_cors import CORS

import psycopg2

from flask import jsonify
from flask import render_template
from flask import request
from werkzeug.http import HTTP_STATUS_CODES

app = flask.Flask(__name__)
CORS(app)
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

def decode_cat_uid(cat_uid):
    """
    Catgories are unique per game_id and cat_id pair.

    Given an encoded unique ID value, decode it to game_id and cat_id.
    """
    # TODO regex, enhanced error handling?
    (game_id, cat_id) = cat_uid.split(":")
    return(game_id, cat_id)

def encode_cat_uid(game_id, cat_id):
    """
    Catgories are unique per game_id and cat_id pair.

    Given these two values, returns a serialized single unique ID value.
    """
    cat_uid = "{}:{}".format(game_id, cat_id)
    return(cat_uid)

@app.route('/')
def index():
    """
    URL: /

    Initial jGato screen.
    """
    return render_template('index.html')

@app.route('/api/cat_picker/', methods=['POST', 'GET'])
def category_picker():
    """
    URL: /api/cat_picker/

    Initial screen to pick categories.

    Provides all available data unless filtered with following options.

    Options:
     - page_num: If specified, limits results to start at this page.
     - per_page: Results per page, default 50 if page_num used.
     - which_round: If specified, provide only this round. Must be one of
         jeopardy_round, double_jeopardy_round, or final_jeopardy_round.

    Returns JSON like:
      {
        "jeopardy_round": {
          "categories": [
            {
              "id": 23643,
              "name": "james bond & friends",
              "airdate": "2019-04-05 16:00:00",
              "show_number": 6257
            },
            ...
          ]
        },
        "double_jeopardy_round": {
          "categories": [
            {
              "id": 11143,
              "name": "in the boy scout handbook",
              "airdate": "2013-03-22 16:00:00",
              "show_number": 4122
            },
            ...
          ]
        },
        "final_jeopardy_round": {
          "categories": [
            {
              "id": 4251,
              "name": "alex trebek, class of '61",
              "airdate": "2010-02-09 17:00:00",
              "show_number": 3309
            },
            ...
          ]
        }
      }
    """

    # TODO XXX Must filter out single/double results without all six

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
#SELECT cl.game_id as show_number, cat.id as id, cat.title as name, cl.airdate, COUNT(cl.id) FROM clues AS cl, categories AS cat WHERE cat.id = cl.category_id GROUP BY cl.game_id, cat.id, cat.title, cl.airdate HAVING COUNT(cl.id) = 2 ORDER BY cl.game_id, cat.id;

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
                "id": encode_cat_uid(row[0], row[1]),
                "name": row[2],
                "airdate": str(row[3]),
            }
            result_d[round_key]["categories"].append(category_d)
            row = cur.fetchone()

    return(jsonify(result_d))

@app.route("/api/play/")
def game_board():
    """
    URL: /api/play/

    Sends clues for a full game of Jeopardy!

    Must supply category IDs. These are the "id" entries from the category picker page.

    Options:
     - jcid: Jeopardy category ids to use. Must provide 5.
     - djcid: Double Jeopardy category ids to use. Must provide 5.
     - fjcid: Final Jeopardy category id to use. Must provide 1.

    Returns JSON like:
      {
        "jeopardy_round": {
          "categories": [
            {
              "id": 546,
              "name": "advertising icons",
              "airdate": "2016-05-17 16:00:00",
              "clues": [
                {
                  "id": 84777,
                  "value": 200,
                  "clue": "Ho ho ho!  Named after a variety of large peas, this character first appeared in ads in 1928",
                  "response": "the Jolly Green Giant"
                },
                ... 5 MORE CLUES ...
              ]
            },
            ... 4 MORE CATEGORIES ...
          ]
        },
        "double_jeopardy_round": {
          "categories": [
            {
              "id": 8571,
              "name": "mad for math",
              "airdate": "2016-05-17 16:00:00",
              "clues": [
                {
                  "id": 44541,
                  "value": 400,
                  "clue": "Quick!5 + 32 + 7 -10",
                  "response": 34
                },
                ... 5 MORE CLUES ...
              ]
            },
            ... 4 MORE CATEGORIES ...
          ]
        },
        "final_jeopardy_round": {
          "categories": [
            {
              "id": 17284,
              "name": "your vote",
              "airdate": "2016-05-17 16:00:00",
              "clues": [
                {
                  "id": 97381,
                  "value": "",
                  "clue": "The scarecrow knows about this kind of unofficial vote held as a gauge of opinion",
                  "response": "straw vote (or straw poll)"
                }
              ]
            }
          ]
        }
      }
    """

    # Check args
    jeopardy_cat_ids = request.args.getlist("jcid")
    double_jeopardy_cat_ids = request.args.getlist("djcid")
    final_jeopardy_cat_id = request.args.get("fjcid", None, type=str)

    if not jeopardy_cat_ids or len(jeopardy_cat_ids) != 5:
        return(error_response("Must provide five jcid values."))
    if not double_jeopardy_cat_ids or len(double_jeopardy_cat_ids) != 5:
        return(error_response("Must provide five djcid values."))
    if not final_jeopardy_cat_id:
        return(error_response("Must provide one fjcid value."))

    round_id_map = {
        "jeopardy_round": jeopardy_cat_ids,
        "double_jeopardy_round": double_jeopardy_cat_ids,
        "final_jeopardy_round": (final_jeopardy_cat_id, ),
    }

    # Query for clue details from the requested categories for each round
    result_d = {}
    cur = conn.cursor()
    for round_key, cat_uids in round_id_map.items():
        result_d[round_key] = {
            "categories": [],
        }
        for cat_uid in cat_uids:
            (game_id, cat_id) = decode_cat_uid(cat_uid)

            category_d = {
                "id": cat_uid,
                "clues": [],
            }

            query = "SELECT DISTINCT cl.airdate, cat.title AS name, cl.id, cl.value, cl.question AS clue, cl.answer AS response " \
                "FROM clues AS cl, categories AS cat " \
                "WHERE cat.id = cl.category_id AND cl.game_id={} AND cat.id={};".format(game_id, cat_id)
            cur.execute(query)

            i = 1
            start_value = None
            cat_airdate = None
            cat_name = None
            row = cur.fetchone()
            while row is not None:
                (cat_airdate, cat_name, clue_id, value, clue, response) = row
                if value and not start_value:
                    start_value = value / i

                clue_d = {
                    "id": clue_id,
                    "value": value,
                    "clue": clue,
                    "response": response,
                    "daily_double": False,
                }
                category_d["clues"].append(clue_d)
                row = cur.fetchone()
                i += 1

            # Post-process to derive original value since some are null from Daily Doubles
            i = 1
            for clue_d in category_d["clues"]:
                if clue_d["value"] is None:
                    clue_d["value"] = int(start_value * i)
                    clue_d["daily_double"] = True
                i += 1

            category_d["airdate"] = cat_airdate
            category_d["name"] = cat_name

            result_d[round_key]["categories"].append(category_d)
        
    return(jsonify(result_d))


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8443, debug=1, ssl_context='adhoc')
