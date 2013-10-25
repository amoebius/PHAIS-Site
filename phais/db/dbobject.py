from . import db
from .exception import DBInvalidObjectException

# Possible extensions:
# - Provide querying interface involving conditionals etc.
# - Allow additional functions to be applied to queries.

class DBObject(object):
	'''
	A base class for objects that have a representation in the database.
	Subclasses must define 'dbtable' and 'dbproperties' to specify the table in which the data is stored, and the
	column names and types.  The 'dbproperties' attribute is a dictionary mapping from property names to associated
	types.  The 'db.types' module will support forming more specific database types.

	Provides functionality for loading a record (adding to the object's attributes the specified properties, once loaded)
	from the database, saving records (after the attributes have been modified), deleting records, and creating new
	records.  Note that a numeric 'id' field is automatically created and loaded, and must not be specified in
	'dbproperties' or altered.
	'''
	
	
	def __init__(self):
		pass # Currently unused!


	def load(self, **kwargs):
		''' Loads a record from the database matching the parameters given as keyword arguments. '''

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
		''' Initialises the object based off properties passed as keyword arguments, set as attributes currently. '''
		
		for key, value in kwargs.items():
			# Possibility:  Prefix the attributes, or encapsulate them in an object?  This will be fine for now:
			setattr(self, key, value)


	def save(self):
		''' Saves any changes made to this record to the database. '''

		if not self: raise DBInvalidObjectException

		with db as c:

			data = dict((prop, getattr(self,prop)) for prop in self.dbproperties.keys())

			c.execute('UPDATE {} SET '.format(self.dbtable) +
				      ', '.join(key + '=%s' for key in data.keys()) +
				      ' WHERE id={}'.format(self.id),
				      data.values())

			return True if c else False


	def delete(self):
		''' Deletes this record from the database. '''

		if not self: raise DBInvalidObjectException

		with db as c:
			# Delete the record with this id:
			c.execute('DELETE FROM {} WHERE id=%s'.format(self.dbtable), [self.id])

			if not c: return False

		self._invalidate()
		return True
		

	@classmethod
	def new(cls, **kwargs):
		''' Creates a new record with the given values (passed as keyword arguments), returning a new representative object on success and 'None' on failure. '''
		
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
			
			if not c: return None

			return cls(id=c.lastrowid)



	_dbvalid = False

	def _validate(self):
		''' Sets the internal state of the object to 'valid'. '''
		if not self._dbvalid: self._dbvalid = True

	def _invalidate(self):
		''' Sets the internal state of the object to 'invalid'. '''
		if self._dbvalid: self._dbvalid = False

	def __nonzero__(self):
		''' Overrides 'nonzero' to check if the object is marked 'valid'. '''
		return self._dbvalid