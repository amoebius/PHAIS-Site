from MySQLdb import connect
from phais.db.cursor import Cursor
from phais import app

dbconfig = app.config['DB']
db = connect(user = dbconfig.user, passwd = dbconfig.passwd, db = dbconfig.db, cursorclass = Cursor)
