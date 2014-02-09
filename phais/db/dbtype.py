'''
All classes of objects representing database entries are instances of the DBType metaclass.
DBType instances will be checked for validity, and have their schema verified against the database, creating tables where
none exist or raising an exception where the existing table does not match the schema.
'''

from . import dbc
from .exception import DBTableFormatException, DBTypeException
from . import types
from .dbobject import DBObject

class DBType(type):

	class Meta(object):
		abstract = False
		
	class Abstract(Meta):
		abstract = True


	
	def __new__(meta, name, bases, attr):
		
		if 'Meta' not in attr:
			attr['Meta'] = DBType.Meta
		dbmeta = attr['Meta']

		if not issubclass(dbmeta, DBType.Meta):
			raise DBTypeException('"Meta" attribute was not a subclass of DBType.Meta as expected in the definition of the "%s" class.' % name)
		if dbmeta in (Meta, Abstract): # <- List of Metas we implement
			raise DBTypeException('"Meta" attribute must subclass DBType.Meta, not be a copy of these! (See definition of the "%s" class...)' % name)

		
		if 'table' not in dbmeta.__dict__:
			table = name
			dbmeta.table = name
		else:
			table = dbmeta.table
			if not isinstance(table, str):
				raise DBTypeException('"Meta.table" was not a string as expected in "%s" class.' % name)
		
		# Find all fields:
		fields = dict((key, value) for key, value in attr.items() if issubclass(value, types.DBField))

		seen_classes = set()
		def find_fields(cls):
			if not issubclass(cls, DBObject) or cls in seen_classes:
				return
			seen_classes.add(cls)

			for key, value in cls.Meta.fields.items():
				if key not in fields:
					fields[key] = value

			for ancestor in cls.__mro__:
				find_fields(cls)

		dbmeta.fields = fields

		# Remove fields from the class:
		for key in fields:
			del attr[key]

		# Remove fields marked 'DBBlank':
		useless_fields = [key for key, value in fields.items() if value is types.DBBlank]
		for field in useless_fields:
			del fields[field]



		if not dbmeta.abstract:
			
			with dbc as c:
				c.execute("SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'phais' AND table_name = %s" % dbmeta.table)
				
				if c:
					# If the table exists, verify that its schema matches that of the class:
					c.execute("SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE table_schema = 'phais' AND table_name = %s" % dbmeta.table)
					results = list(c)

					columns = set(result['column_name'] for result in results)
					if set(fields.keys()) - columns:
						raise DBTableFormatException(
							'Table "{}" does not have the expected format.\n'.format(dbmeta.table) +
						    'Columns expected were {}, but the columns were {}.\n'.format(
						    	str(sorted(set(fields.keys()) | {'id'})), str(sorted(columns))) +
						    'To have this table recreated, delete it first.  Otherwise, alter the table schema.')

					for result in results:
						if not field[result['column_name']].verify(result):
							raise DBTableFormatException(
								'Table "{}" does not have the expected format.\n'.format(dbmeta.table) +
								'Column "{}" failed verification against the DBField type "{}".'.format(result['column_name'], field[result['column_name']].__name__)
								)

				else:
					if not fields:
						raise DBTypeException("No fields were found for DBType-derived class '%s'!" % name)
					# Create the table!
					c.execute('CREATE TABLE %s (' + ', '.join(dbfield.get_create(name) for name, dbfield in sorted(fields.items(), key = lambda item: (item[1].get_sort_key(), item[0])) + ')') + ')')

		super(DBType, meta).__new__(name, bases, attr)