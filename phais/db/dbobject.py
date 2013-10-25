from . import db

# Possible extensions:
# - Provide querying interface involving conditionals etc.
# - Allow additional functions to be applied to queries.

class DBObject(object):
	
	def __init__(self):
		pass


	def load(self, **kwargs):

		with db as c:

			c.execute('SELECT ' + ', '.join(self.dbproperties.keys()) + ' FROM {} WHERE '.format(self.dbtable) + ' AND '.join(key + '=%s' for key in kwargs.keys()) + ' LIMIT 1', kwargs.values())

			if not c: return False

			self._dbo_init(**c.fetchone())

		return True


	def _dbo_init(self, **kwargs):
		for key, value in kwargs.items():
			# Possibility:  Prefix the attributes, or encapsulate them in an object?  This will be fine for now:
			setattr(self, key, value)


	def save(self):

		with db as c:

			data = dict((prop, getattr(self,prop)) for prop in self.dbproperties.keys())

			c.execute('UPDATE {} SET '.format(self.dbtable) + ', '.join(key + '=%s' for key in data.keys()), data.values())