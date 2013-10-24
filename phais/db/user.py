from . import DBObject

class User(DBObject):

	def __init__(self, uid):
		super(User, self).__init__('user', {'username', 'email', 'password', 'id', 'name'}, id=uid)

	def save(self):
		self._dbo_save()