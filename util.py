"""
jGato Utility Library

Various helper functions:
 * choices()       : random.choices() backported for pre-3.6 compat
 * decode_cat_uid(): Given a cat uid, decode to game and cat ids
 * encode_cat_uid(): Given game and cat ids, encode to a cat uid
 * error_response(): Returns an error message in JSON payload
"""

from itertools import accumulate as _accumulate, repeat as _repeat
from bisect import bisect as _bisect
import random

def choices(population, weights=None, *, cum_weights=None, k=1):
    """Return a k sized list of population elements chosen with replacement.
    If the relative weights or cumulative weights are not specified,
    the selections are made with equal probability.
    """
    n = len(population)
    if cum_weights is None:
        if weights is None:
            _int = int
            n += 0.0    # convert to float for a small speed improvement
            return [population[_int(random.random() * n)] for i in _repeat(None, k)]
        cum_weights = list(_accumulate(weights))
    elif weights is not None:
        raise TypeError('Cannot specify both weights and cumulative weights')
    if len(cum_weights) != n:
        raise ValueError('The number of weights does not match the population')
    bisect = _bisect
    total = cum_weights[-1] + 0.0   # convert to float
    hi = n - 1
    return [population[bisect(cum_weights, random.random() * total, 0, hi)]
            for i in _repeat(None, k)]

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
