from . import db
from .exception import DBTableFormatException
from .types import T

with db as c:
	c.execute("SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'phais'")
	existing = set(result['table_name'] for result in c)

registered = dict()

class Table(object):
	
	def __init__(self, name, properties):
		self.name = name
		self.properties = dict((key, val) for key, val in properties.items() if key != 'id')

		if name in existing:
			with db as c:
				c.execute("SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'phais'")
				columns = set(result['column_name'] for result in c)

			if set(self.properties.keys()) | {'id'} != columns:
				raise DBTableFormatException('Table "{}" does not have the expected format.\n'.format(self.name) +
				                             'Columns expected were {}, but the columns were {}.\n'.format(set(self.properties.keys()) | {'id'}, str(columns)) +
				                             'To have this table recreated, delete it first.  Otherwise fix the expected properties listing.')

		else:
			# Create the table!
			with db as c:
				c.execute('CREATE TABLE {} (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT'.format(self.name) + (', ' if len(self.properties) else ' ') +
				          ', '.join('{} {}'.format(name, T(data)) for name, data in sorted(self.properties.items())) +
				          ')')

			existing.add(self.name)


def register(dbobject):
	if dbobject.dbtable not in registered:
		registered[dbobject.dbtable] = Table(dbobject.dbtable, dbobject.dbproperties)