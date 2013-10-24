from MySQLdb import connect, paramstyle
from .cursor import Cursor
from phais import app

dbconfig = app.config['DB']
db = connect(user = dbconfig.user, passwd = dbconfig.passwd, db = dbconfig.db, cursorclass = Cursor)

from user import User
from dbobject import DBObject