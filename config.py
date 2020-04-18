"""
Simple configuration file.
"""

class ProdConfig(object):
    DEBUG = False
    TESTING = False
    SERVER_NAME = "0.0.0.0:8443"

class DevConfig(object):
    DEBUG = True
    TESTING = True
    SERVER_NAME = "0.0.0.0:5000"
