from phais import app
from flask import Response, render_template

@app.route('/sse_source')
def sse_request():
	def generator():
		for c in 'abcdefg':
			yield 'data: %s\n\n' % c

	return Response(generator(), mimetype='text/event-stream')

@app.route('/')
def sse_page():
	return render_template('sse_test.html')