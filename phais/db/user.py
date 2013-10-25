from . import DBObject

class User(DBObject):

	dbtable = 'user'
	dbproperties = {'username': str, 'email': str, 'password': str, 'name': str}

	def __init__(self, id):
		self.load(id=id)
