from phais import db

class User(db.DBObject):

	class Meta(db.DBType.Meta):
		table = 'user'

	user_id  = db.types.DBId
	username = db.types.DBStr
	email    = db.types.DBStr
	password = db.types.DBStr
	name     = db.types.DBStr

	def __init__(self, user_id):
		super(User, self).__init__()
		self.load(user_id = user_id)

	def save(self):
		super(User, self).save(user_id = self.user_id)

	@classmethod
	def create(cls, **kwargs):
		return User(super(User, self).create(**kwargs))