'''
All classes of objects representing database entries are instances of the DBType metaclass.
DBType instances will be checked for validity, and have their schema verified against the database, creating tables where
none exist or raising an exception where the existing table does not match the schema.
'''

from . import dbc
from .exception import DBTableFormatException, DBTypeException
from .types import T

class DBType(type):
	
	def __init__(cls, name, bases, attr):
		super(DBType, cls).__init__(name, bases, attr)

		if 'dbproperties' not in attr or type(cls.dbproperties) is not dict:
			raise DBTypeException('"dbpropertites" dictionary not defined as expected by "%s" class.' % name)
		if 'dbtable' not in attr or type(cls.dbtable) is not str:
			raise DBTypeException('"dbtable" string not defined as expected by "%s" class.' % name)

		with dbc as c:
			c.execute("SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'phais' AND table_name = %s" % cls.dbtable)
			
			if c:
				# If the table exists, verify that its schema matches that of the class:
				c.execute("SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'phais'")
				columns = set(result['column_name'] for result in c)

				if set(cls.dbproperties.keys()) | {'id'} != columns:
					raise DBTableFormatException(
						'Table "{}" does not have the expected format.\n'.format(name) +
					    'Columns expected were {}, but the columns were {}.\n'.format(
					    	str(sorted(set(cls.dbproperties.keys()) | {'id'})), str(sorted(columns))) +
					    'To have this table recreated, delete it first.  Otherwise, alter the table schema.')

			else:
				# Create the table!
				c.execute('CREATE TABLE {} (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT'.format(cls.dbtable) + (', ' if len(cls.dbproperties) else ' ') +
				          ', '.join('{} {}'.format(name, T(data)) for name, data in sorted(self.dbproperties.items())) +
				          ')')