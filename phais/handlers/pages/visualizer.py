from phais import app
import flask

@app.route('/<game>')
def visualizer(game):
	# ALL TEMP:
	game = 'log' + str(int(game))
	try:
		return flask.render_template('visualizer.html', log=' '.join(map(str.strip, open('/tmp/' + game).readlines())))
	except:
		flask.abort(404)
