from phais import app
from flask import redirect

# Temporary, should give this location in the webpages:
@app.route('/favicon.ico')
def favicon_redirect():
	return redirect('/static/img/favicon.ico')

