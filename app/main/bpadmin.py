from flask import Blueprint
from flask_admin import Admin

class AdminBlueprint(Blueprint):
    views=None

    def __init__(self,*args, **kargs):
        self.views = []
        self.name = 'adm'
        super(AdminBlueprint, self).__init__('admin2', __name__,url_prefix='/admin2',static_folder='static', static_url_path='/static/admin')


    def add_view(self, view):
        self.views.append(view)

    def register(self,app, options, first_registration=False):
        admin = Admin(app, name='conx', template_mode='adminlte')

        for v in self.views:
            admin.add_view(v)

        return super(AdminBlueprint, self).register(app, options, first_registration)