from . import DBObject

class User(DBObject):

	def __init__(self, uid):
		super(User, self).__init__('user', {'username': str, 'email': str, 'password': str, 'name': str}, id=uid)