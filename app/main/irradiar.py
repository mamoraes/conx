import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import MetaData, inspect

import pandas as pd
import dask.dataframe as dd
import app.main.metadados




class ComandoSql:
    def __init__(self, comandos, conexao_usuario):
        self.id = comandos.id
        self.conx = comandos.conx_nome
        self.cmd_sql = comandos.cmd_sql
        self.fonte = comandos.fonte
        self.fonte_extenso = self.fonte + ' @' + self.conx + '-' + str(self.id)
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
        if not metadados.DEBUG:
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
        self.ddf = dd.from_pandas(self.df, npartitions=10)
        # self.df.index.name = 'id'
        return

    def recriar_df(self):
        self.criar_df()
        return

    def criar_tb(self):
        self.excluir_tb()
        campos = (col + ' ' + tipo_col['sqlite'] for col, tipo_col in metadados.COLUNAS_ENTES_BD.items())
        str_campos = ','.join(campos)

        sql = f"""CREATE TABLE IF NOT EXISTS {self.nome_tabela} 
            ({str_campos})"""
        try:
            self.cnx.execute(sql)
        except:
            print(f"Erro criando tabela temporaria {self.nome_tabela}", sql)
        sql = f"""CREATE UNIQUE INDEX IF NOT EXISTS idx_tin on {self.nome_tabela} 
            ({', '.join(metadados.INDICES_ENTES)})"""
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
        self.ddf = dd.from_pandas(self.df, npartitions=10)
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
        campos = (col + ' ' + tipo_col['sqlite'] for col, tipo_col in metadados.COLUNAS_VINCULOS_BD.items())
        str_campos = ','.join(campos)
        sql = f"""CREATE TABLE IF NOT EXISTS {self.nome_tabela} 
            ({str_campos})"""
        try:
            self.cnx.execute(sql)
        except:
            print(f"Erro criando tabela temporaria {self.nome_tabela}", sql)
        sql = f"""CREATE UNIQUE INDEX IF NOT EXISTS idx_tintin on {self.nome_tabela} 
            ({','.join(metadados.INDICES_VINCULOS)})"""
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


def visitar(lista_entes_entrada=[], qtd_camadas: int = 2, conexoes_ativas=[], dfentes=None, dfvinc=None):
    if len(lista_entes_entrada) == 0:  # nada a fazer
        return
    else:
        #gerar_id_df(lista_entes_entrada)
        lista_entes_entrada['fonte'] = 'usuario'
        lista_entes_entrada['camada'] = 0

    # limite de camadas ENTRE 1 E 3
    qtd_camadas = min(qtd_camadas, 3)
    qtd_camadas = max(1, qtd_camadas)

    # tabelas auxiliares para progressao das camadas
    cnx_temp = sqlalchemy.create_engine('sqlite://')  # :memory:
    # cnx_temp = sqlalchemy.create_engine(DB_CONEXOES)    # :memory:

    VISITADOS = 'temp_entes_visitados'  # acumula as novas camadas originadas de cada consulta
    A_VISITAR = 'temp_entes_a_visitar'  # entes a visitar em cada camada
    RESULTADO = 'temp_entes_resultado'  # novos entes que surgem a partir dos relacionamentos com os de entrada
    VINCULOS = 'temp_vinculos'  # colecao de vinculos

    entes_visitados = Entes(cnx_temp, VISITADOS)
    entes_a_visitar = Entes(cnx_temp, A_VISITAR)
    entes_resultado = Entes(cnx_temp, RESULTADO)

    vinculos_aux = Vinculos(cnx_temp, VINCULOS)

    conx = sqlalchemy.create_engine(metadados.DB_CONEXOES, execution_options=metadados.gEngineExecutionOptions)
    if dfentes == None:
        df_query_entes = pd.read_sql("select consulta.*, conexao.nome conx_nome from consulta  inner join conexao on conexao.id = consulta.conx_id where consulta.habilitada = 'S' and tipo ='E'", conx)
    else:
        df_query_entes = pd.DataFrame(dfentes)
    if dfvinc == None:
        df_query_vinculos = pd.read_sql("select consulta.*, conexao.nome conx_nome from consulta  inner join conexao on conexao.id = consulta.conx_id where consulta.habilitada = 'S' and tipo ='V'", conx)
    else:
        df_query_vinculos = pd.DataFrame(dfvinc)

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

        if metadados.DEBUG:
            print(f'\nCamada : {camada}')
            entes_visitados.imprimir()
            entes_a_visitar.imprimir()

        for conexao in conexoes_ativas:
            # conexao_usuario = conexao['engine']
            conexao_usuario = sqlalchemy.create_engine(conexao['string'], execution_options=metadados.gEngineExecutionOptions)

            # insere os entes a serem pesquisados em uma tabela no banco de dados de pesquisa, para joins
            # utiliza pandas + sqlAlchemy para facilitar a portabilidade entre diversos BDs
            df_camada_A_VISITAR = entes_a_visitar.df

            if not df_camada_A_VISITAR.empty:
                try:  # salva, em cada BD a ser consultado, a relacao de entes a visitar para fazer os joins
                    df_camada_A_VISITAR.to_sql(metadados.TB_TEMPORARIA_ENTES, conexao_usuario, if_exists='replace', index=False,
                                               index_label='ident')
                except ValueError as v:
                    print(v)
                    print(df_camada_A_VISITAR)
                    continue

                    # seleciona as consultas para o BD da vez
            filtro_entes_conx = df_query_entes['conx_nome'] == conexao['nome']
            df_qe = df_query_entes[filtro_entes_conx]

            #  buscar dados dos entes que estão sendo visitados
            for cmd in df_qe.itertuples():
                query_usuario = ComandoSql(cmd, conexao_usuario)
                entes_visitando = executar_query_entes(query_usuario, camada, ultima_camada)
                # atualizar_entes_a_visitar(cnx_temp,A_VISITAR,novos_entes)
                if not entes_visitando.empty:
                    entes_a_visitar.incluir_entes_df(entes_visitando)

            if not ultima_camada:  # somente busca novos vínculos até a última camada
                filtro_vinculos_conx = df_query_vinculos['conx_nome'] == conexao['nome']
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
