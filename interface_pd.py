# -*- coding: utf-8 -*-
# import pyodbc
import pandas as pd
import sqlalchemy
import json

import time

from sqlalchemy import MetaData
from sqlalchemy import inspect
from sqlalchemy.ext.declarative import declarative_base
import datetime

DEBUG = False
DF = True
PANDAS = False  # True

DB_CONEXOES = "sqlite:///conx.db"
TB_TEMPORARIA_ENTES = "TEMP_ENTES"  # tabela para joins nos bancos de dados

COLUNAS_ID_BD = {'id': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR, 'pandas': 'str'}}
COLUNAS_ENTES_CHAVE_BD = {
    'tipo': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=5), 'pandas': 'str'},
    'ident': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=150), 'pandas': 'str'},
    # deve comportar endereço
    'nome': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=150), 'pandas': 'str'}}
COLUNAS_ENTES_CHAVE = [col for col in COLUNAS_ENTES_CHAVE_BD]

COLUNAS_ENTES_ATRIBUTOS_BD = {
    'subtipo': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=5), 'pandas': 'str'},
    'data_ini': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=8), 'pandas': 'str'},
    # aaammdd
    'data_fim': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=8), 'pandas': 'str'},
    # aaammdd
    'em_atividade': {'default': 'S', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=1),
                     'pandas': 'str'},  # aaammdd
    'atributos': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.TEXT(), 'pandas': 'str'}}
COLUNAS_ENTES_ATRIBUTOS = [col for col in COLUNAS_ENTES_ATRIBUTOS_BD]

COLUNAS_VISITA_BD = {
    'camada': {'default': 0, 'sqlite': 'INTEGER', 'sqlalchemy': sqlalchemy.types.SMALLINT, 'pandas': 'int'},
    'fonte': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=50), 'pandas': 'str'}}

COLUNAS_VISITA = [col for col in COLUNAS_VISITA_BD]
COLUNAS_ENTES_BD = {**COLUNAS_ID_BD, **COLUNAS_ENTES_CHAVE_BD, **COLUNAS_ENTES_ATRIBUTOS_BD, **COLUNAS_VISITA_BD}
COLUNAS_ENTES = [col for col in COLUNAS_ENTES_BD.keys()]  # ['tipo', 'ident', 'nome', 'subtipo' ...
COLUNAS_ENTES_DF = [(col, tipo_col['pandas']) for col, tipo_col in COLUNAS_ENTES_BD.items()]

INDICES_ENTES = [c for c in COLUNAS_ENTES_CHAVE]

#########################
COLUNAS_VINCULO_ENTE_ORIGEM_BD = {col + '_origem': tipo for col, tipo in
                                  {**COLUNAS_ID_BD, **COLUNAS_ENTES_CHAVE_BD}.items()}
COLUNAS_VINCULO_ENTE_DESTINO_BD = {col + '_destino': tipo for col, tipo in
                                   {**COLUNAS_ID_BD, **COLUNAS_ENTES_CHAVE_BD}.items()}

COLUNAS_VINCULO_ENTE_ORIGEM = [col for col in COLUNAS_VINCULO_ENTE_ORIGEM_BD]
COLUNAS_VINCULO_ENTE_DESTINO = [col for col in COLUNAS_VINCULO_ENTE_DESTINO_BD]
COLUNAS_VINCULO_ATRIBUTOS_BD = {
    'descricao': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=150),
                  'pandas': 'str'},
    'data_ini': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=8), 'pandas': 'str'},
    # aaammdd
    'data_fim': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=8), 'pandas': 'str'},
    # aaammdd
    'efetivo': {'default': '1', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=5), 'pandas': 'str'},
    'direcao': {'default': '00', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=5), 'pandas': 'str'},
    'atributos': {'default': '', 'sqlite': 'TEXT', 'sqlalchemy': sqlalchemy.types.NVARCHAR(length=500),
                  'pandas': 'str'}}
COLUNAS_VINCULO_ATRIBUTOS = [col for col in COLUNAS_VINCULO_ATRIBUTOS_BD]
COLUNAS_VINCULOS_BD = {**COLUNAS_VINCULO_ENTE_ORIGEM_BD, **COLUNAS_VINCULO_ENTE_DESTINO_BD,
                       **COLUNAS_VINCULO_ATRIBUTOS_BD, **COLUNAS_VISITA_BD}
COLUNAS_VINCULOS = [col for col in COLUNAS_VINCULOS_BD]
COLUNAS_VINCULOS_DF = [(col, tipo_col['pandas']) for col, tipo_col in COLUNAS_VINCULOS_BD.items()]
COLUNAS_DESTINO = [c for c in {**COLUNAS_ID_BD, **COLUNAS_ENTES_CHAVE_BD}.keys()]
"""COLUNAS_VINCULOS = ['tipo_destino', 'ident_destino', 'nome_destino','tipo_origem', 'ident_origem', 'nome_origem', 
                    'descricao', 'efetivo', 'direcao','nomes_atributos','valores_atributos','fonte']"""
