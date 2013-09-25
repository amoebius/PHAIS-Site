from phais import app
from flask import render_template

from phais.db import db

@app.errorhandler(404)
def not_found(error):
	with db as c:
		c.execute('SELECT * FROM user')
		return str(c.fetchall())
	return render_template('error_404.html'), 404
