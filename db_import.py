#!/usr/bin/python3
"""
Create the jGato sqlite DB from CSV files.

Run local to the jGato project. There must be three files present:
jeopardy_round.csv, double_jeopardy_round.csv, and final_jeopardy_round.csv.

These files should not have headers. The fields should follow the order:

id, show_number, category_id, category_title, response, clue, value, airdate

Once run, jgato.db is created. To recreate it, delete the file and run again.
"""

import csv
import sqlite3

def import_data(conn):
    """Import CSV."""
    cur = conn.cursor()

    # Create table
    rounds = ("jeopardy_round", "double_jeopardy_round", "final_jeopardy_round")
    fieldnames = ("id", "show_number", "category_id", "category_title", "response", "clue", \
        "value", "airdate")

    for round_key in rounds:
        create_query = \
            "CREATE TABLE IF NOT EXISTS {} (" \
                "id integer PRIMARY KEY," \
                "show_number integer NOT NULL," \
                "category_id integer NOT NULL," \
                "category_title text NOT NULL," \
                "response text NOT NULL," \
                "clue text NOT NULL," \
                "value integer NOT NULL," \
                "airdate text" \
            ");".format(round_key)
        cur.execute(create_query)

        # Import data
        insert_query = ("INSERT INTO {} ({}) VALUES ({});".format(round_key, ", ".join(fieldnames), ", ".join([":{}".format(f) for f in fieldnames])))
        with open("{}.csv".format(round_key,"rb")) as fin:
            for row_d in csv.DictReader(fin, fieldnames=fieldnames):
                cur.execute(insert_query, row_d)

    conn.commit()
    conn.close()

if __name__ == '__main__':
    conn = sqlite3.connect("jgato.db")
    import_data(conn)