# INDICES_VINCULOS = ['tipo_destino', 'ident_destino', 'nome_destino','tipo_origem', 'ident_origem', 'nome_origem', 'descricao']
INDICES_VINCULOS = COLUNAS_VINCULO_ENTE_ORIGEM + COLUNAS_VINCULO_ENTE_DESTINO + ['descricao']

SEPARA_ID = '_/¨'

gEngineExecutionOptions = {"sqlite_raw_colnames": True, 'pool_size': 1}  # pool_size=1 força usar só uma conexão??


# decorator para medir tempo de execução de função
def timeit(method):
    def timed(*args, **kw):
        ts = time.time()
        result = method(*args, **kw)
        te = time.time()
        if 'log_time' in kw:
            name = kw.get('log_name', method.__name__.upper())
            kw['log_time'][name] = int((te - ts) * 1000)
        else:
            print('%r  %2.2f ms' % \
                  (method.__name__, (te - ts) * 1000))
        return result

    return timed


df_qualif_socio = pd.read_csv(r"tabelas/tabela-de-qualificacao-do-socio-representante.csv", sep=';', dtype="str",
                              index_col='codigo')
df_subtipo_pj = pd.read_csv(r"tabelas/natureza_juridica_subtipo.csv", sep=';', )
dicSituacaoCadastral = {'01': 'Nula', '02': 'Ativa', '03': 'Suspensa', '04': 'Inapta', '08': 'Baixada'}


class Situacao_Cadastral_PJ:
    def __init__(self):
        self.dic = dicSituacaoCadastral

    def lkp(self, cod: str) -> str:
        return (self.dic[cod] if cod in self.dic else '')

    def ativa(self, cod: str) -> str:
        return ('S' if cod == '02' else 'N')


situacao_sadastral_pj = Situacao_Cadastral_PJ()


class Qualificacao_Socio:
    def __init__(self):
        self.df = pd.read_csv(r"tabelas/tabela-de-qualificacao-do-socio-representante.csv", sep=';',
                              index_col=['codigo'])
        # self.dic = self.df.to_dict(orient='index')

    def lkp(self, cod) -> str:
        try:
            qualif = self.df.loc[cod]['descricao']
            # self.dic[cod] if cod in self.dic else ''
        except:
            qualif = 'sócio'
        return (qualif)


qualificacao_socio = Qualificacao_Socio()


class Subtipo_pj:
    def __init__(self):
        self.df = pd.read_csv(r"tabelas/natureza_juridica_subtipo.csv", sep=';', index_col=['codigo'])
        # self.dic = self.df.to_dict(orient='index')

    def lkp(self, cod) -> str:
        # self.dic[cod]['subtipo'] if cod in self.dic else ''
        try:
            subtipo = self.df.loc[cod]['subtipo']
        except:
            subtipo = 'EMP'
        return (subtipo)


subtipo_pj = Subtipo_pj()


def eh_data_valida(dt: str) -> str:
    try:
        datetime.datetime.strptime(dt, '%Y%m%d')
    except:
        dt = ''
    return (dt)


def jsonificar(atrib: str = '') -> dict:
    if atrib == None or atrib == '':
        return ({})
    d = json.loads('{' + atrib + '}')
    return (d)


class ComandoSql:
    def __init__(self, comandos, conexao_usuario):
        self.id = comandos.id
        self.conx_id = comandos.conx_id
        self.conx_nome = comandos.conx_nome
        self.cmd_sql = comandos.cmd_sql
        self.fonte = comandos.fonte
        self.fonte_extenso = self.fonte + ' @' + str(self.conx_id) + '-' +self.conx_nome+ '-' + str(self.id)
        self.conexao = conexao_usuario


class EntesVinculos:
    def __init__(self, cnx, nome_tabela: str = ''):
        self.nome_tabela = nome_tabela
        self.cnx = cnx
        self.df = None

    def excluir_tb(self):
        base = declarative_base()
        metadata = MetaData(self.cnx)
        metadata.reflect()
        table = metadata.tables.get(self.nome_tabela)
        if table is not None:
            try:
                base.metadata.drop_all(self.cnx, [table], checkfirst=True)
            except:
                print(f"Erro excluindo tabela temporaria {self.nome_tabela}")

    def recriar_tb(self):
        self.excluir_tb()
        self.criar_tb()

    def imprimir(self):
        if not DEBUG:
            return
        try:
            if self.df.empty:
                print(self.nome_tabela, 'DF VAZIO')
            else:
                print('\nDump ', self.nome_tabela)
                print(self.df.to_string())
        except:
            print('DF não iniciado')


