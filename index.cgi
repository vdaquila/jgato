#!/usr/bin/python3
from wsgiref.handlers import CGIHandler
from jgato import app, bp

app.register_blueprint(bp)
CGIHandler().run(app)
