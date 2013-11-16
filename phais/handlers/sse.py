from phais import app
from flask import Response, render_template, redirect, request
from random import randint


from collections import deque
from time import sleep
users = dict()

class Responder(object):
	def __init__(self, user):
		self.user = user
		self.q = list()
	def generate(self, n=0):
		while True:
			while len(self.q) <= n:
				sleep(0.5)
			while len(self.q) > n:
				yield 'id: %d\ndata: <dt>%s</dt> <dd>%s</dd>\n\n' % (n, self.q[n][0], self.q[n][1])
				n += 1
	def addmsg(self, who, msg):
		self.q.push_back((who,msg))

@app.route('/sse/<user>')
def sse_request():
	r = Responder(user)
	users.append(r)
	return Response(r.generate(), mimetype='text/event-stream')

@app.route('/', methods = ['GET', 'POST'])
def make_user():
	if request.method == 'GET':
		return redirect('/guest%d' % randint(1,1000000))
	else:
		for user in users:
			user.addmsg(request.form.get('from',''), request.form.get('message',''))
		return ''

@app.route('/<user>')
def sse_page(user):
	return render_template('sse_test.html', user=user)