class Entes(EntesVinculos):
    def __init__(self, cnx, nome_tabela: str = ''):
        super().__init__(cnx, nome_tabela)
        self.criar_tb()
        self.criar_df()

    def criar_df(self):
        self.df = pd.read_sql_table(self.nome_tabela, self.cnx)  # .set_index('id')
        # self.df.index.name = 'id'
        return

    def recriar_df(self):
        self.criar_df()
        return

    def criar_tb(self):
        self.excluir_tb()
        campos = (col + ' ' + tipo_col['sqlite'] for col, tipo_col in COLUNAS_ENTES_BD.items())
        str_campos = ','.join(campos)

        sql = f"""CREATE TABLE IF NOT EXISTS {self.nome_tabela} 
            ({str_campos})"""
        try:
            self.cnx.execute(sql)
        except:
            print(f"Erro criando tabela temporaria {self.nome_tabela}", sql)
        sql = f"""CREATE UNIQUE INDEX IF NOT EXISTS idx_tin on {self.nome_tabela} 
            ({', '.join(INDICES_ENTES)})"""
        try:
            self.cnx.execute(sql)
        except:
            print(f"Erro criando índice tabela temporaria {self.nome_tabela}", sql)

    def incluir_entes_df(self, lista_entes: pd.DataFrame, atualizar=True):
        df = self.df.merge(lista_entes, on=['id'], how='outer', indicator=True)
        novos = df.loc[lambda x: x['_merge'] == 'right_only'].drop(columns=['_merge'])
        colunas_novos = novos.columns
        novos = novos.drop(columns=[c for c in colunas_novos if c.endswith('_x')])
        novos = novos.rename(columns={c: c[:-2] for c in colunas_novos if c.endswith('_y')})

        comuns = df.loc[lambda x: x['_merge'] == 'both'].drop(columns=['_merge'])
        colunas_comuns = comuns.columns
        colunas = [c[:-2] for c in colunas_novos if c.endswith('_x')]
        for c in colunas:
            filtro_campo = comuns[c + '_y'].notna()
            comuns.loc[filtro_campo, [c + '_x']] = comuns[c + '_y']

        self.df = pd.concat([self.df, novos])  # inclui os novos

        return


class Vinculos(EntesVinculos):
    def __init__(self, cnx, nome_tabela: str = ''):
        self.nome_tabela = nome_tabela
        self.df = None
        self.cnx = cnx
        self.criar_tb()
        self.criar_df()

    def criar_df(self):
        self.df = pd.read_sql_table(self.nome_tabela, self.cnx)  # .set_index(['id_origem','id_destino'])
        # self.df.index.name = 'id_od'
        return

    def excluir_tb(self):
        base = declarative_base()
        metadata = MetaData(self.cnx)
        metadata.reflect()
        table = metadata.tables.get(self.nome_tabela)
        if table is not None:
            try:
                base.metadata.drop_all(self.cnx, [table], checkfirst=True)
            except:
                print(f"Erro excluindo tabela temporaria {self.nome_tabela}")

    def criar_tb(self):
        self.excluir_tb()
        campos = (col + ' ' + tipo_col['sqlite'] for col, tipo_col in COLUNAS_VINCULOS_BD.items())
        str_campos = ','.join(campos)
        sql = f"""CREATE TABLE IF NOT EXISTS {self.nome_tabela} 
            ({str_campos})"""
        try:
            self.cnx.execute(sql)
        except:
            print(f"Erro criando tabela temporaria {self.nome_tabela}", sql)
        sql = f"""CREATE UNIQUE INDEX IF NOT EXISTS idx_tintin on {self.nome_tabela} 
            ({','.join(INDICES_VINCULOS)})"""
        try:
            self.cnx.execute(sql)
        except:
            print(f"Erro criando índice tabela temporaria {self.nome_tabela}", sql)


def gerar_ids(df: pd.DataFrame) -> pd.DataFrame:
    gerar_id_df(df, campo_tipo='tipo_origem', campo_subtipo='subtipo_origem', campo_ident='ident_origem',
                campo_id='id_origem', campo_nome='nome_origem')
    gerar_id_df(df, campo_tipo='tipo_destino', campo_subtipo='subtipo_destino', campo_ident='ident_destino',
                campo_id='id_destino', campo_nome='nome_destino')

    cond = df['id_origem'] > df['id_destino']  # para inverter, se origem > destino
    df.loc[cond, ['id_origem', 'ident_origem', 'tipo_origem', 'subtipo_origem', 'nome_origem',
                  'id_destino', 'ident_destino', 'tipo_destino', 'subtipo_destino', 'nome_destino']] = \
        df.loc[cond, ['id_destino', 'ident_destino', 'tipo_destino', 'subtipo_destino', 'nome_destino',
                      'id_origem', 'ident_origem', 'tipo_origem', 'subtipo_origem', 'nome_origem']].values
    return (df)


