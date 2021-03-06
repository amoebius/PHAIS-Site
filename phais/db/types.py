
class DBField(object):
	db_create = ''
	db_verify = dict()
	db_nullable = False
	db_automatic = False

	@classmethod
	def get_create(cls, name):
		return name + ' ' + cls.db_create

	@classmethod
	def verify(cls, dictCursor):
		return all(dictCursor[key] == value for key, value in cls.db_verify.items())

	@staticmethod
	def get_sort_key():
		return 9001

	def get_value(self):
		raise NotImplementedError('Abstract method "get_value" called on DBField.')

	def __new__(cls, value):
		if value is None:
			return None
		return super(DBField, cls).__new__(cls, value)



class DBId(DBField, int):
	db_create = 'INT UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT UNIQUE'
	db_verify = {
		'DATA_TYPE'  : 'int',
		'EXTRA'      : 'auto_increment',
		'IS_NULLABLE': 'NO',
	}
	db_automatic = True

	@staticmethod
	def get_sort_key():
		return 0

	def get_value(self):
		return int(self)


class DBInt(DBField, int):
	db_create = 'INT NOT NULL'
	db_verify = {
		'DATA_TYPE'  : 'int',
		'IS_NULLABLE': 'NO',
	}

	@staticmethod
	def get_sort_key():
		return 2

	def get_value(self):
		return int(self)

class DBStr(DBField, str):
	db_create = 'TEXT NOT NULL'
	db_verify = {
		'DATA_TYPE'  : 'text',
		'IS_NULLABLE': 'NO',
	}

	@staticmethod
	def get_sort_key():
		return 3

	def get_value(self):
		return str(self)

class DBBlank(DBField):
	''' Used to remove an inherited field. '''