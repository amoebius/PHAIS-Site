from . import db

# Possible extensions:
# - Provide querying interface involving conditionals etc.
# - Allow additional functions to be applied to queries.

class DBObject(object):
	
	def __init__(self, table, properties, **kwargs):
		self._dbo_table = table
		self._dbo_properties = set(properties)
		if kwargs:
			self._dbo_load(**kwargs)


	def _dbo_load(self, **kwargs):

		with db as c:

			if kwargs:
				c.execute('SELECT * FROM %s WHERE ' + ' AND '.join('%s=%s' for i in range(len(kwargs)), [self._dbo_table] + [value for item in kwargs.items() for value in item])
			else:
				c.execute('SELECT * FROM %s')

			if not c: return False

			self._dbo_init(**c.fetchone())

		return True


	def _dbo_init(**kwargs):
		for key, value in kwargs.items():
			# Possibility:  Prefix the attributes, or encapsulate them in an object?  This will be fine for now:
			setattr(self, key, value)


	def _dbo_save(self):

		with db as c:

			data = dict((prop, getattr(self,prop)) for prop in self._dbo_properties)

			c.execute('UPDATE %s SET ' + ', '.join('%s=%s' for i in range(len(data))), [self._dbo_table] + [value for item in data.items() for value in item])