from . import dbc
from .exception import DBInvalidObjectException
from .dbtype import DBType
from . import types

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

	# DBObject derived classes will be instances of the DBType metaclass:
	__metaclass__ = DBType


	class Meta(DBType.Abstract):
		pass
	
	def __init__(self):
		pass


	def load(self, **kwargs):
		''' Loads a record from the database matching the parameters given as keyword arguments. '''

		for key in kwargs.keys():
			if key not in cls.Meta.fields:
				raise ValueError('Parameter "{}" passed for loading a database record in the "{}" table does not occur in the table schema.'.format(key, cls.Meta.table))

		self._invalidate()

		with dbc as c:

			properties = sorted(kwargs.items())
			fields = self.Meta.fields

			c.execute('SELECT' + ', '.join(key for key, _ in properties) + ' FROM {} WHERE '.format(self.Meta.table) +
				      ' AND '.join(key + ' = %s' for key, _ in properties) + ' LIMIT 1',
				      [fields[key](value).get_value() for key, value in properties])

			if not c: return False

			self.init(**c.fetchone())

		self._validate()
		return True


	def init(self, **kwargs):
		''' Initialises the object based off properties passed as keyword arguments. '''
		
		for key, dbtype in self.Meta.fields:
			
			if key not in kwargs:
				if dbtype.db_nullable:
					value = None
				else:
					raise DBInvalidObjectException('Non-nullable field "%s" was not passed to DBObject.init(self, **kwargs)!' % key)
			else:
				value = dbtype(kwargs[key])

			setattr(self, key, value)


	def save(self, **kwargs):
		''' Saves any changes made to this record to the database. '''

		if not self: raise DBInvalidObjectException

		for key in kwargs.keys():
			if key not in cls.Meta.fields:
				raise ValueError('Parameter "{}" passed for saving a database record in the "{}" table does not occur in the table schema.'.format(key, cls.Meta.table))

		with dbc as c:

			fields = sorted(self.Meta.fields.keys())
			properties = sorted(kwargs.items())

			c.execute('UPDATE {} SET '.format(self.Meta.table) +
				      ', '.join(key + '= %s' for key in fields) +
				      ' WHERE ' + ', '.join(key + '= %s' for key, _ in properties),
				      [getattr(self, key) for key in fields] + [self.Meta.fields[key](value).get_value() for key, value in properties])

			return True if c else False


	@classmethod
	def delete(cls, **kwargs):
		''' Deletes all records matching the given arguments from the database. '''

		for key in kwargs.keys():
			if key not in cls.Meta.fields:
				raise ValueError('Parameter "{}" passed for deleting database records in the "{}" table does not occur in the table schema.'.format(key, cls.Meta.table))

		properties = sorted(kwargs.items())

		with dbc as c:
			# Delete the record with this id:
			c.execute('DELETE FROM {} WHERE '.format(self.dbtable) + ', '.join(key + ' = %s' for key, _ in properties), [cls.Meta.fields[key](value) for key, value in properties])

			return c.rowcount
		

	@classmethod
	def create(cls, **kwargs):
		''' Creates a new record with the given values (passed as keyword arguments), returning a new id on success and 'None' on failure. '''
		
		for key in kwargs.keys():
			if key not in cls.Meta.fields:
				raise ValueError('Parameter "{}" passed in creating new database record in the "{}" table does not occur in the table schema.'.format(key, cls.Meta.table))

		for field, dbtype in cls.Meta.fields.items():
			if field not in kwargs:
				if dbtype.db_nullable:
					kwargs[field] = None
				else:
					raise ValueError('Expected keyword parameter "{}" not given to DBObject.new!'.format(field))
			else:
				if dbtype.db_automatic:
					raise ValueError('Automatic field "{}" given as keyword parameter to DBObject.new!'.format(field))
				kwargs[field] = dbtype(kwargs[field])


		with dbc as c:

			properties = sorted(kwargs.items())

			c.execute('INSERT INTO {} ('.format(cls.dbtable) + ', '.join(key for key, _ in properties) + ') VALUES (' + ', '.join('%s' for i in range(len(properties))) + ')',
				      [value for _, value in properties])
			
			if not c: return None

		return types.DBId(c.lastrowid)



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