def executar_query_entes(q: ComandoSql, camada=0, final=False) -> pd.DataFrame:
    # executa uma querie definida pelo usuario
    cnx = q.conexao
    try:
        consulta_entes = pd.read_sql(con=cnx, sql=q.cmd_sql)
    except:
        return pd.DataFrame.from_dict({})  # df vazio

    consulta_entes['camada'] = camada
    consulta_entes['fonte'] = q.fonte_extenso
    for c in COLUNAS_ENTES:  # inicializar os demais campos
        if not (c in consulta_entes.columns):
            consulta_entes[c] = ''
    gerar_id_df(consulta_entes)

    return (consulta_entes)


def executar_query_vinculos(q: ComandoSql, camada=0) -> (pd.DataFrame, pd.DataFrame):
    # executa uma querie definida pelo usuario
    cnx = q.conexao
    try:
        df = pd.read_sql(q.cmd_sql, cnx)
    except:
        return (pd.DataFrame.from_dict({}), pd.DataFrame.from_dict({}))

    df_destino = pd.DataFrame()
    if not df.empty:
        df['tipo'] = df['tipo_destino']
        df['ident'] = df['ident_destino']
        df['nome'] = df['nome_destino']
        df['subtipo'] = ''

        gerar_id_df(df)
        df['fonte'] = q.fonte_extenso
        df['camada'] = camada
        gerar_ids(df)
        df_destino = df[COLUNAS_DESTINO]
        df_destino = df_destino.drop_duplicates()
        df_destino['camada'] = camada + 1  # vai ser visitado na proxima camada
        df_destino['fonte'] = q.fonte_extenso
        for c in COLUNAS_ENTES_ATRIBUTOS:
            df_destino[c] = ''
        df = df.drop(columns=COLUNAS_DESTINO)
    return (df_destino, df)


def ajustar_camada_A_VISITAR(entes_a_visitar, entes_visitados, entes_resultado, camada: int):
    def ajustar_camada_A_VISITAR_df(entes_a_visitar, entes_visitados, entes_resultado, camada: int):
        # Linhas em entes_resultado que nao estao em entes_visitados
        if entes_visitados.df.empty: #  se nenhum ente foi visitado, os iniciais serao incluidos no a_visitar
            entes_a_visitar.df = entes_resultado.df
        else: #  deverao ser visitados os entes do resultado que ainda nao foram visitados
            entes_a_visitar.df = entes_resultado.df.merge(entes_visitados.df, how='outer', indicator=True).loc[
                lambda x: x['_merge'] == 'left_only']
            # for d in [entes_resultado.df,entes_a_visitar.df,entes_visitados.df]:
            #    if '_merge' in d:
            #        d.drop(columns=['_merge'],inplace=True)

            if '_merge' in entes_resultado.df:
                entes_resultado.df.drop(columns=['_merge'], inplace=True)
            if '_merge' in entes_a_visitar.df:
                entes_a_visitar.df.drop(columns=['_merge'], inplace=True)
            if '_merge' in entes_visitados.df:
                entes_visitados.df.drop(columns=['_merge'], inplace=True)

    ajustar_camada_A_VISITAR_df(entes_a_visitar, entes_visitados, entes_resultado, camada)


def atualizar_entes(entes_a_visitar: Entes, entes_visitados: Entes):
    # Adicionar ao VISITADOS a ultima camada visitada
    entes_visitados.df = pd.concat([entes_a_visitar.df, entes_visitados.df]).drop_duplicates()


def eh_conexao_ativa(cnx_str: str) -> bool:
    conexao_usuario = sqlalchemy.create_engine(cnx_str, execution_options=gEngineExecutionOptions)
    if DEBUG:
        print(f'Verificando conexão {cnx_str}: ', end=" ")
    try:
        conexao_usuario.execute('select 1')
        if DEBUG:
            print('OK')
        return (True)
    except:
        if DEBUG:
            print('FALHOU')
        return (False)


def obter_conexoes_ativas(cnx=DB_CONEXOES) -> list:
    conexoes = []
    # buscar as definicoes de buscas do usuario
    con = sqlalchemy.create_engine(cnx, execution_options=gEngineExecutionOptions)
    sql = """select id, nome, string from conexao conx where conx.string <> '{}' and conx.habilitada = 'S' group by conx.string order by string """.format(
        DB_CONEXOES)
    conx = con.execute(sql).fetchall()
    for item in conx:
        c = {}
        con_str = item['string']
        c['id'] = item['id']
        c['string'] = con_str
        c['nome'] = item['nome']
        c['engine'] = con
        # conexao_usuario = sqlalchemy.create_engine(con_str, execution_options=gEngineExecutionOptions)
        if eh_conexao_ativa(con_str):
            conexoes.append(c)
    return (conexoes)


