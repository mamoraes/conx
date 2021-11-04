from datetime import datetime

from flask import render_template, flash, redirect, url_for, request, g, \
    jsonify, current_app
from flask_login import current_user, login_required
from flask_babel import _, get_locale
#from guess_language import guess_language
from app import db

from app.main.forms import *
from app.models import *
from app.translate import translate
from app.main import bp
from sqlalchemy.exc import SQLAlchemyError

import logging
log = logging.getLogger(__name__)
#from  app.main import nlp
from werkzeug.utils import secure_filename
import csv
import copy
import json
import os

from app.main.gerargrafo import Aresta, Nodo, NoPF, NoPJ, NoCaso, NoRinf

from app.database_aux import dbaux as dbx
from app.database_aux import * #so_digitos, validar_cpf_cnpj
#import config

#from app.main.database_aux import dbx


@bp.before_app_request
def before_request():
    if current_user.is_authenticated:
        current_user.last_seen = datetime.utcnow()
        db.session.commit()
    g.locale = str(get_locale())


@bp.route('/', methods=['GET', 'POST'])
@bp.route('/index', methods=['GET', 'POST'])
@login_required
def index():
#    form = PostForm()
#    if form.validate_on_submit():
#        language = guess_language(form.post.data)
#        if language == 'UNKNOWN' or len(language) > 5:
#            language = ''
#        post = Post(body=form.post.data, author=current_user,
#                    language=language)
#       db.session.add(post)
#       db.session.commit()
#       flash(_('Your post is now live!'))
#       return redirect(url_for('main.index'))
#    page = request.args.get('page', 1, type=int)
    return render_template('index.html', title=_('Home'), form=None)


@bp.route('/user/<username>')
@login_required
def user(username):
    user = User.query.filter_by(username=username).first_or_404()
    return render_template('user.html', user=user)


