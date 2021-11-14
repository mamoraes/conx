from datetime import datetime
from hashlib import md5
from time import time
from flask import current_app
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
import jwt

import config
from app import db, login
import sqlalchemy
from sqlalchemy.exc import SQLAlchemyError
from flask_sqlalchemy  import SQLAlchemy
from sqlalchemy import BigInteger, Column, Integer, String, text, Date
from sqlalchemy.ext.hybrid import hybrid_property, hybrid_method

import pandas as pd
from pandas.core.base import DataError

from app.database_aux import dbaux as dbx
from app.database_aux import *
# metadata = db.metadata(bind=engine)
import json

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
        sql = f'select * from {temp_entes.__tablename__}'
        con = config.Config.SQLALCHEMY_DATABASE_URI
        df = pd.read_sql(sql=sql, con=con)
        if len(df) == 0:
            te = temp_entes()
            te.entes_default()
            df = pd.read_sql(sql=sql, con=con)
    except:
        ok = False
        print(f'Não encontrou modelo de tabela temporária {temp_entes.__tablename__} em {conexao.string}.')
        return ok
    if not ok:
        return ok
    try:
        df.to_sql(temp_entes.__tablename__, con=conexao.string, if_exists='replace', index=False, index_label='ident')
    except:
        ok = False
        print(f'Não gravou modelo de tabela temporária no bd {conexao.string}')
        return ok



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

        # formatacao dataframe
        s=df.style
        cell_hover = {  # for row hover use <tr> instead of <td>
            'selector': 'td:hover',
            'props': [('background-color', '#ffffb3')]
        }
        index_names = {
            'selector': '.index_name',
            'props': 'font-style: italic; color: darkgrey; font-weight:normal;'
        }
        headers = {
            'selector': 'th:not(.index_name)',
            'props': 'background-color: #000066; color: white;'
        }
        s.set_table_styles([cell_hover, index_names, headers])
        s.set_table_styles([
            {'selector': 'th.col_heading', 'props': 'text-align: center;'},
            {'selector': 'th.col_heading.level0', 'props': 'font-size: 1.5em;'},
            {'selector': 'td', 'props': 'text-align: center; font-weight: bold;'},
        ])


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

def conexoes_default():
    padroes=[]
    padroes.append({'nome': 'conx', 'string': 'sqlite:///conxs.db'})
    padroes.append({'nome': 'cnpj_full', 'string': 'sqlite:///Cnpj_full.db'})
    padroes.append({'nome': 'cnpj', 'string': 'sqlite:///cnpj.db'})
    padroes.append({'nome': 'CGUDATA', 'string': 'mssql+pyodbc://sdh-die-bd/temp_NAE_PE?Trusted_Connection=yes&driver=SQL+Server'})

    for cnx in padroes:
        nome = cnx['nome']
        conexao = Conexao()
        #conexao = Conexao.query.filter_by(nome = 'conx').first_or_404()
        sql = f"select * from {Conexao.__tablename__} where nome = '{nome}'"
        df = pd.read_sql(sql=sql, con=current_app.config['SQLALCHEMY_DATABASE_URI'])
        if len(df) == 0:
        #if conexao.id is None:
            conexao = Conexao()
            db.session.add(conexao)
            conexao.nome = cnx['nome']
            conexao.string = cnx['string']
            conexao.habilitada = 'S'
            db.session.commit()

    consultas_default()