def exportar_para_template(df_entes, df_vinculos) -> dict:
    resultado = {}
    filtro_pf = df_entes['tipo'] == 'PF'
    filtro_pj = df_entes['tipo'] == 'PJ'
    filtro_pfnome = df_entes['subtipo'] == '***'
    df_entes['id'] = ''
    df_entes.loc[filtro_pj, 'id'] = 'PJ_' + df_entes['ident']
    df_entes.loc[filtro_pfnome, 'id'] = 'PF_' + df_entes['ident'] + '-' + df_entes['nome']
    df_entes = df_entes.rename(columns={'nome': 'descricao'})
    df_entes['situacao_ativa'] = True
    df_entes['logradouro'] = ''
    df_entes['municipio'] = ''
    df_entes['uf'] = ''
    df_entes['cod_nat_juridica'] = ''
    colunas_entes_exportar = ['id', 'descricao', 'camada', 'situacao_ativa', 'logradouro', 'municipio', 'uf', 'imagem',
                              'cor', 'sexo', 'nota']
    nj = lambda a: jsonificar(a) if (a != None and 'natureza_juridica' in a) else {'natureza_juridica': ''}
    df_entes.loc[filtro_pj, 'cod_nat_juridica'] = df_entes['atributos'].apply(lambda a: nj(a)['natureza_juridica'])

    df_entes['imagem'] = 'icone-grafo-masculino.png'
    df_entes['cor'] = 'red'
    df_entes['nota'] = ''
    df_entes['sexo'] = 0
    nos = df_entes[colunas_entes_exportar].to_dict(orient='records')

    colunas_vinculos_exportar = ['origem', 'destino', 'cor', 'camada', 'tipoDescricao', 'label']
    df_vinculos['origem'] = df_vinculos['tipo_origem'] + '_' + df_vinculos['ident_origem']
    df_vinculos['destino'] = df_vinculos['tipo_destino'] + '_' + df_vinculos['ident_destino']
    filtro_pf = df_vinculos['tipo_origem'] == 'PF'
    df_vinculos.loc[filtro_pf, 'origem'] += '-' + df_vinculos['nome_origem']
    filtro_pf = df_vinculos['tipo_destino'] == 'PF'
    df_vinculos.loc[filtro_pf, 'destino'] += '-' + df_vinculos['nome_destino']

    df_vinculos['tipoDescricao'] = df_vinculos['descricao']
    df_vinculos['cor'] = 'silver'
    df_vinculos = df_vinculos.rename(columns={'descricao': 'label'})
    df_vinculos['camada'] = 0

    ligacoes = df_vinculos[colunas_vinculos_exportar].to_dict(orient='records')
    resultado = {'no': nos, 'ligacao': ligacoes, 'mensagem': {'lateral': '', 'popup': '', 'confirmar': ''}}
    print(resultado)
    return resultado


