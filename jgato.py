#!/usr/bin/python3
"""
This...is...jGato!

A simple Jeopardy web game.

The back end is Python Flask, and front end is React.

Front end is served via index.html. If back end receives a request for /, it
redirects to /index.html.

This could be deployed with something like WSGI on a web server. If run
directly, it will use Flask's built-in web server at port 8443, using
self-signed SSL certificates.

Starting via 'ENV="dev" ./jgato.py' will put it into development mode. This
turns on Flask debugging and starts at port 5000. Both instances may be resident
at the same time using the same database.

Runs off a sqlite database served in the file jgato.db. If this does not exist,
create it using db_import.py.

Back end provides an API:
 * /api/cat_picker/ : See cat_picker() for details
 * /api/play/       : See play() for details
"""

import datetime
import flask
import os
import random
import sqlite3

from flask import g
from flask import jsonify
from flask import redirect
from flask import request
from flask_cors import CORS
from werkzeug.http import HTTP_STATUS_CODES

import util

app = flask.Flask(__name__,
                  static_url_path='', 
                  static_folder='build')
CORS(app)

def get_db():
    """
    Open connection to local sqlite database on disk, read-only.

    This function is not called directly, instead it uses a flask property to
    automatically run on the first request served.

    The database is opened this way so that it is part of the same thread as the
    flask app itself. This is an sqlite requirement.
    """

    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect('file:jgato.db?mode=ro', uri=True)
    return db

@app.teardown_appcontext
def close_connection(exception):
    """Auto-close DB connection."""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    """
    URL: /

    Redirect to static index.
    """
    return redirect("/index.html")

@app.route('/api/cat_picker/', methods=['POST', 'GET'])
def cat_picker():
    """
    URL: /api/cat_picker/

    Initial screen to pick categories.

    Provides all available data unless filtered with following options via GET or
    POST.

    Parameters
    ----------
    page_num: int
        If specified, limits results to start at this page (optional)
    per_page: int
        Results per page if page_num is used (default 50) (optional)
    which_round: str
        If specified, filter to a single round. Must be one of jeopardy_round,
        double_jeopardy_Round, or final_jeopardy_round.

    Returns
    -------
    flask.Response
        flask jsonify response payload, example follows:
        {
          "jeopardy_round": {
            "categories": [
              {
                "id": "1243:23643",
                "name": "james bond & friends",
                "airdate": "2019-04-05",
                "show_number": 6257
              },
              ...
            ]
          },
          "double_jeopardy_round": {
            "categories": [
              {
                "id": "3512:11143",
                "name": "in the boy scout handbook",
                "airdate": "2013-03-22",
                "show_number": 4122
              },
              ...
            ]
          },
          "final_jeopardy_round": {
            "categories": [
              {
                "id": "5233:4251",
                "name": "alex trebek, class of '61",
                "airdate": "2010-02-09",
                "show_number": 3309
              },
              ...
            ]
          }
        }
    """

    # Process requests to filter, or provide everything by default
    page_num = request.args.get("page_num", None, type=int)
    per_page = request.args.get("per_page", 50, type=int)
    which_round = request.args.get("which_round", None, type=str)

    if page_num and page_num < 0:
        return(util.error_response("Invalid value '{}' provided for page_num. Must be a positive int." . \
            format(page_num)))
    if per_page and per_page < 0:
        return(util.error_response("Invalid value '{}' provided for per_page. Must be a positive int." . \
            format(per_page)))

    limit_str = ""
    if page_num:
        limit_str = " LIMIT {} OFFSET {}".format(per_page, (page_num - 1) * per_page)

    query = "SELECT DISTINCT show_number, category_id, category_title, airdate " \
        "FROM {} " \
        "ORDER BY category_title{};"

    rounds = ("jeopardy_round", "double_jeopardy_round", "final_jeopardy_round")
    if which_round:
        if which_round not in rounds:
            return(util.error_response("Invalid value '{}' provided for which_round. Must be one of: {}." . \
                format(which_round, rounds)))
        rounds = (which_round, )

    # Query DB and return results
    cur = get_db().cursor()
    result_d = {k: {"categories": []} for k in rounds}
    for round_key in rounds:
        round_query = query.format(round_key, limit_str)
        cur.execute(round_query)
        row = cur.fetchone()
        while row is not None:
            try:
                airdate = str(datetime.datetime.fromisoformat(row[3]).date())
            except ValueError:
                airdate = None

            category_d = {
                "show_number": row[0],
                "id": util.encode_cat_uid(row[0], row[1]),
                "name": row[2],
                "airdate": airdate,
            }
            result_d[round_key]["categories"].append(category_d)
            row = cur.fetchone()

    return(jsonify(result_d))

