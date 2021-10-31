import pyodbc
import config

#  AMBIENTE = config.AMBIENTE
CONECTADO_SQLS = config.AMBIENTE_CONECTADO_CGUDATA  # True apenas se estiver em ambiente com de conexao com SQLServer;
CONECTADO_MACROS = config.AMBIENTE_CONECTADO_MACROS
AMBIENTE_DESCONECTADO = config.AMBIENTE_DESCONECTADO

usuario = 'marciomo*'

sqls_usuario = 'sistemaMACROS' if usuario != 'marciomo' else usuario
sqls_senha = 'macrospwd'
sqls_trusted = 'no' if sqls_usuario == 'sistemaMACROS' else 'yes'

sqls = {
    'backend': 'sqlserver',
    'hostname': '10.125.4.54' if config.AMBIENTE == config.AMBIENTE_DESENVOLVIMENTO else '10.125.4.17',
    'port': '1433',
    'trusted': sqls_trusted,
    'usuario': sqls_usuario,
    'senha': sqls_senha,
    'usepool': False,
    'tds_version': 8.0,
    'connections': 2 if config.AMBIENTE == config.AMBIENTE_DESENVOLVIMENTO else 20,
    'database': 'MACROS_P' if sqls_usuario == 'sistemaMACROS' else 'temp_NAE_PE'
}


class Dbaux:
    def __init__(self):
        self.conectado = False
        self.cur = None

    def conectar(self):
        if not CONECTADO_SQLS:
            return False
        self.conectado = False
        if sqls_usuario == 'sistemaMACROS':
            str_conexao = 'DRIVER={SQL Server};SERVER=%s;PORT=%s;DATABASE=MACROS_P;TDS_Version=%s;UID=%s;PWD=%s;'
            str_conexao = str_conexao % (sqls['hostname'], sqls['port'], sqls['tds_version'], sqls_usuario, sqls_senha)
        else:
            str_conexao = 'Driver={SQL Server};Server=%s;Database=%s;Trusted_Connection=yes;'
            str_conexao = str_conexao % (sqls['hostname'], sqls['database'])
        try:
            self.con = pyodbc.connect(str_conexao)
            self.conectado = True
            self.cur = self.con.cursor()
        except ConnectionError:
            self.conectado = False
            self.cur = None
        return self.conectado


dbaux = Dbaux()
dbaux.conectar()


def so_digitos(s:str) ->str:
    if not s:
        s = ''
    return (''.join(c for c in s if c.isdigit()))


def pode_ser_cpf(cpfcnpj:str):
    return (len(so_digitos(cpfcnpj)) == 11)
def pode_ser_cnpj(cpfcnpj:str):
    return (len(so_digitos(cpfcnpj)) == 14)
def validar_cpf_cnpj(cpfcnpj):
    cpfcnpj = so_digitos(cpfcnpj)
    if pode_ser_cpf(cpfcnpj) or pode_ser_cnpj(cpfcnpj):
        return (True)
    else:
        return (False)



def lkp_cpf(cpf:str)->{}:
    lkp = {'nome':''}
    cpf = so_digitos(cpf)
    if not pode_ser_cpf(cpf):
        return (None)
    if not dbaux.conectado:
        return (None)  # não dá para testar, assum verdadeiro
    else:
        sql = "select nome from db_cpf.dbo.cpf where cpf = '%s'" % cpf
        try:
            cur = dbaux.cur.execute(sql).fetchone()
            lkp['nome'] = cur[0]
        except IOError:
            lkp=None
    return (lkp)

def lkp_cnpj(cnpj:str)->{}:
    lkp={'razaosocial':'','nomefantasia':''}
    cnpj = so_digitos(cnpj)
    if not pode_ser_cnpj(cnpj):
        return (None)
    if not dbaux.conectado:
        return (None)  # não dá para testar, assum verdadeiro
    else:
        sql = "select razaosocial, nomefantasia from db_cnpj.dbo.cnpj where cnpj = '%s'" % cnpj
        try:
            cur = dbaux.cur.execute(sql).fetchone()
            lkp['razaosocial'] = cur[0]
            lkp['nomefantasia'] = cur[1]
        except IOError:
            lkp = None
    return (lkp)