def visitar(lista_entes_entrada=[], qtd_camadas: int = 2, conexoes_ativas=[]):
    if len(lista_entes_entrada) == 0:  # nada a fazer
        return
    else:
        gerar_id_df(lista_entes_entrada)
        lista_entes_entrada['fonte'] = 'usuario'
        lista_entes_entrada['camada'] = 0

    # limite de camadas ENTRE 1 E 3
    qtd_camadas = min(qtd_camadas, 3)
    qtd_camadas = max(1, qtd_camadas)

    # tabelas auxiliares para progressao das camadas
    cnx_temp = sqlalchemy.create_engine('sqlite://')  # :memory:
    # cnx_temp = sqlalchemy.create_engine(DB_CONEXOES)

    VISITADOS = 'temp_entes_visitados'  # acumula as novas camadas originadas de cada consulta
    A_VISITAR = 'temp_entes_a_visitar'  # entes a visitar em cada camada
    RESULTADO = 'temp_entes_resultado'  # novos entes que surgem a partir dos relacionamentos com os de entrada
    VINCULOS = 'temp_vinculos'  # colecao de vinculos

    entes_visitados = Entes(cnx_temp, VISITADOS)
    entes_a_visitar = Entes(cnx_temp, A_VISITAR)
    entes_resultado = Entes(cnx_temp, RESULTADO)

    vinculos_aux = Vinculos(cnx_temp, VINCULOS)

    conx = sqlalchemy.create_engine(DB_CONEXOES, execution_options=gEngineExecutionOptions)
    df_query_entes =    pd.read_sql("select consulta.*, conexao.nome conx_nome from consulta  inner join conexao on conexao.id = consulta.conx_id where consulta.habilitada = 'S' and tipo ='E'", conx)
    df_query_vinculos = pd.read_sql("select consulta.*, conexao.nome conx_nome from consulta  inner join conexao on conexao.id = consulta.conx_id where consulta.habilitada = 'S' and tipo ='V'", conx)

    camada = 0
    if inspect(cnx_temp).has_table(RESULTADO):
        entes_resultado.incluir_entes_df(lista_entes_entrada)

    while True:
        if camada > qtd_camadas:
            break
        else:
            ultima_camada = camada == qtd_camadas  #  ultima camada tem tratamento diferente

        # visitar apenas os entes que não foram identificados ainda: 
        # proximos a visitar = resultado da última camada  - visitados em todas as camadas anteriores;
        # para evitar repeticoes: camada 0: A-> B; camada 1: B <- A; camada 2: A -> B ...
        ajustar_camada_A_VISITAR(entes_a_visitar,
                                 entes_visitados,
                                 entes_resultado,
                                 camada=camada)

        if DEBUG:
            print(f'\nCamada : {camada}')
            entes_visitados.imprimir()
            entes_a_visitar.imprimir()

        for conexao in conexoes_ativas:
            # conexao_usuario = conexao['engine']
            conexao_usuario = sqlalchemy.create_engine(conexao['string'], execution_options=gEngineExecutionOptions)

            # insere os entes a serem pesquisados em uma tabela no banco de dados de pesquisa, para joins
            # utiliza pandas + sqlAlchemy para facilitar a portabilidade entre diversos BDs
            df_camada_A_VISITAR = entes_a_visitar.df

            if not df_camada_A_VISITAR.empty:
                try:  # salva, em cada BD a ser consultado, a relacao de entes a visitar para fazer os joins
                    df_camada_A_VISITAR.to_sql(TB_TEMPORARIA_ENTES, conexao_usuario, if_exists='replace', index=False,
                                               index_label='ident')
                except ValueError as v:
                    print(v)
                    print(df_camada_A_VISITAR)
                    continue

                    # seleciona as consultas para o BD da vez
            filtro_entes_conx = df_query_entes['conx_id'] == conexao['id']
            df_qe = df_query_entes[filtro_entes_conx]

            #  buscar dados dos entes que estão sendo visitados
            for cmd in df_qe.itertuples():
                query_usuario = ComandoSql(cmd, conexao_usuario)
                entes_visitando = executar_query_entes(query_usuario, camada, ultima_camada)
                # atualizar_entes_a_visitar(cnx_temp,A_VISITAR,novos_entes)
                if not entes_visitando.empty:
                    entes_a_visitar.incluir_entes_df(entes_visitando)

            if not ultima_camada:  # somente busca novos vínculos até a última camada
                filtro_vinculos_conx = df_query_vinculos['conx_id'] == conexao['id']
                df_qv = df_query_vinculos[filtro_vinculos_conx]

                # executa cada uma das queries cadastradas pelo usuario
                for cmd in df_qv.itertuples():
                    query_usuario = ComandoSql(cmd, conexao_usuario)
                    df_novos_entes, df_novos_vinculos = executar_query_vinculos(query_usuario, camada)
                    entes_resultado.df = pd.concat([df_novos_entes, entes_resultado.df]).drop_duplicates()
                    vinculos_aux.df = pd.concat([df_novos_vinculos, vinculos_aux.df]).drop_duplicates()

        # atualizar VISITADOS de camadas com a ultima visitada
        atualizar_entes(entes_a_visitar, entes_visitados)
        camada += 1

    # finalizar entes

    entes_visitados.imprimir()
    vinculos_aux.imprimir()

    # df_vinculos = pd.read_sql(VINCULOS, cnx_temp)
    # df_entes = pd.read_sql(VISITADOS,cnx_temp)
    return (entes_visitados.df, vinculos_aux.df)


df_entes_entrada = pd.DataFrame(columns=COLUNAS_ENTES)

novo_ente = {'tipo': 'PF', 'subtipo': '***', 'ident': '***554210**', 'nome': 'DIONATAN DORNELLES ANDRADE'}
df_entes_entrada = df_entes_entrada.append(novo_ente, ignore_index=True)
"""
novo_ente = {'tipo':'PJ', 'subtipo':'','ident':'17653717000135', 'nome':''}
df_entes_entrada=df_entes_entrada.append(novo_ente, ignore_index=True)
novo_ente = {'tipo':'PJ', 'subtipo':'','ident':'19391842000140', 'nome':''}
df_entes_entrada=df_entes_entrada.append(novo_ente, ignore_index=True)

novo_ente = {'tipo':'PJ', 'subtipo':'','ident':'05359440000153', 'nome':''}
df_entes_entrada=df_entes_entrada.append(novo_ente, ignore_index=True)

novo_ente = {'tipo':'PJ', 'subtipo':'','ident':'00000000000191', 'nome':''}
df_entes_entrada=df_entes_entrada.append(novo_ente, ignore_index=True)

novo_ente = {'tipo':'PJ', 'subtipo':'','ident':'11555207000149', 'nome':''}
df_entes_entrada=df_entes_entrada.append(novo_ente, ignore_index=True)

novo_ente = {'tipo':'PF', 'subtipo':'***', 'ident':'***849457**', 'nome': 'SANDRA APARECIDA CANEDO OLIVEIRA'}
df_entes_entrada=df_entes_entrada.append(novo_ente, ignore_index=True)
"""
df_entes_entrada['camada'] = 0
# entes.append(PF(subtipo='nome',ident='***554210**', nome='DIONATAN DORNELLES ANDRADE'))
# entes.append(PJ(subtipo='',ident='17653717000135'))
if DEBUG:
    print('ENTRADA: ', df_entes_entrada)

