"""
jGato Utility Library

Various helper functions.
"""

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

def build_tables(conn):
    """
    Create temporary tables to stay resident with the daemon.

    Data from the pre-existing categories and clues tables are joined and 
    filtered ahead of time for real-time SELECT performance.
    """

    query_to_create_temp_table = \
        "CREATE TEMP TABLE {} AS " \
        "SELECT cl.id as id, cl.game_id as show_number, cat.id as category_id, " \
            "cat.title as category_title, cl.answer as response, cl.question as clue, " \
            "cl.value as value, cl.airdate as airdate " \
        "FROM clues as cl, categories as cat " \
        "WHERE cat.id = cl.category_id{};" \

    query_to_filter_specific_round = \
        " AND (cl.game_id, cat.id) IN (" \
        "SELECT DISTINCT cl.game_id, cat.id " \
        "FROM clues AS cl, categories AS cat " \
        "WHERE cat.id = cl.category_id AND ({}){})" 

    query_to_filter_out_incomplete_categories = \
        " AND (cl.game_id, cat.id) IN (" \
        "SELECT cl.game_id, cat.id " \
        "FROM clues as cl, categories as cat " \
        "WHERE cat.id = cl.category_id " \
        "GROUP BY cl.game_id, cat.id " \
        "HAVING COUNT(*) = 5)"

    table_query_map = {
        "jeopardy_round":
            query_to_create_temp_table.format("jeopardy_round", 
                query_to_filter_specific_round.format("cl.value = 200 or cl.value = 600", 
                    query_to_filter_out_incomplete_categories)),
        "double_jeopardy_round":
            query_to_create_temp_table.format("double_jeopardy_round", 
                query_to_filter_specific_round.format("cl.value > 1000", 
                    query_to_filter_out_incomplete_categories)),
        "final_jeopardy_round":
            query_to_create_temp_table.format("final_jeopardy_round", 
                query_to_filter_specific_round.format("cl.value = 0", 
                    "")),
    }

    cur = conn.cursor()
    for query in table_query_map.values():
        cur.execute(query)

