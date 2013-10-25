from flask import Flask
app = Flask('phais', instance_relative_config = True)

app.config.from_pyfile('phais.cfg')

import errors
import redirect
