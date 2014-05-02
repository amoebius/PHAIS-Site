from phais import app
from flask import render_template

@app.route('/<game>')
def visualizer(game):
	# ALL TEMP:
	game = 'log'
	return render_template('visualizer.html', log=' '.join(map(str.strip, open('/tmp/' + game).readlines())))