def consultas_default():
    padroes=[]

    consulta={}
    consulta['nome_conx']= 'cnpj'
    consulta['nome'] = 'PJ_cnpj'
    consulta['descricao']='Obtém dados de PJ publicados pela RF'
    consulta['tipo']= 'E'
    consulta['fonte']= 'empresas'
    consulta['cmd_sql']= """
       select TC.tipo as tipo
       , e.cnpj as ident
       , razao_social as nome, 
       '"fantasia":"'||E.nome_fantasia|| '","inicio_atividade":"'||E.data_inicio_atividades || '","natureza_juridica":"'||Em.natureza_juridica ||'","email":"'||E.correio_eletronico|| '","fone1":"'||E.ddd1||' '||E.telefone1|| '","fone2":"'||E.ddd2||' '||E.telefone2||'"' as atributos 
       from estabelecimentos E inner join empresas em on e.cnpj_basico = em.cnpj_basico inner join temp_entes TC on e.cnpj = TC.ident and TC.tipo = 'PJ' 
       """
    padroes.append(consulta)

    consulta={}
    consulta['nome_conx']= 'CGUDATA'
    consulta['nome'] = 'PF_CPF'
    consulta['descricao']='Obtém dados de PF no CPF da RF'
    consulta['tipo']= 'E'
    consulta['fonte']= 'db_cpf'
    consulta['cmd_sql']= """
       select TC.tipo as tipo
       , TC.ident as ident, 
       PF.nome as nome, 
       concat('"data_nascimento":"',dataNascimento,'","nome_mae":"',coalesce(nomeMae,''),'","ano_obito":"',coalesce(anoObito,''), '","situacao_cadastral":"',coalesce(sitCadastral,''),'","sexo":"',coalesce(idsexo,''),'"') as atributos 
       from db_cpf.dbo.cpf PF inner join temp_entes TC on PF.cpf = TC.ident and TC.tipo = 'PF' 
       """
    padroes.append(consulta)

    consulta={}
    consulta['nome_conx']= 'CGUDATA'
    consulta['nome'] = 'PJ_CNPJ'
    consulta['descricao']='Obtém dados de PJ no CNPJ da RF'
    consulta['tipo']= 'E'
    consulta['fonte']= 'db_cnpj'
    consulta['cmd_sql']= """
       select TC.tipo as tipo
       , e.cnpj as ident
       , razaosocial as nome
       , concat('"fantasia":"',coalesce(E.nomefantasia,''), '","inicio_atividade":"'
                ,coalesce(E.dataabertura,''),'","natureza_juridica":"'
                ,coalesce(E.codnaturezajuridica,''),'"
                ,coalesce("email":"'
                ,coalesce(E.correioeletronico,''),'","fone1":"'
                ,coalesce(E.telefone1,''),'","fone2":"'
                ,coalesce(E.telefone2,''),'"') as atributos 
       from db_cnpj.dbo.cnpj E inner join temp_entes TC on e.cnpj = TC.ident and TC.tipo = 'PJ'
       """
    padroes.append(consulta)

    consulta={}
    consulta['nome_conx']= 'cnpj'
    consulta['nome'] = 'SOCIOS_PJ'
    consulta['descricao']='Obtém dados de sócios PJ no CNPJ da RF'
    consulta['tipo']= 'V'
    consulta['fonte']= 'empresas'
    consulta['cmd_sql']= """
       select 'PJ' as tipo_destino
       , '' as subtipo_destino
       , S.cnpj as ident_destino
       , '' as nome_destino
       , cnpj_cpf_socio as ident_origem
       , nome_socio as nome_origem
       , TC.tipo as tipo_origem
       , 'sócio' as descricao
       ,  '"cod_qualificacao":"' ||qualificacao_socio ||'-' || qs.descricao  ||'"' as atributos 
       from socios S 
            inner join qualificacao_socio qs on qs.codigo  = S.qualificacao_socio 
            inner join temp_entes TC on cnpj_cpf_socio = TC.ident and TC.tipo = 'PJ'        
       """
    padroes.append(consulta)

    consulta={}
    consulta['nome_conx']= 'cnpj'
    consulta['nome'] = 'SOCIOS_PF'
    consulta['descricao']='Obtém vínculos de sócios PF no CNPJ da RF'
    consulta['tipo']= 'V'
    consulta['fonte']= 'empresas'
    consulta['cmd_sql']= """
       select 'PJ' as tipo_destino
       , '' as subtipo_destino
       , S.cnpj as ident_destino
       , '' as nome_destino
       , cnpj_cpf_socio as ident_origem
       , nome_socio as nome_origem
       , TC.tipo as tipo_origem
       , 'sócio' as descricao
       ,  '"cod_qualificacao":"' ||qualificacao_socio ||'-' || qs.descricao  ||'"' as atributos 
       from socios S 
            inner join qualificacao_socio qs on qs.codigo  = S.qualificacao_socio 
            inner join temp_entes TC on cnpj_cpf_socio = TC.ident and TC.tipo = 'PF' and nome_socio = TC.nome"""
    padroes.append(consulta)

    consulta={}
    consulta['nome_conx']= 'cnpj'
    consulta['nome'] = 'SOCIOS_PJ'
    consulta['descricao']='Obtém vínculos de sócios PJ no CNPJ da RF'
    consulta['tipo']= 'V'
    consulta['fonte']= 'socios'
    consulta['cmd_sql']= """
       select case when substr(cnpj_cpf_socio,1,3) = '***' then 'PF' else 'PJ' end as tipo_destino, 
       case when substr(cnpj_cpf_socio,1,3) = '***' then '***' else '' end as subtipo_destino
       , cnpj_cpf_socio as ident_destino
       , nome_socio as nome_destino
       , S.cnpj as ident_origem
       , Em.razao_social as nome_origem
       , TC.tipo as tipo_origem
       , 'sócio' as descricao
       , '"cod_qualificacao":"' ||qualificacao_socio ||'-' || qs.descricao  ||'"' as atributos 
       from socios S 
            inner join qualificacao_socio qs on qs.codigo  = S.qualificacao_socio 
            inner join temp_entes TC on S.cnpj = TC.ident and TC.tipo = 'PJ' 
            left join estabelecimentos E on E.cnpj = S.cnpj 
            inner join empresas em on em.cnpj_basico = E.cnpj_basico
       """
    padroes.append(consulta)

    consulta={}
    consulta['nome_conx']= 'cnpj'
    consulta['nome'] = 'SOCIOS_PF'
    consulta['descricao']='Obtém vínculos de sócios PF no CNPJ da RF'
    consulta['tipo']= 'V'
    consulta['fonte']= 'socios'
    consulta['cmd_sql']= """
       select 'PF' as tipo_destino
       , case when substr(representante_legal ,1,3) = '***' then '***' else '' end as subtipo_destino
       , representante_legal as ident_destino
       , nome_socio as nome_destino
       , cnpj as ident_origem
       , tc.tipo as tipo_origem
       , 'representante sócio' as descricao
       , '' as atributos 
       from socios 
            inner join temp_entes TC on cnpj = TC.ident and TC.tipo = 'PJ' 
       where representante_legal is not null 
         and representante_legal  <> '' 
         and representante_legal <> '***000000**' 
         and representante_legal <> '***999999**'
       """
    padroes.append(consulta)

    consulta={}
    consulta['nome_conx']= 'CGUDATA'
    consulta['nome'] = 'SOCIOS_PF'
    consulta['descricao']='Obtém vínculos de sócios PF no CNPJ da RF'
    consulta['tipo']= 'V'
    consulta['fonte']= 'db_cnpj'
    consulta['cmd_sql']= """
       select 'PJ' as tipo_destino
       , '' as subtipo_destino
       , S.cnpj as ident_destino
       , '' as nome_destino
       , s.cpfcnpjsocio as ident_origem
       , S.nomesocio as nome_origem
       , TC.tipo as tipo_origem
       , 'sócio' as descricao
       , concat('"qualificacao_socio":"',S.DescQualificacaoSocio,'", "data_entrada":"'
               ,coalesce(S.DataEntradaSociedade,''),'", "data_saida":"'
               ,coalesce(S.DataExclusaoSociedade,''),'"') as atributos 
       from db_CNPJ.dbo.socios S 
       inner join temp_NAE_PE.dbo.temp_entes TC on S.cpfcnpjsocio = TC.ident and TC.tipo = 'PF'
       """
    padroes.append(consulta)

    consulta={}
    consulta['nome_conx']= 'CGUDATA'
    consulta['nome'] = 'SOCIOS_PJ'
    consulta['descricao']='Obtém dados de sócios PJ no CNPJ da RF'
    consulta['tipo']= 'V'
    consulta['fonte']= 'db_cnpj'
    consulta['cmd_sql']= """
       select 'PJ' as tipo_destino
       , '' as subtipo_destino
       , S.cnpj as ident_destino
       , '' as nome_destino
       , s.cpfcnpjsocio as ident_origem
       , S.nomesocio as nome_origem
       , TC.tipo as tipo_origem
       , 'sócio' as descricao
       , concat('"qualificacao_socio":"',S.DescQualificacaoSocio,'", "data_entrada":"'
                ,coalesce(S.DataEntradaSociedade,''),'", "data_saida":"'
                ,coalesce(S.DataExclusaoSociedade,''),'"') as atributos 
       from db_CNPJ.dbo.socios S 
            inner join temp_NAE_PE.dbo.temp_entes TC on S.cpfcnpjsocio = TC.ident and TC.tipo = 'PJ'
       """
    padroes.append(consulta)

    consulta={}
    consulta['nome_conx']= 'CGUDATA'
    consulta['nome'] = 'SOCIOS_PJ'
    consulta['descricao']='Obtém vínculos de sócios PJ no CNPJ da RF'
    consulta['tipo']= 'V'
    consulta['fonte']= 'db_cnpj'
    consulta['cmd_sql']= """
       select S.IndSocio as tipo_destino
       , '' as subtipo_destino
       , S.CpfCnpjSocio as ident_destino
       , s.NomeSocio as nome_destino
       , s.Cnpj as ident_origem
       , '' as nome_origem
       , TC.tipo as tipo_origem
       , 'sócio' as descricao
       , concat('"qualificacao_socio":"',S.DescQualificacaoSocio,'", "data_entrada":"'
               ,coalesce(S.DataEntradaSociedade,''),'", "data_saida":"'
               ,coalesce(S.DataExclusaoSociedade,''),'"') as atributos 
       from db_CNPJ.dbo.socios S 
            inner join temp_NAE_PE.dbo.temp_entes TC on S.cnpj = TC.ident and TC.tipo = 'PJ'
       """
    padroes.append(consulta)


    for cons in padroes:
        nome_conx = cons['nome_conx']

        sql = f"""select * from {Conexao.__tablename__} where nome = '{nome_conx}' """
        uri = current_app.config['SQLALCHEMY_DATABASE_URI']
        df = pd.read_sql(sql=sql, con=uri)
        if len(df.head(1)) > 0:
            idconx = df.at[0, 'id']

        sql = f"""select * from {Consulta.__tablename__} where conx_id = {idconx} and nome = '{cons['nome']}' and tipo = '{cons["tipo"]}'"""
        df = pd.read_sql(sql=sql, con=uri)
        if len(df.head(1)) == 0:
            consulta = Consulta()
            db.session.add(consulta)
            consulta.conx_id = int(idconx)
            consulta.tipo = cons['tipo']
            consulta.cmd_sql = cons['cmd_sql']
            consulta.fonte = cons['fonte']
            consulta.habilitada = 'S'
            consulta.nome = cons['nome']
            consulta.descricao = cons['descricao']
            db.session.commit()

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