conexoes_ativas = obter_conexoes_ativas(DB_CONEXOES)


def gerar_id_df(df, campo_tipo='tipo', campo_subtipo='subtipo', campo_ident='ident', campo_id='id', campo_nome='nome'):
    for campo in [campo_tipo, campo_subtipo, campo_id, campo_nome, campo_ident]:
        if not campo in df.columns:
            df[campo] = ''
    filtro_subtipo = df[campo_subtipo] == ''
    filtro_tipo = df[campo_tipo] == 'PJ'
    df.loc[filtro_tipo & filtro_subtipo, [campo_subtipo]] = 'EMP'
    filtro_tipo = df[campo_tipo] == 'PF'
    df.loc[filtro_tipo & filtro_subtipo, [campo_subtipo]] = 'CPF'

    filtro_tipo = df[campo_tipo] == 'PF'
    filtro_ident = df[campo_ident].apply(lambda i: str(i).startswith('***'))
    df.loc[filtro_tipo & filtro_subtipo & filtro_ident, [campo_subtipo]] = '***'

    filtro_tipo = df[campo_tipo] == 'AG'
    df.loc[filtro_tipo & filtro_subtipo, [campo_subtipo]] = 'LIV'
    filtro_tipo = df[campo_tipo] == 'EN'
    df.loc[filtro_tipo & filtro_subtipo, [campo_subtipo]] = 'DER'
    filtro_tipo = df[campo_tipo] == 'EM'
    df.loc[filtro_tipo & filtro_subtipo, [campo_subtipo]] = 'AIL'
    filtro_tipo = df[campo_tipo] == 'CC'
    df.loc[filtro_tipo & filtro_subtipo, [campo_subtipo]] = 'CAB'
    filtro_tipo = df[campo_tipo] == 'FN'
    df.loc[filtro_tipo & filtro_subtipo, [campo_subtipo]] = 'DDD'
    filtro_tipo = df[campo_tipo] == 'DC'
    df.loc[filtro_tipo & filtro_subtipo, [campo_subtipo]] = 'DOC'
    filtro_tipo = df[campo_tipo] == 'BM'
    df.loc[filtro_tipo & filtro_subtipo, [campo_subtipo]] = 'BEM'

    filtro_tipo = df[campo_tipo] == 'PF'
    filtro_subtipo = df[campo_subtipo] == '***'
    df.loc[filtro_tipo & filtro_subtipo, [campo_id]] = df[campo_tipo] + SEPARA_ID + df[campo_ident] + SEPARA_ID + df[
        campo_nome]

    df.loc[~(filtro_tipo & filtro_subtipo), [campo_id]] = df[campo_tipo] + SEPARA_ID + df[campo_ident]

    return (df)


@timeit
def teste0(conexoes_ativas=conexoes_ativas):
    ok = True
    df_entes_entrada = pd.DataFrame(columns=COLUNAS_ENTES)
    novo_ente = {'tipo': 'PJ', 'subtipo': '', 'ident': '17653717000135', 'nome': ''}
    df_entes_entrada = df_entes_entrada.append(novo_ente, ignore_index=True)
    novo_ente = {'tipo': 'PF', 'subtipo': '***', 'ident': '***554210**', 'nome': 'DIONATAN DORNELLES ANDRADE'}
    df_entes_entrada = df_entes_entrada.append(novo_ente, ignore_index=True)
    novo_ente = {'tipo': 'PJ', 'subtipo': '', 'ident': '17653717000135', 'nome': ''}
    df_entes_entrada = df_entes_entrada.append(novo_ente, ignore_index=True)
    novo_ente = {'tipo': 'PJ', 'subtipo': '', 'ident': '19391842000140', 'nome': ''}
    df_entes_entrada = df_entes_entrada.append(novo_ente, ignore_index=True)

    novo_ente = {'tipo': 'PJ', 'subtipo': '', 'ident': '05359440000153', 'nome': ''}
    df_entes_entrada = df_entes_entrada.append(novo_ente, ignore_index=True)

    novo_ente = {'tipo': 'PJ', 'subtipo': '', 'ident': '00000000000191', 'nome': ''}
    df_entes_entrada = df_entes_entrada.append(novo_ente, ignore_index=True)

    novo_ente = {'tipo': 'PJ', 'subtipo': '', 'ident': '11555207000149', 'nome': ''}
    df_entes_entrada = df_entes_entrada.append(novo_ente, ignore_index=True)

    novo_ente = {'tipo': 'PF', 'subtipo': '***', 'ident': '***849457**', 'nome': 'SANDRA APARECIDA CANEDO OLIVEIRA'}
    df_entes_entrada = df_entes_entrada.append(novo_ente, ignore_index=True)

    df_entes_entrada = gerar_id_df(df_entes_entrada)
    df_entes_entrada['fonte'] = 'usuario'
    df_entes_entrada['camada'] = 0


