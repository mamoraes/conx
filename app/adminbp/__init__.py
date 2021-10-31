from flask import Blueprint

bp = Blueprint('admin_bp', __name__)

from app.adminbp import routes