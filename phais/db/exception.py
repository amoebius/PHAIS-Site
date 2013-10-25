
class DBException(Exception):
	pass

class DBTableFormatException(DBException):
	pass

class DBInvalidObjectException(DBException):
	pass