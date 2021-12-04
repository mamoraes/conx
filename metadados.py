import sqlalchemy
import pandas as pd
import dask.dataframe as dd

DEBUG = True


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


def eh_conexao_ativa(cnx_str: str) -> bool:
    conexao_usuario = sqlalchemy.create_engine(cnx_str, execution_options=gEngineExecutionOptions)
    try:
        conexao_usuario.execute('select 1')
        return (True)
    except:
        return (False)


def obter_conexoes_ativas(cnx=DB_CONEXOES) -> list:
    conexoes = []
    # buscar as definicoes de buscas do usuario
    con = sqlalchemy.create_engine(cnx, execution_options=gEngineExecutionOptions)
    sql = """select nome, string from conexao conx where conx.string <> '{}' and conx.habilitada = 'S' group by conx.string order by string """.format(
        DB_CONEXOES)
    conx = con.execute(sql).fetchall()
    for item in conx:
        c = {}
        con_str = item['string']
        c['string'] = con_str
        c['nome'] = item['nome']
        c['engine'] = con
        # conexao_usuario = sqlalchemy.create_engine(con_str, execution_options=gEngineExecutionOptions)
        if eh_conexao_ativa(con_str):
            conexoes.append(c)
    return (conexoes)


def gerar_id_df(df, campo_tipo='tipo', campo_subtipo='subtipo', campo_ident='ident', campo_id='id', campo_nome='nome')->pd.DataFrame:
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

    return df

