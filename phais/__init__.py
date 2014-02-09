from flask import Flask
app = Flask('phais', instance_relative_config = True)

app.config.from_pyfile('config.py')

import handlers

from models.user import User