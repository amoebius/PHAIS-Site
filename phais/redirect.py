from phais import app
from flask import redirect

@app.route('/favicon.ico')
def favicon_redirect():
	return redirect('/static/favicon.ico')

