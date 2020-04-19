"""
jGato Utility Library

Various helper functions:
 * decode_cat_uid(): Given a cat uid, decode to game and cat ids
 * encode_cat_uid(): Given game and cat ids, encode to a cat uid
 * error_response(): Returns an error message in JSON payload
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

def error_response(message=None, status_code=400):
    """
    Returns an error message in JSON payload

    Parameters
    ----------
    message: str
        String to describe error
    status_code: int
        HTML code (default is 400)

    Returns
    -------
    flask.Response
        flask jsonify response payload
    """
    payload = {'error': HTTP_STATUS_CODES.get(status_code, 'Unknown error')}
    if message:
        payload['message'] = message
    response = jsonify(payload)
    response.status_code = status_code
    return response 
