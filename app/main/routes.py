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
import glob
from app.main.gerargrafo import Aresta, Nodo, NoPF, NoPJ, NoCaso, NoRinf

from app.database_aux import dbaux as dbx
from app.database_aux import * #so_digitos, validar_cpf_cnpj
#import config

#from app.main.database_aux import dbx
import configrede

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
    return render_template('conexoes.html', title=_('Conexões'), emojis=current_app.config['EMOJIS'],
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
                           emojis=current_app.config['EMOJIS'], form=form)

@bp.route('/conexaodef', methods=['GET', 'POST'])
@login_required
def def_conexao():
    conexoes_default()
    return redirect(url_for('main.conexoes'))

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
                           emojis=current_app.config['EMOJIS'], conexao=conexao)

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
                           emojis=current_app.config['EMOJIS'], form=form)


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
                           emojis=current_app.config['EMOJIS'], form=form, consulta=consulta)



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
    return render_template('trilhas.html', title=_('Trilhas'), emojis=current_app.config['EMOJIS'],
                           trilhas=trilhas.items, next_url=next_url,
                           prev_url=prev_url)

@bp.route('/pesquisas')
@login_required
def pesquisas():
    page = request.args.get('page', 1, type=int)
    pesquisas = Pesquisa.query.order_by(Pesquisa.nome.asc()).paginate(
        page, current_app.config['POSTS_PER_PAGE'], False)
    next_url = url_for('main.pesquisas', page=pesquisas.next_num) \
        if pesquisas.has_next else None
    prev_url = url_for('main.pesquisas', page=pesquisas.prev_num) \
        if pesquisas.has_prev else None
    return render_template('pesquisas.html', title=_('Pesquisas'), emojis=current_app.config['EMOJIS'],
                           pesquisas=pesquisas.items, next_url=next_url,
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
                           emojis=current_app.config['EMOJIS'], form=form)


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
                           emojis=current_app.config['EMOJIS'], trilha=trilha)

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

@bp.route('/addpesquisa', methods=['GET', 'POST'])
@login_required
def add_pesquisa():
    pesquisa=Pesquisa()
    form = EditPesquisaForm(obj=pesquisa, id=pesquisa.id)
    if form.validate_on_submit():
        form.populate_obj(pesquisa)
        db.session.add(pesquisa)
        db.session.commit()
        flash(_('As alterações foram registradas.'))
        return redirect(url_for('main.pesquisas'))
    return render_template('edit_pesquisa.html', title=_('Nova Pesquisa'), id=pesquisa.id,
                           emojis=current_app.config['EMOJIS'], form=form)


@bp.route('/editpesquisa/<id>', methods=['GET', 'POST'])
@login_required
def edit_pesquisa(id):
    pesquisa = Pesquisa.query.filter_by(id=id).first_or_404()
    if pesquisa is None:
        flash(_('Pesquisa %(id) não encontrada.', id=id))
        return redirect(url_for('main.pesquisas'))

    form = EditPesquisaForm(obj=pesquisa, id=id)
    if form.validate_on_submit():
        form.populate_obj(pesquisa)
        db.session.commit()
        flash(_('As alterações foram registradas.'))
        return redirect(url_for('main.edit_pesquisa', id=id))

    return render_template('edit_pesquisa.html', title=_('Pesquisa'), id=id, form=form,
                           emojis=current_app.config['EMOJIS'], pesquisa=pesquisa)

@bp.route('/exexpesquisa/<id>', methods=['GET', 'POST'])
@login_required
def exec_pesquisa(id):
    pesquisa = Pesquisa.query.filter_by(id=id).first_or_404()
    if pesquisa is None:
        flash(_('Pesquisa %(id) não encontrada.', id=id))
        return redirect(url_for('main.pesquisas'))

    form = EditPesquisaForm(obj=pesquisa, id=id)
    if form.validate_on_submit():
        form.populate_obj(pesquisa)
        db.session.commit()
        flash(_('As alterações foram registradas.'))
        return redirect(url_for('main.edit_pesquisa', id=id))

    return render_template('edit_pesquisa.html', title=_('Pesquisa'), id=id, form=form,
                           emojis=current_app.config['EMOJIS'], pesquisa=pesquisa)


@bp.route('/delpesquisa', methods=['GET', 'POST'])
@login_required
def del_pesquisa():
    pesquisa = Pesquisa.query.filter_by(id=id).first_or_404()
    if pesquisa is None:
        flash(_('Pesquisa %(id) não encontrada.', id=id))
    else:
        db.session.delete(pesquisa)
    return redirect(url_for('main.pesquisas'))


