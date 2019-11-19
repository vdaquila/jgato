#!/usr/bin/python3

import flask

app = flask.Flask(__name__)

@app.route('/')
def index():
    return "Index!"

@app.route("/clues")
def clues():
    """
    /Clues
    Url: /api/clues
    Options All options are optional:
    value(int): the value of the clue in dollars
    category(int): the id of the category you want to return
    min_date(date): earliest date to show, based on original air date
    max_date(date): latest date to show, based on original air date
    offset(int): offsets the returned clues. Useful in pagination
    """
    return "Clues!"

@app.route("/random")
def random():
    """
    /Random
    Url: /api/random
    Options:
    count(int): amount of clues to return, limited to 100 at a time
    """
    return "Random!"

@app.route("/categories")
def categories():
    """
    /Categories
    Url: /api/categories
    Options:
    count(int): amount of categories to return, limited to 100 at a time
    offset(int): offsets the starting id of categories returned. Useful in pagination.
    """
    return "Categories!"

@app.route("/category")
def category():
    """
    /Category
    Url: /api/category
    Options:
    id(int): Required the ID of the category to return.
    """
    return "Category!"


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=1)
