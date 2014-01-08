
class DBException(Exception):
	''' Database exceptions base class. '''

class DBTypeException(DBException):
	''' Represents an error in a database class' definition. '''

class DBTableFormatException(DBException):
	''' Represents an error in a database table's format. '''

class DBInvalidObjectException(DBException):
	''' Represents an error where an invalid database object has been acted upon. '''