@bp.route('/addpesquisatrilha/<id_pesquisa>/<id_trilha>', methods=['GET', 'POST'])
@login_required
def add_pesquisa_trilha(id_pesquisa, id_trilha):
    pesquisatrilha = PesquisaTrilha.query.filter_by(trilha_id=id_trilha,pesquisa_id=id_pesquisa).first()
    if pesquisatrilha is None:
        pesquisatrilha = PesquisaTrilha()
        db.session.add(pesquisatrilha)
        pesquisatrilha.pesquisa_id = id_pesquisa
        pesquisatrilha.trilha_id = id_trilha
        db.session.commit()
    else:
        flash(_('PesquisaTrilha %(id) já existe encontrada.', id=id))
    return redirect(url_for('main.edit_pesquisa',id=id_trilha))


@bp.route('/delpesquisatrilha/<id_pesquisa>/<id_trilha>', methods=['GET', 'POST'])
@login_required
def del_pesquisa_trilha(id_pesquisa, id_trilha):
    pesquisatrilha = PesquisaTrilha.query.filter_by(trilha_id=id_trilha, pesquisa_id=id_pesquisa).first()
    if pesquisatrilha is None:
        flash(_('Pesquisatrilha %(id) não encontrada.', id=id))
    else:
        try:
            db.session.delete(pesquisatrilha)
            db.session.commit()
        except Exception:
            flash('Erro ao excluir consulta da pesquisa ')
    return redirect(url_for('main.edit_pesquisa', id=id_trilha))

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


def imagensNaPastaF(bRetornaLista=False):
    dic = {}
    for item in glob.glob('app/static/imagem/**/*.png', recursive=True):
        if '/nao_usado/' not in item.replace("\\", "/"):
            dic[os.path.split(item)[1]] = item.replace("\\", "/")
    if bRetornaLista:
        return sorted(list(dic.keys()))
    else:
        return dic


def imagensNaPastaF(bRetornaLista=False):
    dic = {}
    for item in glob.glob('app/static/imagem/**/*.png', recursive=True):
        if '/nao_usado/' not in item.replace("\\", "/"):
            dic[os.path.split(item)[1]] = item.replace("\\", "/")
    if bRetornaLista:
        return sorted(list(dic.keys()))
    else:
        return dic


#http://sed-die-hpc02-p:9101/rede/grafico_no_servidor/relacionamento.9204624e.rda.json