def lkp_tno(cpfcnpj:str)->str:
    lkp={
        'tipo':'',
        'descricao':'',
        'indicadores':'',
        'situacao':'',
        'sexo':'',
        'eh_servidor':'',
        'eh_baixa_renda':'',
        'recebeu_ob':'',
        'investigado_em_pad_sindicancia':'',
        'candidato_eleito':'',
        'possui_sancao':'',
        'eh_doador_de_campanha':'',
        'funcionarios_na_rais':'',
        'cadastro_em_programas_sociais':'',
        'falecido':''
    }
    cpfcnpj = so_digitos(cpfcnpj)
    if not pode_ser_cnpj(cpfcnpj) and not pode_ser_cpf(cpfcnpj):
        return (None)

    if not dbaux.conectado:
        return (None)  # não dá para testar, assume verdadeiro
    else:
        sql = """select concat(tipo,',', situacao, ',',sexo, ',',eh_servidor, ',',eh_baixa_renda, ',',recebeu_OB, 
                ',',investigado_em_PAD_sindicancia, ',',candidato_eleito, ',',possui_sancao, ',',eh_doador_de_campanha, 
                ',',funcionarios_na_RAIS, ',',cadastro_em_programas_sociais, ',',falecido) as indicadores from macros_p.dbo.tno where id = '%s'""" % cpfcnpj
        try:
            cur = dbaux.cur.execute(sql).fetchone()
            lkp = cur[0] if cur else None
        except IOError:
            lkp = None
    return (lkp)

def cpf_valido(cpf:str):
    cpf = so_digitos(cpf)
    ok = pode_ser_cpf(cpf)
    if not ok:
        return (False)
    if not dbaux.conectado:
        return(ok) # não dá para testar, assum verdadeiro
    else:
        sql ="select cpf from db_cpf.dbo.cpf where cpf = '%s'" % cpf
        try:
            ok=dbaux.cur.execute(sql).fetchall()
        except IOError:
            ok = False
        if not ok:
            return(False)
    return (ok)

def cnpj_valido(cnpj:str):
    cnpj = so_digitos(cnpj)
    ok = pode_ser_cnpj(cnpj)
    if not dbaux.conectado:
        return(ok) # não dá para testar, assum verdadeiro
    else:
        sql ="select cnpj from db_cnpj.dbo.cnpj where cnpj = '%s'" % cnpj
        try:
            ok=dbaux.cur.execute(sql).fetchall()
        except IOError:
            ok = False
        if not ok:
            return(False)
    return (ok)


    #@staticmethod
