from MySQLdb import connect
from .cursor import Cursor
from phais import app

dbconfig = app.config['DB']
db = connect(user = dbconfig.user, passwd = dbconfig.passwd, db = dbconfig.db, cursorclass = Cursor)

from .dbobject import DBObject
from .user import User
from . import tables

for obj in [User]:
	tables.register(obj)