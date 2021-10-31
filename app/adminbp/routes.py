from flask_admin.contrib.sqla import ModelView
from app import admin
from app.models import *

admin.add_view(ModelView(Conexao, db.session))