@timeit
def teste1(conexoes_ativas=conexoes_ativas):
    ok = True
    df_entes_entrada = pd.DataFrame(columns=COLUNAS_ENTES)
    novo_ente = {'tipo': 'PJ', 'subtipo': '', 'ident': '17653717000135', 'nome': ''}
    df_entes_entrada = df_entes_entrada.append(novo_ente, ignore_index=True)
    nos, ligacoes = visitar(df_entes_entrada, qtd_camadas=1, conexoes_ativas=conexoes_ativas)
    print('TESTE 1', end=' ')
    tam_res = len(nos.index)
    nos_esperados = ['17653717000135', '***554210**', '***223350**']
    if tam_res > len(nos_esperados):
        ok = False
        print('Nós execedentes')
    elif tam_res < len(nos_esperados):
        ok = False
        print('Nós faltantes')
    else:
        qtd = 0
        for n in nos.itertuples():
            if n.ident in nos_esperados:
                qtd += 1
        if qtd < len(nos_esperados):
            ok = False
            print('Divergências')
        else:
            ok = True
        if ok:
            print('OK')
    return (ok)


@timeit
def teste2(conexoes_ativas=conexoes_ativas):
    ok = True
    df_entes_entrada = pd.DataFrame(columns=COLUNAS_ENTES)
    df_teste = pd.read_excel('rede_de_relacionamentos_teste.xlsx', 'cpfcnpj', dtype='str')

    novo_ente = {'tipo': 'PJ', 'subtipo': '', 'ident': '11381605000196', 'nome': ''}
    df_entes_entrada = df_entes_entrada.append(novo_ente, ignore_index=True)
    nos, ligacoes = visitar(df_entes_entrada, qtd_camadas=3, conexoes_ativas=conexoes_ativas)
    print('TESTE 2', end=' ')
    tam_res = len(nos.index)
    nos_esperados = ['17653717000135', '***554210**', '***223350**']
    nos_esperados = ['***669094**', '***556164**', '***445474**', '***487634**', '***240104**'
        , '***315138**', '***358194**', '***437114**', '***236994**', '***446244**'
        , '08156424000151', '19962871000114', '32282884000100', '23680625000147'
        , '31894221000184', '12586987000157', '10572518000153', '24215308000112'
        , '04837129000100', '17214516000131', '18854487000135', '15095781000112'
        , '02550302000169', '16466118000140', '12388002000189', '12285441000166'
        , '11381605000196', '18345150000100', '33146648000120']
    nos_esperados = df_teste['cpfcnpj'].dropna().to_list() + df_teste['cpf***'].dropna().to_list()
    nos_esperados.sort(reverse=False)
    nos_encontrados = nos['ident'].drop_duplicates().to_list()
    nos_encontrados.sort(reverse=False)

    if tam_res > len(nos_esperados):
        ok = False
        print('Nós execedentes')
    elif tam_res < len(nos_esperados):
        ok = False
        print('Nós faltantes')
    else:
        qtd = 0
        for n in nos.itertuples():
            if n.ident in nos_esperados:
                qtd += 1
        if qtd < len(nos_esperados):
            ok = False
            print('Divergências')
        else:
            ok = True
        if ok:
            print('OK')
    excedentes = [n for n in nos_encontrados if not (n in nos_esperados)]
    print('Excedentes: ', excedentes.sort())
    faltantes = [n for n in nos_esperados if not (n in nos_encontrados)]
    print('Faltantes: ', faltantes)
    print('ENCONTRADOS', nos['ident'].to_list())
    print('ESPERADOS: ', nos_esperados)
    return (ok)


def executar(lista_entes_entrada=df_entes_entrada, qtd_camadas: int = 2, conexoes_ativas=conexoes_ativas):
    nos, ligacoes = visitar(lista_entes_entrada=df_entes_entrada, qtd_camadas=5, conexoes_ativas=conexoes_ativas)
    return (exportar_para_template(nos, ligacoes))


if __name__ == "__main__":
    DF = False
    PANDAS = False
    DEBUG = True
    for DF in [True]:
        for PANDAS in [True]:
            print('DF ', DF, 'PANDAS', PANDAS)
            print('Teste0')
            teste0(conexoes_ativas)
            print('Teste1')

            teste1(conexoes_ativas)

            #print('Teste2')
            #teste2(conexoes_ativas)
    # executar(lista_entes_entrada = df_entes_entrada, qtd_camadas = 1, conexoes_ativas = conexoes_ativas)
