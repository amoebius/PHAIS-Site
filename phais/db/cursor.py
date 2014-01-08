from MySQLdb.cursors import DictCursor

# A small wrapper of a DictCursor that provides support for len(cursor) and cursor.rows().
# Far more impressive functionality is expected.
class Cursor(DictCursor):
	__len__ = rows = lambda self: max(self.rowcount, 0)
	__nonzero__ = lambda self: len(self) > 0
