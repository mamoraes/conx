from datetime import datetime
from hashlib import md5
from time import time
from flask import current_app
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from app import db, login
import sqlalchemy
from sqlalchemy import BigInteger, Column, Integer, String, text, Date
from sqlalchemy.ext.hybrid import hybrid_property, hybrid_method
import pandas as pd
from pandas.core.base import DataError

from app.database_aux import dbaux as dbx
from app.database_aux import *
# metadata = db.metadata(bind=engine)


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    about_me = db.Column(db.String(140))
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return '<User {}>'.format(self.username)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def avatar(self, size):
        digest = md5(self.email.lower().encode('utf-8')).hexdigest()
        return 'https://www.gravatar.com/avatar/{}?d=identicon&s={}'.format(
            digest, size)

    def get_reset_password_token(self, expires_in=600):
        return jwt.encode(
            {'reset_password': self.id, 'exp': time() + expires_in},
            current_app.config['SECRET_KEY'],
            algorithm='HS256').decode('utf-8')

    @staticmethod
    def verify_reset_password_token(token):
        try:
            id = jwt.decode(token, current_app.config['SECRET_KEY'],
                            algorithms=['HS256'])['reset_password']
        except:
            return
        return User.query.get(id)


@login.user_loader
def load_user(id):
    return User.query.get(int(id))

###########################

def testartemp(conexao):
    ok = True
    try:
        df = pd.read_sql(sql=f'select * from {temp_entes.__tablename__}', con=config.SQLALCHEMY_DATABASE_URI)
    except:
        ok = False
        flash(_(f'Não encontrou modelo de tabela temporária {temp_entes.__tablename__} em {conexao.string}.'))
    if not ok:
        return ok
    try:
        df.to_sql(temp_entes.__tablename__, con=conexao.string, if_exists='replace', index=False, index_label='ident')
    except:
        ok = False
        flash(_(f'Não gravou modelo de tabela temporária no bd {conexao.string}'))



def valoresunicos(df,campo:str):
    tipos = ['NAO']
    campo = campo.lower()
    if campo in df.columns.values:
        tipos = df[campo].unique()
        tipos = ','.join(tipos)
    return tipos

def jsonificar(atrib: str = '') -> dict:
    if atrib == None or atrib == '':
        return ({})
    d = json.loads('{' + atrib + '}')
    return (d)

def verificaatributos(df):
    atrib = []
    if len(df) == 0:
        atrib=[]
    elif 'atributos' in df.columns.values:
        atrb = df.head(1).iloc[0]['atributos']
        atributos = jsonificar(atrb)
        for k in atributos:
            atrib.append(k)
    return ','.join(atrib)


def verificar_consulta(consulta):
    def verificar_consulta_ente(df):
        campos_obrigatorios={}
        for campo_nome in ['tipo','ident', 'atributos']:
            campos_obrigatorios[campo_nome] = 'ok' if campo_nome in df.columns.values else 'NÃO'
        verificacoes = []
        verificacoes.append(['Campo TIPO', valoresunicos(df,'tipo')])
        verificacoes.append(['Campo ATRIBUTOS', verificaatributos(df)])
        return campos_obrigatorios, verificacoes
    def verificar_consulta_vinc(df):
        campos_obrigatorios={}
        for campo_nome in ['tipo_destino','subtipo_destino','ident_destino', 'tipo_origem','subtipo_origem','ident_origem', 'descricao','atributos']:
            campos_obrigatorios[campo_nome] = 'ok' if campo_nome in df.columns.values else 'NÃO'
        verificacoes = []
        for campo_nome in ['tipo_destino','subtipo_destino','tipo_origem','subtipo_origem']:
            verificacoes.append(['Campo '+campo_nome.upper(), valoresunicos(df,campo_nome.lower())])
        verificacoes.append(['Campo ATRIBUTOS', verificaatributos(df)])
        return campos_obrigatorios, verificacoes
    verificacoes=[]
    campos_obrigatorios = {'campo':'obrigatorio'}
    try:
        df=pd.read_sql(sql=consulta.cmd_sql, con=consulta.conexao.string)
        mensagem = 'Consulta retornou ' + str(len(df)) + ' registro'+('' if len(df) == 1 else 's')+'!'
        if consulta.tipo == 'E':
            campos_obrigatorios, verificacoes = verificar_consulta_ente(df)
        else:
            campos_obrigatorios, verificacoes = verificar_consulta_vinc(df)


    except SQLAlchemyError as e:
        error = str(e.__dict__['orig'])
        mensagem = error
        df=pd.DataFrame({'Coluna':['ERRO']})

    return mensagem, campos_obrigatorios, verificacoes, df




class Conexao(db.Model):
    __tablename__ = 'conexao'

    id = db.Column(db.Integer, primary_key=True, autoincrement='auto')
    nome = db.Column(db.String(50), nullable=False)
    string = db.Column(db.String(50), nullable=True)
    usuario = db.Column(db.String(50), nullable=True)
    senha = db.Column(db.String(50), nullable=True)
    habilitada = db.Column(db.String(1), nullable=False)
    consultas = db.relationship("Consulta", back_populates="conexao")


    @hybrid_property
    def ativa(self) -> bool:
        try:
            conexao_usuario = sqlalchemy.create_engine(self.string)  # , execution_options=gEngineExecutionOptions
        except:
            return False

        try:
            conexao_usuario.execute('select 1') # apenas para testar a conexão
            return True
        except:
            return False

    def __repr__(self):
        return '{}-{}:{}'.format(self.nome,self.string,self.habilitada)


