from flask import Flask
app = Flask('phais', instance_relative_config = True)

app.config.from_pyfile('phais.cfg')

from db import db as dbc

import handlers
