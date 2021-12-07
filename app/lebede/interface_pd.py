# -*- coding: utf-8 -*-
# import pyodbc
import pandas as pd

import json

import time


import datetime
import metadados as metadados

import irradiar as irradiar

pasta_base = ''
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


df_qualif_socio = pd.read_csv(pasta_base+r"tabelas/tabela-de-qualificacao-do-socio-representante.csv", sep=';', dtype="str",
                              index_col='codigo')
df_subtipo_pj = pd.read_csv(pasta_base+r"tabelas/natureza_juridica_subtipo.csv", sep=';', )
dicSituacaoCadastral = {'01': 'Nula', '02': 'Ativa', '03': 'Suspensa', '04': 'Inapta', '08': 'Baixada'}


class Situacao_Cadastral_PJ:
    def __init__(self):
        self.dic = dicSituacaoCadastral

    def lkp(self, cod: str) -> str:
        return (self.dic[cod] if cod in self.dic else '')

    def ativa(self, cod: str) -> str:
        return ('S' if cod == '02' else 'N')


situacao_cadastral_pj = Situacao_Cadastral_PJ()


class Qualificacao_Socio:
    def __init__(self):
        self.df = pd.read_csv(pasta_base+r"tabelas/tabela-de-qualificacao-do-socio-representante.csv", sep=';',
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
        self.df = pd.read_csv(pasta_base+r"tabelas/natureza_juridica_subtipo.csv", sep=';', index_col=['codigo'])
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
    df_entes['atributos'] = df_entes['atributos'].fillna('')
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



class LeitorBDemCamadas:

    def __init__(self, qtdcamadas=0, conexoes_ativas=None, consultas_entes=None, consultas_vinculos=None, lista_entes_entrada=None):
        self.camadas = qtdcamadas
        self.nos = None
        self.ligacoes = None
        self.redejson = None
        self.conexoes_ativas = conexoes_ativas
        self.consultas_entes = consultas_entes
        self.consultas_vinculos = consultas_vinculos
        self.lista_entes_entrada = lista_entes_entrada
        self.df_entes_entrada = pd.DataFrame(columns=metadados.COLUNAS_ENTES)
        self.entrada(self.lista_entes_entrada)

    def entrada(self, lista_entes_entrada:list):
        if lista_entes_entrada == None:
            return
        for i in lista_entes_entrada:
            item = str(i)
            item = item.replace('.','').replace('-','').replace('/','')
            subtipo = ''
            tipo = 'PJ' if len(item) == 14 else 'PF'
            if tipo == 'PF' and item.find('*'):
                subtipo = '***'

            novo_ente = {'tipo': f'{tipo}', 'subtipo': f'{subtipo}', 'ident': f'{item}'}
            self.df_entes_entrada = self.df_entes_entrada.append(novo_ente, ignore_index=True)
        self.df_entes_entrada = metadados.gerar_id_df(self.df_entes_entrada)
        self.df_entes_entrada['fonte'] = 'usuario'
        self.df_entes_entrada['camada'] = 0

    def lerbd(self):
        self.nos, self.ligacoes = irradiar.visitar(lista_entes_entrada=self.df_entes_entrada, qtd_camadas=self.camadas,
                                         conexoes_ativas=self.conexoes_ativas)
        self.redejson = exportar_para_template(self.nos, self.ligacoes)
        return (self.redejson)



# entes.append(PF(subtipo='nome',ident='***554210**', nome='DIONATAN DORNELLES ANDRADE'))
# entes.append(PJ(subtipo='',ident='17653717000135'))


conexoes_ativas = metadados.obter_conexoes_ativas()


@timeit
def teste0(conexoes_ativas=conexoes_ativas):
    ok = True
    df_entes_entrada = pd.DataFrame(columns=metadados.COLUNAS_ENTES)
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

    df_entes_entrada = metadados.gerar_id_df(df_entes_entrada)
    df_entes_entrada['fonte'] = 'usuario'
    df_entes_entrada['camada'] = 0


@timeit
def teste1(conexoes_ativas=conexoes_ativas):
    ok = True
    l = LeitorBDemCamadas(4,metadados.obter_conexoes_ativas(),consultas_entes=None,consultas_vinculos=None,lista_entes_entrada=['17653717000135'])
    l.lerbd()
    print('TESTE 1', end=' ')
    nos = l.nos
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
    df_teste = pd.read_excel(pasta_base+'rede_de_relacionamentos_teste.xlsx', 'cpfcnpj', dtype='str')


    l = LeitorBDemCamadas(4, metadados.obter_conexoes_ativas(), consultas_entes=None, consultas_vinculos=None,
                          lista_entes_entrada=['11381605000196'])
    l.lerbd()
    print('TESTE 2', end=' ')
    tam_res = len(l.nos.index)
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
    nos_encontrados = l.nos['ident'].drop_duplicates().to_list()
    nos_encontrados.sort(reverse=False)

    if tam_res > len(nos_esperados):
        ok = False
        print('Nós execedentes')
    elif tam_res < len(nos_esperados):
        ok = False
        print('Nós faltantes')
    else:
        qtd = 0
        for n in l.nos.itertuples():
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
    print('ENCONTRADOS', l.nos['ident'].to_list())
    print('ESPERADOS: ', nos_esperados)
    return (ok)




if __name__ == "__main__":
    print('Teste0')
    teste0(conexoes_ativas)
    print('Teste1')

    teste1(conexoes_ativas)

    print('Teste2')
    teste2(conexoes_ativas)