def selecao_trilhas(pesquisa):
    ok = True
    trilha=Trilha()
    pesquisatrilha= PesquisaTrilha()

    sql = f"""select tr.*, 
              case when (select tc.pesquisa_id from {pesquisatrilha.__tablename__} tc 
                         where tc.trilha_id = tr.id and tc.pesquisa_id = {pesquisa.id}) isnull 
                    then 'N' 
                    else 'S' end as tr_id 
              from {trilha.__tablename__} tr"""
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
    pesquisas = db.relationship("PesquisaTrilha", back_populates="trilhas")

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


class Pesquisa(db.Model):
    __tablename__ = 'pesquisa'

    id = db.Column(db.Integer, primary_key=True, autoincrement='auto')
    nome = db.Column(db.String(50), nullable=False, doc='Nome da pesquisa')
    descricao = db.Column(db.String(500), nullable=False, doc='Descriçao da pesquisa')
    itens_lista = db.Column(db.String(50000), default='', doc='Entes da lista')
    trilhas = db.relationship("PesquisaTrilha", back_populates="pesquisas")
    @hybrid_property
    def selecao(self):
        return selecao_trilhas(self)
    def __repr__(self):
        return '{}-{}:{}'.format(self.id,self.nome,self.descricao)

class PesquisaTrilha(db.Model):
    __tablename__ = 'pesquisa_trilha'

    id = db.Column(db.Integer, primary_key=True, autoincrement='auto')
    pesquisa_id = db.Column(db.BigInteger, db.ForeignKey('pesquisa.id'), index=True, nullable=False)
    trilha_id = db.Column(db.BigInteger, db.ForeignKey('trilha.id'), index=True, nullable=False)
    trilhas = db.relationship("Trilha", back_populates="pesquisas")
    pesquisas = db.relationship("Pesquisa", back_populates="trilhas")

    def __repr__(self):
        return '{}-{}:{}'.format(self.id, self.pesquisa_id, self.trilha_id,)


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

    def entes_default(self):
        padroes=[]
        padroes.append({'tipo': 'PJ', 'ident': '33541368000116', 'subtipo':'EMP'})
        padroes.append({'tipo': 'PJ', 'ident': '00399857000126', 'subtipo':'EMP'})
        padroes.append({'tipo': 'PJ', 'ident': '42357483000126', 'subtipo':'EMP'})
        padroes.append({'tipo': 'PF', 'ident': '65147235434 ', 'subtipo':'CPF'})
        padroes.append({'tipo': 'PF', 'ident': '04688678487 ', 'subtipo':'CPF'})


        for ente in padroes:
            tipo = ente['tipo']
            ident = ente['ident']
            subtipo = ente['subtipo']
            sql = f"select * from {self.__tablename__} where ident = '{ident}' and tipo = '{tipo}' and subtipo = '{subtipo}' "
            con = current_app.config['SQLALCHEMY_DATABASE_URI']
            df_ente = pd.read_sql(sql=sql, con=con)
            if len(df_ente) == 0:
            #if conexao.id is None:
                temp_entes = temp_entes()
                db.session.add(temp_entes)
                temp_entes.tipo = tipo
                temp_entes.subtipo = subtipo
                temp_entes.ident = ident
                db.session.commit()





