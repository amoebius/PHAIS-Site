from . import db
from .exception import DBTableFormatException
from .types import T

with db as c:
	c.execute("SELECT table_name FROM INFORMATION_SCHEMA.TABLES WHERE table_schema = 'phais'")
	tables = set(result['table_name'] for result in c)

class Table(object):
	
	def __init__(self, name, properties):
		self.name = name
		self.properties = dict((key, val) for key, val in properties.items() if key != 'id')

		if name in tables:
			with db as c:
				c.execute("SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'phais'")
				columns = set(result['column_name'] for result in c)

			if self.properties != columns:
				raise DBTableFormatException('Table "{}" does not have the expected format.\n'.format(self.name) +
				                             'Columns expected were {}, but the columns were {}.\n'.format(str(self.properties), str(columns)) +
				                             'To have this table recreated, delete it first.  Otherwise fix the expected properties listing.')

		else:
			# Create the table!
			with db as c:
				c.execute('CREATE TABLE {} (id INT NOT NULL PRIMARY KEY AUTO_INCREMENT, '.format(self.name) +
				          ', '.join('{} {}'.format(name, T(data)) for name, data in self.properties.items()) +
				          ')')