@bp.route('/edit_profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
    form = EditProfileForm(current_user.username)
    if form.validate_on_submit():
        current_user.username = form.username.data
        current_user.about_me = form.about_me.data
        db.session.commit()
        flash(_('As alterações foram registradas.'))
        return redirect(url_for('main.edit_profile'))
    elif request.method == 'GET':
        form.username.data = current_user.username
        form.about_me.data = current_user.about_me
    return render_template('edit_profile.html', title=_('Edit Profile'),
                           form=form)


@bp.route('/translate', methods=['POST'])
@login_required
def translate_text():
    return jsonify({'text': translate(request.form['text'],
                                      request.form['source_language'],
                                      request.form['dest_language'])})

@bp.route('/conexoes')
@login_required
def conexoes():
    page = request.args.get('page', 1, type=int)
    conexoes = Conexao.query.order_by(Conexao.nome.asc()).paginate(
        page, current_app.config['POSTS_PER_PAGE'], False)
    next_url = url_for('main.conexoes', page=conexoes.next_num) \
        if conexoes.has_next else None
    prev_url = url_for('main.conexoes', page=conexoes.prev_num) \
        if conexoes.has_prev else None
    return render_template('conexoes.html', title=_('Conexões'),
                           conexoes=conexoes.items, next_url=next_url,
                           prev_url=prev_url)

@bp.route('/addconexao', methods=['GET', 'POST'])
@login_required
def add_conexao():
    conexao=Conexao()
    form = EditConexaoForm(obj=conexao, id=conexao.id)
    if form.validate_on_submit():
        form.populate_obj(conexao)
        db.session.add(conexao)
        db.session.commit()
        flash(_('As alterações foram registradas.'))
        return redirect(url_for('main.conexoes'))
    return render_template('edit_conexao.html', title=_('Nova Conexão'), id=conexao.id,
                           form=form)


@bp.route('/editconexao/<id>', methods=['GET', 'POST'])
@login_required
def edit_conexao(id):
    conexao = Conexao.query.filter_by(id=id).first_or_404()
    if conexao is None:
        flash(_('Conexão %(id) não encontrada.', id=id))
        return redirect(url_for('main.conexoes'))

    form = EditConexaoForm(obj=conexao, id=id)
    if form.validate_on_submit():
        form.populate_obj(conexao)
        db.session.commit()
        testartemp(conexao)
        flash(_('As alterações foram registradas.'))
        return redirect(url_for('main.edit_conexao', id=id))
    return render_template('edit_conexao.html', title=_('Conexão'), id=id, form=form,
                           conexao=conexao)

@bp.route('/delconexao', methods=['GET', 'POST'])
@login_required
def del_conexao():
    conexao = Conexao.query.filter_by(id=id).first_or_404()
    if conexao is None:
        flash(_('Conexão %(id) não encontrada.', id=id))
    else:
        db.session.delete(conexao)
    return redirect(url_for('main.conexoes'))

@bp.route('/addconsulta/<id>/<tipo>/', methods=['GET', 'POST'])
@login_required
def add_consulta(id,tipo):
    consulta = Consulta()
    tipo = 'V' if (tipo != 'E' and tipo != 'V') else tipo
    form = EditConsultaForm(obj=consulta, id=consulta.id)
    if form.validate_on_submit():
        form.populate_obj(consulta)
        db.session.add(consulta)
        consulta.tipo = tipo
        consulta.conx_id = id
        db.session.commit()

        flash(_('As alterações foram registradas.'))
        return redirect(url_for('main.conexoes'))
    titulo = 'Nova Consulta de ' + 'Entes' if consulta.tipo == 'E' else 'Relacionamentos'
    return render_template('edit_consulta.html', title=_(titulo), id=consulta.id,
                           form=form)


@bp.route('/delconsulta/<id>', methods=['GET', 'POST'])
@login_required
def del_consulta(id):
    ce = Consulta.query.filter_by(id=id).first_or_404()
    if ce is None:
        flash(_('Consulta %(id) não encontrada.', id=id))
    else:
        db.session.delete(ce)
        db.session.commit()
    return redirect(url_for('main.edit_conexao', id=id))

@bp.route('/editconsulta/<id>', methods=['GET', 'POST'])
@login_required
def edit_consulta(id):
    consulta = Consulta.query.filter_by(id=id).first_or_404()
    if consulta is None:
        flash(_('Consulta %(id) não encontrada.', id=id))
        return redirect(url_for('main.conexoes'))

    form = EditConsultaForm(obj=consulta, id=id)

    if form.validate_on_submit():
        form.populate_obj(consulta)
        db.session.commit()
        flash(_('As alterações foram registradas.'))
        return redirect(url_for('main.edit_consulta', id=id))
    titulo = 'Consulta de '+'Entes' if consulta.tipo == 'E' else 'Relacionamentos'
    return render_template('edit_consulta.html', title=_(titulo), id=id,
                           form=form, consulta=consulta)



@bp.route('/trilhas')
@login_required
def trilhas():
    page = request.args.get('page', 1, type=int)
    trilhas = Trilha.query.order_by(Trilha.nome.asc()).paginate(
        page, current_app.config['POSTS_PER_PAGE'], False)
    next_url = url_for('main.trilhas', page=trilhas.next_num) \
        if trilhas.has_next else None
    prev_url = url_for('main.trilhas', page=trilhas.prev_num) \
        if trilhas.has_prev else None
    emojis = current_app.config.EMOJIS
    return render_template('trilhas.html', title=_('Trilhas'), emojis=emojis,
                           trilhas=trilhas.items, next_url=next_url,
                           prev_url=prev_url)

@bp.route('/addtrilha', methods=['GET', 'POST'])
@login_required
def add_trilha():
    trilha=Trilha()
    form = EditTrilhaForm(obj=trilha, id=trilha.id)
    if form.validate_on_submit():
        form.populate_obj(trilha)
        db.session.add(trilha)
        db.session.commit()
        flash(_('As alterações foram registradas.'))
        return redirect(url_for('main.trilhas'))
    return render_template('edit_trilha.html', title=_('Nova Trilha'), id=trilha.id,
                           form=form)


@bp.route('/edittrilha/<id>', methods=['GET', 'POST'])
@login_required
def edit_trilha(id):
    trilha = Trilha.query.filter_by(id=id).first_or_404()
    if trilha is None:
        flash(_('Trilha %(id) não encontrada.', id=id))
        return redirect(url_for('main.trilhas'))

    form = EditTrilhaForm(obj=trilha, id=id)
    if form.validate_on_submit():
        form.populate_obj(trilha)
        db.session.commit()
        flash(_('As alterações foram registradas.'))
        return redirect(url_for('main.edit_trilha', id=id))

    return render_template('edit_trilha.html', title=_('Trilha'), id=id, form=form,
                           trilha=trilha)

@bp.route('/deltrilha', methods=['GET', 'POST'])
@login_required
def del_trilha():
    trilha = Trilha.query.filter_by(id=id).first_or_404()
    if trilha is None:
        flash(_('Trilha %(id) não encontrada.', id=id))
    else:
        db.session.delete(trilha)
    return redirect(url_for('main.trilhas'))

@bp.route('/addconsultatrilha/<id_consulta>/<id_trilha>', methods=['GET', 'POST'])
@login_required
def add_consulta_trilha(id_consulta, id_trilha):
    trilhaconsulta = TrilhaConsulta.query.filter_by(trilha_id=id_trilha,consulta_id=id_consulta).first()
    if trilhaconsulta is None:
        trilhaconsulta = TrilhaConsulta()
        db.session.add(trilhaconsulta)
        trilhaconsulta.consulta_id = id_consulta
        trilhaconsulta.trilha_id = id_trilha
        db.session.commit()
    else:
        flash(_('trilhaconsulta %(id) já existe encontrada.', id=id))
    return redirect(url_for('main.edit_trilha',id=id_trilha))


@bp.route('/delconsultatrilha/<id_consulta>/<id_trilha>', methods=['GET', 'POST'])
@login_required
def del_consulta_trilha(id_consulta, id_trilha):
    trilhaconsulta = TrilhaConsulta.query.filter_by(trilha_id=id_trilha, consulta_id=id_consulta).first()
    if trilhaconsulta is None:
        flash(_('trilhaconsulta %(id) não encontrada.', id=id))
    else:
        try:
            db.session.delete(trilhaconsulta)
            db.session.commit()
        except Exception:
            flash('Erro ao excluir consulta da trilha ')
    return redirect(url_for('main.edit_trilha', id=id_trilha))

from sqlalchemy.orm.exc import NoResultFound
# ...

def get_or_create(model, **kwargs):
    """
    Usage:
    class Employee(Base):
        __tablename__ = 'employee'
        id = Column(Integer, primary_key=True)
        name = Column(String, unique=True)

    get_or_create(Employee, name='bob')
    """
    instance = get_instance(model, **kwargs)
    if instance is None:
        instance = create_instance(model, **kwargs)
    return instance


def create_instance(model, **kwargs):
    """create instance"""
    try:
        instance = model(**kwargs)
        db.session.add(instance)
        db.session.flush()
    except Exception as msg:
        mtext = 'model:{}, args:{} => msg:{}'
        log.error(mtext.format(model, kwargs, msg))
        db.session.rollback()
        raise (msg)
    return instance


def get_instance(model, **kwargs):
    """Return first instance found."""
    try:
        return db.session.query(model).filter_by(**kwargs).first()
    except NoResultFound:
        return None
