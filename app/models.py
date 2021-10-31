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

class Conexao(db.Model):
    __tablename__ = 'conexao'

    id = db.Column(db.Integer, primary_key=True, autoincrement='auto')
    nome = db.Column(db.String(50), nullable=False)
    string = db.Column(db.String(50), nullable=True)
    usuario = db.Column(db.String(50), nullable=True)
    senha = db.Column(db.String(50), nullable=True)
    em_producao = db.Column(db.String(1), nullable=False)
    consultas_ente = db.relationship("ConsultaEnte", back_populates="conexao")
    consultas_vinc = db.relationship("ConsultaVinculo", back_populates="conexao")

    def __repr__(self):
        return '{}-{}:{}'.format(self.nome,self.string,self.em_producao)

class ConsultaEnte(db.Model):
    __tablename__ = 'consulta_ente'

    id = db.Column(db.Integer, primary_key=True, autoincrement='auto')
    conx_id = db.Column(db.BigInteger, db.ForeignKey('conexao.id'), index=True, nullable=False)
    nome = db.Column(db.String(50), nullable=False, doc='Nome da consulta')
    descricao = db.Column(db.String(500), nullable=False)
    fonte = db.Column(db.String(15), nullable=False)
    cmd_sql = db.Column(db.String(2500), nullable=True)
    em_producao = db.Column(db.String(1), nullable=False, default='S')
    conexao = db.relationship("Conexao", back_populates="consultas_ente")

    def __repr__(self):
        return '{}-{}:{}'.format(self.id,self.cmd_sql,self.em_producao)

class ConsultaVinculo(db.Model):
    __tablename__ = 'consulta_vinculo'

    id = db.Column(db.Integer, primary_key=True, autoincrement='auto')
    conx_id = db.Column(db.BigInteger, db.ForeignKey('conexao.id'), index=True, nullable=False)
    nome = db.Column(db.String(50), nullable=False)
    descricao = db.Column(db.String(500), nullable=False)
    fonte = db.Column(db.String(15), nullable=False)
    cmd_sql = db.Column(db.String(2500), nullable=True)
    em_producao = db.Column(db.String(1), nullable=False, default='S')
    conexao = db.relationship("Conexao", back_populates="consultas_vinc")

    def __repr__(self):
        return '{}-{}:{}'.format(self.id,self.cmd_sql,self.em_producao)

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