def exibir_indicadores_macros(tno=''):
    if tno == '':
        return ''
    ind = u''''''
    tipo, situacao, sexo, eh_servidor, eh_baixa_renda, recebeu_OB, investigado_em_PAD_sindicancia, candidato_eleito, possui_sancao, eh_doador_de_campanha, funcionarios_na_RAIS, cadastro_em_programas_sociais, falecido= tno.split(',')
    if tipo == 'PJ':
        if eh_servidor == '1':
            ind += u'''<strong style="font-size: 20px; color:green; vertical-align: middle" title='Empresa de servidor público estadual ou municipal (Fonte: RAIS)'>&#x25CF;</strong>'''
        elif eh_servidor == '2':
            ind += u'''<strong style="font-size: 20px; color:green; vertical-align: middle" title='Empresa de sócio com cadastro no Siape (Fonte: Siape)'>&#x25A0;</strong>'''
        if eh_baixa_renda == '1':
            ind += u'''<strong style="font-size: 20px; color:silver; vertical-align: middle" title='Sócio com salário base menor que 2 salários mínimos (Fonte: RAIS)'>&#x25CF;</strong>'''
        if recebeu_OB == '1':
            ind += u'''<strong style="font-size: 20px; color:red; vertical-align: middle" title='Recebeu ordem bancária do Siafi (Fonte: Siafi)'>&#x25CF;</strong>'''
        elif recebeu_OB == '2':
            ind += u'''<strong style="font-size: 20px; color:red; vertical-align: middle" title='Recebeu pagamento de Prefeitura, entre 100 maiores (Fonte: Tribunais de Contas Estaduais)'>&#x25A0;</strong>'''
        if funcionarios_na_RAIS == '1':
            ind += u'''<strong style = "font-size: 20px; color:black; vertical-align: middle" title = 'Possui de 1 a 3 funcionários (Fonte: RAIS)' > &#x25CF;</strong>'''
        elif funcionarios_na_RAIS == '2':
            ind += u'''<strong style = "font-size: 20px; color:black; vertical-align: middle" title = 'Não possui funcionários (Fonte: RAIS)' > &#x25A0;</strong>'''
        if possui_sancao == '1':
            ind += u'''<strong style = "font-size: 20px; color:gold; vertical-align: middle" title = 'Cadastro no CEIS/CEPIM/Punidos/CEAF/CNEP' > &#x25CF;</strong>'''
        if eh_doador_de_campanha == '1':
            ind += u'''<strong style = "font-size: 20px; color:purple; vertical-align: middle" title = 'Doador(a) de campanha (Fonte: TSE)' > &#x25CF;</strong>'''
        if cadastro_em_programas_sociais == '1':
            ind += u'''<strong style = "font-size: 20px; color:darkslateblue; vertical-align: middle" title = 'Sócio com cadastro em Programas Sociais' > &#x25CF;</strong>'''
    elif tipo == 'PF':
        if eh_servidor == '1':
            ind += u'''<strong style="font-size: 20px; color:green; vertical-align: middle" title='Servidor(a) público(a) estadual ou municipal (Fonte: RAIS)'>&#x25CF;</strong>'''
        elif eh_servidor == '2':
            ind += u'''<strong style="font-size: 20px; color:green; vertical-align: middle" title='Possui cadastro no Siape (Fonte: Siape)'>&#x25A0;</strong>'''
        if eh_baixa_renda == '1':
            ind += u'''<strong style="font-size: 20px; color:silver; vertical-align: middle" title='Salário base menor que 2 salários mínimos (Fonte: RAIS)'>&#x25CF;</strong>'''
        if recebeu_OB == '1':
            ind += u'''<strong style="font-size: 20px; color:red; vertical-align: middle" title='Recebeu ordem bancária do Siafi (Fonte: Siafi)'>&#x25CF;</strong>'''
        elif recebeu_OB == '2':
            ind += u'''<strong style="font-size: 20px; color:red; vertical-align: middle" title='Recebeu pagamento de Prefeitura, entre 100 maiores (Fonte: Tribunais de Contas Estaduais)'>&#x25A0;</strong>'''
        if investigado_em_PAD_sindicancia == '1':
            ind +=u'''<strong style="font-size: 20px; color:blue; vertical-align: middle" title='Investigado(a) em Sindicância ou Processo Administrativo Disciplinar (fonte: Base da Corregedoria)'>&#x25A0;</strong>'''
        if candidato_eleito == '1':
            ind += u'''<strong style = "font-size: 20px; color:black; vertical-align: middle" title = 'Candidato(a) (fonte: TSE)' > &#x25CF;</strong>'''
        elif candidato_eleito == '2':
            ind += u'''<strong style = "font-size: 20px; color:black; vertical-align: middle" title = 'Eleito(a) (fonte: TSE)' > &#x25A0;</strong>'''
        if possui_sancao == '1':
            ind += u'''<strong style = "font-size: 20px; color:gold; vertical-align: middle" title = 'Cadastro no CEIS/CEPIM/Punidos/CEAF/CNEP' > &#x25CF;</strong>'''
        if eh_doador_de_campanha == '1':
            ind += u'''<strong style = "font-size: 20px; color:purple; vertical-align: middle" title = 'Doador(a) de campanha (Fonte: TSE)' > &#x25CF;</strong>'''
        if cadastro_em_programas_sociais == '1':
            ind += u'''<strong style = "font-size: 20px; color:darkslateblue; vertical-align: middle" title = 'Cadastrado(a) no Bolsa Família, CadUnico ou Defeso Pescador' > &#x25CF;</strong>'''

    return ind

def exibir_indicador_pep(lista_peps=[]):
    if lista_peps == []:
        ind = ''
    else:
        lista = ';'.join(lista_peps)
        ind = u'''<strong style = "font-size: 20px; color:darkslateblue; vertical-align: middle" title = 'PEP: %s' > &#x2691;</strong>''' % lista
    return (ind)

def exibir_indicador_rif(lista_rinfs=[]):
    if lista_rinfs == []:
        ind = ''
    else:
        lista = ';'.join(lista_rinfs)
        ind = u'''<strong style = "font-size: 20px; color:red; vertical-align: middle" title = 'RIF: %s' > &#x2691;</strong>''' % lista
    return (ind)

