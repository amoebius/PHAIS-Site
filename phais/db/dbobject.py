from . import db
from .exception import DBInvalidObjectException

# Possible extensions:
# - Provide querying interface involving conditionals etc.
# - Allow additional functions to be applied to queries.

class DBObject(object):
	
	def __init__(self):
		pass # Currently unused!


	def load(self, **kwargs):

		self._invalidate()

		with db as c:

			c.execute('SELECT id' + (', ' if len(self.dbproperties) else ' ') +
				      ', '.join(self.dbproperties.keys()) + ' FROM {} WHERE '.format(self.dbtable) +
				      ' AND '.join(key + '=%s' for key in kwargs.keys()) + ' LIMIT 1',
				      kwargs.values())

			if not c: return False

			self._dbo_init(**c.fetchone())

		self._validate()
		return True


	def _dbo_init(self, **kwargs):
		
		for key, value in kwargs.items():
			# Possibility:  Prefix the attributes, or encapsulate them in an object?  This will be fine for now:
			setattr(self, key, value)


	def save(self):
		if not self: raise DBInvalidObjectException

		with db as c:

			data = dict((prop, getattr(self,prop)) for prop in self.dbproperties.keys())

			c.execute('UPDATE {} SET '.format(self.dbtable) +
				      ', '.join(key + '=%s' for key in data.keys()) +
				      ' WHERE id={}'.format(self.id),
				      data.values())


	def delete(self):
		if not self: raise DBInvalidObjectException

		with db as c:
			# Delete the record with this id:
			c.execute('DELETE FROM {} WHERE id=%s'.format(self.dbtable), [self.id])
		
		self._invalidate()


	@classmethod
	def new(cls, **kwargs):
		
		for key in kwargs.keys():
			if key not in cls.dbproperties:
		
				if key == 'id':
					raise ValueError('An "id" parameter was passed in creating a new record in the {} table.  ' +
						             'This is an automatic, compulsory field, and must not be specified.'.format(cls.dbtable))
				else:
					raise ValueError('Parameter "{}" passed in creating new database record in the "{}" table does not occur in the database schema.'.format(key, cls.dbtable))


		with db as c:

			c.execute('INSERT INTO {} ('.format(cls.dbtable) + ', '.join(sorted(kwargs.keys())) + ') VALUES (' + ', '.join('%s' for i in range(len(kwargs))) + ')',
				      [dbtype(kwargs[key]) for key, dbtype in sorted(cls.dbproperties.items())])
			
			return cls(id=c.lastrowid)


	_dbvalid = False
	def _validate(self):
		if not self._dbvalid: self._dbvalid = True
	def _invalidate(self):
		if self._dbvalid: self._dbvalid = False

	def __nonzero__(self):
		return self._dbvalid