@bp.route("/rederel/")
@bp.route("/rede/")
@bp.route("/rede/grafico/<int:camada>/<cpfcnpj>")
@bp.route("/rede/grafico_no_servidor/<idArquivoServidor>")
def exibir_rede(cpfcnpj='', camada=0, idArquivoServidor=''):
    if True:
        idArquivoServidor = secure_filename(idArquivoServidor) if idArquivoServidor else ''
        extensao = os.path.splitext(idArquivoServidor)[1].lower()
        listaJson = json.loads(open(idArquivoServidor).read()) if extensao == '.json' else ''
        camada = camada if camada else 0
        listaImagens = imagensNaPastaF(True)
        paramsInicial = {
            'cpfcnpj': cpfcnpj,
            'camada': camada,
            'idArquivoServidor': idArquivoServidor,
            'json': listaJson,
            'listaImagens': listaImagens,
            'mensagem': 'mensagemInicial',
            'bMenuInserirInicial': False,
            'inserirDefault': ' TESTE',
            'lista': '',
            'bBaseReceita': 0,
            'bBaseFullTextSearch': 0,
            'bBaseLocal': '',
            'btextoEmbaixoIcone': True,
            'referenciaBD': 0,
            'referenciaBDCurto': ''
        }
        paramsInicial = {'cpfcnpj': cpfcnpj,
                         'camada': camada,
                         'mensagem': 'mensagemInicial',
                         'bMenuInserirInicial': True, #config.par.bMenuInserirInicial,
                         'inserirDefault': True, # inserirDefault,
                         'idArquivoServidor': idArquivoServidor,
                         'lista': [], #listaEntrada,
                         'json': [], #listaJson,
                         'listaImagens': listaImagens,
                         'bBaseReceita': 1 ,#if config.config['BASE'].get('base_receita', '') else 0,
                         'bBaseFullTextSearch': 1 ,#if config.config['BASE'].get('base_receita_fulltext', '') else 0,
                         'bBaseLocal': 1, # if config.config['BASE'].get('base_local', '') else 0,
                         'btextoEmbaixoIcone': 1, #config.par.btextoEmbaixoIcone,
                         'referenciaBD': '' ,# config.referenciaBD,
                         'referenciaBDCurto': '' #config.referenciaBD.split(',')[0]
         }

        return render_template('rede_template.html',
                               emojis=current_app.config['EMOJIS'],
                               parametros=paramsInicial)

    """mensagemInicial = ''
    inserirDefault = ''
    listaEntrada = ''
    listaJson = ''
    # camada = config.par.camadaInicial if config.par.camadaInicial else camada
    camada = 2 #camada if camada else configrede.par.camadaInicial
    camada =  2 #min(gp['camadaMaxima'], camada)
    idArquivoServidor = 'rede.json' #idArquivoServidor if idArquivoServidor else configrede.par.idArquivoServidor
    if idArquivoServidor:
        idArquivoServidor = secure_filename(idArquivoServidor)
    listaImagens = imagensNaPastaF(True)
    if configrede.par.arquivoEntrada:
        # if os.path.exists(config.par.listaEntrada): checado em config
        extensao = os.path.splitext(configrede.par.arquivoEntrada)[1].lower()
        if extensao in ['.py', '.js']:
            listaEntrada = open(configrede.par.arquivoEntrada, encoding=configrede.par.encodingArquivo).read()
            if extensao == '.py':  # configura para lista hierarquica
                listaEntrada = '_>p\n' + listaEntrada
            elif extensao == '.js':
                listaEntrada = '_>j\n' + listaEntrada
        elif extensao == '.json':
            listaJson = json.loads(open(configrede.par.arquivoEntrada, encoding=configrede.par.encodingArquivo).read())
        elif extensao in ['.csv', '.txt']:
            df = pd.read_csv(configrede.par.arquivoEntrada, sep=configrede.par.separador, dtype=str, header=None,
                             keep_default_na=False, encoding=configrede.par.encodingArquivo, skip_blank_lines=False)
        elif extensao in ['.xlsx', 'xls']:
            # df = pd.read_excel(config.par.arquivoEntrada, sheet_name=config.par.excel_sheet_name, header= config.par.excel_header, dtype=str, keep_default_na=False)
            df = pd.read_excel(configrede.par.arquivoEntrada, sheet_name=configrede.par.excel_sheet_name, header=None,
                               dtype=str, keep_default_na=False)
        else:
            print('arquivo em extensão não reconhecida, deve ser csv, txt ou json:' + configrede.par.arquivoEntrada)
            sys.exit(0)
        if extensao in ['.csv', '.txt', '.xlsx', 'xls']:
            listaEntrada = ''
            for linha in df.values:
                listaEntrada += '\t'.join([i.replace('\t', ' ') for i in linha]) + '\n'
                # print(listaEntrada)
            df = None
    elif not cpfcnpj and not idArquivoServidor:  # define cpfcnpj inicial, só para debugar.
        cpfcnpj = configrede.par.cpfcnpjInicial
        numeroEmpresas = gp['numeroDeEmpresasNaBase']
        if numeroEmpresas:
            tnumeroEmpresas = format(numeroEmpresas, ',').replace(',', '.')
            if configrede.par.bExibeMensagemInicial:
                mensagemInicial = configrede.config['INICIO'].get('mensagem_advertencia', '').replace('\\n', '\n')
                if numeroEmpresas > 40000000:  # no código do template, dois pontos será substituida por .\n
                    mensagemInicial += f'''\nA base tem {tnumeroEmpresas} empresas.\n''' + configrede.referenciaBD
                else:
                    inserirDefault = ' TESTE'
        else:
            configrede.par.bMenuInserirInicial = False

    if configrede.par.tipo_lista:
        if configrede.par.tipo_lista.startswith('_>'):
            listaEntrada = configrede.par.tipo_lista + '\n' + listaEntrada
        else:
            listaEntrada = configrede.par.tipo_lista + listaEntrada

    paramsInicial = {'cpfcnpj': cpfcnpj,
                     'camada': camada,
                     'mensagem': mensagemInicial,
                     'bMenuInserirInicial': configrede.par.bMenuInserirInicial,
                     'inserirDefault': inserirDefault,
                     'idArquivoServidor': idArquivoServidor,
                     'lista': listaEntrada,
                     'json': listaJson,
                     'listaImagens': listaImagens,
                     'bBaseReceita': 1 ,#if configrede.config['BASE'].get('base_receita', '') else 0,
                     'bBaseFullTextSearch': 0, #1 if configrede.config['BASE'].get('base_receita_fulltext', '') else 0,
                     'bBaseLocal': 1, #if configrede.configrede['BASE'].get('base_local', '') else 0,
                     'btextoEmbaixoIcone': configrede.par.btextoEmbaixoIcone,
                     'referenciaBD': configrede.referenciaBD,
                     'referenciaBDCurto': configrede.referenciaBD.split(',')[0]}
    configrede.par.idArquivoServidor = ''  # apagar para a segunda chamada da url não dar o mesmo resultado.
    configrede.par.arquivoEntrada = ''
    configrede.par.cpfcnpjInicial = ''


    return render_template('rede_template.html', parametros=paramsInicial)
"""