def consultaCGUDATA(nome='', tab=''):
    if not dbaux.conectado:
        return (None)  # não dá para consultar

    origens={}
    origens['tcepe_m'] = {'tabela':'db_TCE_PE.dbo.SCA_Despesas','campo_nome':'NOME_FORNECEDOR','campo_cpfcnpj':'CPF_CNPJ'}
    origens['tcepe_e'] ={'tabela':'db_TCE_PE.dbo.SCA_DespesasEstaduais','campo_nome':'NOME_FORNECEDOR','campo_cpfcnpj':'CPF_CNPJ'}
    origens['tcepi'] = {'tabela':'db_TCE_PI.dbo.sagres_2014_2018', 'campo_nome': 'Credor','campo_cpfcnpj': 'CredorDocumento'}

    if not (tab in origens):
        return(None)

    lkp = {'cpfcnpj':'','nome':''}
    termo= chr(37)+nome+chr(37)

    sql = "select " + origens[tab]['campo_cpfcnpj'] + " as cpfcnpj," + origens[tab]['campo_nome'] + " as nome "
    sql += " from " + origens[tab]['tabela'] + " where " + origens[tab]['campo_nome'] +" like '"+'%s'+"'"
    sql += " AND left("+origens[tab]['campo_cpfcnpj']+",3) <> '***' group by "
    sql += origens[tab]['campo_cpfcnpj']+ ", "+ origens[tab]['campo_nome']
    sql = sql % termo
    try:
        cur = dbaux.cur.execute(sql).fetchall()
        lista=[]
        for r in cur:
            lkp = {'cpfcnpj': '', 'nome': ''}
            lkp['cpfcnpj'] = so_digitos(r[0])
            lkp['nome'] = r[1]
            lista.append(lkp)
    except IOError:
        lkp=None
        lista=None
    return (lista)

"""
SELECT NOME, CPF, RG, UFRG, ORIGEM FROM
(SELECT [nm_condutor] AS NOME, [nr_cpf] AS CPF, [nr_documento] AS RG, [sg_uf_documento] AS UFRG, 'RENACH' AS ORIGEM 
FROM [db_renach].[dbo].[renach] AS RENACH
UNION ALL
--SELECT [T_Nome_Titular_Benef] AS NOME, [T_CPF] AS CPF, [T_Identidade] AS RG, [T_Identidade_UF] AS UFRG, 'MACICA' AS ORIGEM
--FROM [db_MACICA].[dbo].[vw_m201601_a_201809]
--UNION ALL
SELECT [NOME_TITULAR_1] AS NOME, [CPF_TITULAR_1] AS CPF, [NUMERO_RG_TITULAR_1] AS RG, [UF_ORGAO_EMISSOR_RG_TITULAR_1] AS UFRG, 'DAP' AS ORIGEM
FROM [db_dap].[dbo].[DAP_2013_2017]
UNION ALL
SELECT [NOJovem] AS NOME, [NRCPF] AS CPF, [NRRG] AS RG, [SGOrgaoEmissor] AS UFRG, 'PROJOVEM' AS ORIGEM
FROM [db_projovem].[dbo].[TBJovem]
UNION ALL
SELECT [pessoa_nome] AS NOME, [pessoa_cpf] AS CPF, [pessoa_rg] AS RG, [pessoa_rg_emissor] AS UFRG, 'RGP' AS ORIGEM
FROM [db_rgp].[dbo].[RGP]
UNION ALL 
SELECT [NO_BOLSISTA] COLLATE SQL_Latin1_General_CP1_CI_AI AS NOME , [NU_CPF] COLLATE SQL_Latin1_General_CP1_CI_AI AS CPF, [NU_DOC_IDENTIDADE] COLLATE SQL_Latin1_General_CP1_CI_AI AS RG, [CO_ESTADO_EXPEDIDOR] COLLATE SQL_Latin1_General_CP1_CI_AI AS UFRG, 'PROUNI' AS ORIGEM 
FROM [db_prouni].[dbo].[TB_PROUNI_BOLSISTA]
UNION ALL
SELECT [Pss_nome] AS NOME, [Pss_CPF] AS CPF, [Pss_numero_documento] AS RG, [Pss_uf_orgao_emissor] AS UFRG, 'SIPRA' AS ORIGEM 
FROM [db_sipra].[dbo].[Pessoa]) AS TABELAUNIFICADA
"""