class Consulta(db.Model):
    __tablename__ = 'consulta'

    id = db.Column(db.Integer, primary_key=True, autoincrement='auto')
    conx_id = db.Column(db.BigInteger, db.ForeignKey('conexao.id'), index=True, nullable=False)
    tipo = db.Column(db.String(1), nullable=False, default='V', doc='Define se a consulta é do tipo Enteou Vínculo')
    nome = db.Column(db.String(50), nullable=False, doc='Nome da consulta')
    descricao = db.Column(db.String(500), nullable=False, doc='Descriçao da finalidade da consulta')
    fonte = db.Column(db.String(15), nullable=False, doc='Nome da fonte de dados para rastrear o resultado')
    cmd_sql = db.Column(db.String(2500), nullable=True, doc='Comando SQL')
    habilitada = db.Column(db.String(1), nullable=False, default='S', doc='Define se a consulta está habilitada')
    conexao = db.relationship("Conexao", back_populates="consultas")
    trilhas = db.relationship("TrilhaConsulta", back_populates="consulta")

    @hybrid_property
    def verificacoes(self):
        return verificar_consulta(self)
    def __repr__(self):
        return '{}-{}:{}'.format(self.id,self.cmd_sql,self.habilitada)

def selecao_consultas(trilha):
    ok = True
    consulta=Consulta()
    trilhaconsulta= TrilhaConsulta()

    sql = f"""select cn.*, 
              case when (select tc.trilha_id from {trilhaconsulta.__tablename__} tc 
                         where tc.consulta_id = cn.id and tc.trilha_id = {trilha.id}) isnull 
                    then 'N' 
                    else 'S' end as tr_id 
              from {consulta.__tablename__} cn"""
    try:
       # df = pd.read_sql(sql=sql, con=config.SQLALCHEMY_DATABASE_URI)
       df = pd.read_sql(sql=sql, con=current_app.config['SQLALCHEMY_DATABASE_URI'])
    except :
        ok = False
        print(DataError)
        #flash(_(f'Erro em consulta'))
    lista=[]
    for linha in df.itertuples():
        #lin={}
        #lin['tipo'] = linha['tipo']
        lista.append(linha)

    return df.itertuples()





class Trilha(db.Model):
    __tablename__ = 'trilha'

    id = db.Column(db.Integer, primary_key=True, autoincrement='auto')
    nome = db.Column(db.String(50), nullable=False, doc='Nome da consulta')
    descricao = db.Column(db.String(500), nullable=False, doc='Descriçao da finalidade da consulta')
    consultas = db.relationship("TrilhaConsulta", back_populates="trilha")

    @hybrid_property
    def selecao(self):
        return selecao_consultas(self)

    def __repr__(self):
        return '{}-{}:{}'.format(self.id,self.nome,self.descricao)

class TrilhaConsulta(db.Model):
    __tablename__ = 'trilha_consulta'

    id = db.Column(db.Integer, primary_key=True, autoincrement='auto')
    trilha_id = db.Column(db.BigInteger, db.ForeignKey('trilha.id'), index=True, nullable=False)
    consulta_id = db.Column(db.BigInteger, db.ForeignKey('consulta.id'), index=True, nullable=False)
    trilha = db.relationship("Trilha", back_populates="consultas")
    consulta = db.relationship("Consulta", back_populates="trilhas")

    def __repr__(self):
        return '{}-{}:{}'.format(self.id,self.trilha_id,self.consulta_id)


class temp_entes(db.Model):
    __tablename__ = 'TEMP_ENTES'
    id = db.Column(sqlalchemy.types.NVARCHAR(length=200), primary_key=True)  #
    tipo = db.Column(sqlalchemy.types.NVARCHAR(length=5))  #
    ident = db.Column(sqlalchemy.types.NVARCHAR(length=150))  #
    nome = db.Column(sqlalchemy.types.NVARCHAR(length=150))  #
    subtipo = db.Column(sqlalchemy.types.NVARCHAR(length=5))  #
    data_ini = db.Column(sqlalchemy.types.NVARCHAR(length=8))  #
    data_fim = db.Column(sqlalchemy.types.NVARCHAR(length=8))  #
    em_atividade = db.Column(sqlalchemy.types.NVARCHAR(length=1))  #
    atributos = db.Column(sqlalchemy.types.TEXT())  #

    """id = db.Column(db.String(200)) #sqlalchemy.types.NVARCHAR(length=200)
    tipo = db.Column(db.String(5))  #sqlalchemy.types.NVARCHAR(length=5)
    ident = db.Column(db.String(150)) #sqlalchemy.types.NVARCHAR(length=150)
    nome = db.Column(db.String(150))  # sqlalchemy.types.NVARCHAR(length=150)
    subtipo = db.Column(db.String(5))  #sqlalchemy.types.NVARCHAR(length=5)
    data_ini = db.Column(db.String(8))  #sqlalchemy.types.NVARCHAR(length=8)
    data_fim = db.Column(db.String(8))  #sqlalchemy.types.NVARCHAR(length=8)
    em_atividade = db.Column(db.String(1))  #sqlalchemy.types.NVARCHAR(length=1)
    atributos = db.Column(db.String(5000))  # sqlalchemy.types.TEXT()"""