@app.route("/api/play/")
def play():
    """
    URL: /api/play/

    Sends clues for a full game of Jeopardy!

    Must supply category IDs. These are the "id" entries from the category picker page.

    Parameters
    ----------
    jcid: list
        Jeopardy category ids to use (str). Must provide 5.
    djcid: list
        Double Jeopardy category ids to use (str). Must provide 5.
    fjcid: str
        Final Jeopardy category id to use. Must provide 1.

    Returns
    -------
    flask.Response
        flask jsonify response payload, example follows:
        {
          "jeopardy_round": {
            "categories": [
              {
                "id": "1234:546",
                "name": "advertising icons",
                "airdate": "2016-05-17",
                "clues": [
                  {
                    "id": 84777,
                    "value": 200,
                    "clue": "Ho ho ho!  Named after a variety of large peas, this character first appeared in ads in 1928",
                    "response": "the Jolly Green Giant"
                  },
                  ... 4 MORE CLUES ...
                ]
              },
              ... 4 MORE CATEGORIES ...
            ]
          },
          "double_jeopardy_round": {
            "categories": [
              {
                "id": "5231:8571",
                "name": "mad for math",
                "airdate": "2016-05-17",
                "clues": [
                  {
                    "id": 44541,
                    "value": 400,
                    "clue": "Quick!5 + 32 + 7 -10",
                    "response": 34
                  },
                  ... 4 MORE CLUES ...
                ]
              },
              ... 4 MORE CATEGORIES ...
            ]
          },
          "final_jeopardy_round": {
            "categories": [
              {
                "id": "3513:17284",
                "name": "your vote",
                "airdate": "2016-05-17",
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
        return(util.error_response("Must provide five jcid values."))
    if not double_jeopardy_cat_ids or len(double_jeopardy_cat_ids) != 5:
        return(util.error_response("Must provide five djcid values."))
    if not final_jeopardy_cat_id:
        return(util.error_response("Must provide one fjcid value."))

    round_id_map = {
        "jeopardy_round": jeopardy_cat_ids,
        "double_jeopardy_round": double_jeopardy_cat_ids,
        "final_jeopardy_round": (final_jeopardy_cat_id, ),
    }

    # Query for clue details from the requested categories for each round
    result_d = {}
    cur = get_db().cursor()
    for round_key, cat_uids in round_id_map.items():
        result_d[round_key] = {
            "categories": [],
        }
        for cat_uid in cat_uids:
            (game_id, cat_id) = util.decode_cat_uid(cat_uid)

            category_d = {
                "id": cat_uid,
                "clues": [],
            }

            query = \
                "SELECT airdate, category_title, id, value, clue, response " \
                "FROM {} " \
                "WHERE show_number={} AND category_id={};".format(round_key, game_id, cat_id)
            cur.execute(query)

            i = 1
            start_value = None
            cat_airdate_raw = None
            cat_name = None
            row = cur.fetchone()
            while row is not None:
                (cat_airdate_raw, cat_name, clue_id, value, clue, response) = row
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
                if clue_d["value"] == "":
                    clue_d["value"] = int(start_value * i)
                i += 1

            try:
                cat_airdate = str(datetime.datetime.fromisoformat(cat_airdate_raw).date())
            except ValueError:
                cat_airdate = None

            category_d["airdate"] = cat_airdate
            category_d["name"] = cat_name

            result_d[round_key]["categories"].append(category_d)

    # Assign daily doubles with weighted percentages
    #  - (Heatmap source: https://digg.com/2018/joepardy-daily-double-probability-mapped)
    #  - Each row is a category, so this is rotated -90 degrees from viewing a game board
    weighting = (
        0.04, 2.23, 6.06, 7.71, 4.72,
        0.03, 1.24, 3.77, 5.09, 2.69,
        0.04, 1.80, 5.22, 7.26, 4.35,
        0.03, 1.59, 5.01, 6.48, 4.21,
        0.03, 1.77, 4.89, 6.95, 3.93,
    )
    #    0.03, 1.26, 3.65, 4.75, 3.20, # NOTE: This game is using 5 categories, not all 6

    for round_key, num_daily_doubles in (("jeopardy_round", 1), ("double_jeopardy_round", 2)):
        clues = [{"cat_id": cat_d["id"], "clue_d": clue_d} \
            for cat_d in result_d[round_key]["categories"] \
                for clue_d in cat_d["clues"]]
        daily_doubles = random.choices(clues, weighting, k=num_daily_doubles)
        daily_doubles[0]["clue_d"]["daily_double"] = True

        # For double jeopardy, can not have both in the same category
        if (num_daily_doubles == 2):
            while daily_doubles[1]["cat_id"] == daily_doubles[0]["cat_id"]:
                daily_doubles[1] = random.choices(clues, weighting, k=1)[0]
            daily_doubles[1]["clue_d"]["daily_double"] = True
        
    return(jsonify(result_d))


if __name__ == "__main__":
    if os.environ.get("ENV", "") == "dev":
        app.run(host='0.0.0.0', port=5000, debug=1, ssl_context='adhoc')
    else:
        app.run(host='0.0.0.0', port=8443, debug=0, ssl_context='adhoc')
