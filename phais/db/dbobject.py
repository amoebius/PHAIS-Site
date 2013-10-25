from . import db

# Possible extensions:
# - Provide querying interface involving conditionals etc.
# - Allow additional functions to be applied to queries.

class DBObject(object):
	
	def __init__(self, table, properties, **kwargs):
		self._dbo_table = table
		self._dbo_properties = dict((name, data) for name, data in properties.items() if name != 'id')
		if kwargs:
			self._dbo_load(**kwargs)


	def _dbo_load(self, **kwargs):

		with db as c:

			c.execute('SELECT ' + ', '.join(self._dbo_properties.keys()) + ' FROM {} WHERE '.format(self._dbo_table) + ' AND '.join(key + '=%s' for key in kwargs.keys()) + ' LIMIT 1', kwargs.values())

			if not c: return False

			self._dbo_init(**c.fetchone())

		return True


	def _dbo_init(self, **kwargs):
		for key, value in kwargs.items():
			# Possibility:  Prefix the attributes, or encapsulate them in an object?  This will be fine for now:
			setattr(self, key, value)


	def _dbo_save(self):

		with db as c:

			data = dict((prop, getattr(self,prop)) for prop in self._dbo_properties.keys())

			c.execute('UPDATE {} SET '.format(self._dbo_table) + ', '.join(key + '=%s' for key in data.keys()), data.values())

	save = _dbo_save
	load = _dbo_load