import pyodbc

AMBIENTE = True
AMBIENTE_DESENVOLVIMENTO = True

CONECTADO_SQLS = True  # True apenas se estiver em ambiente com possibilidade de conexao com SQLServer;
usuario = 'marciomo*'

sqls_usuario = 'sistemaMACROS' if usuario != 'marciomo' else usuario
sqls_senha = 'macrospwd'
sqls_trusted = 'no' if sqls_usuario == 'sistemaMACROS' else 'yes'

sqls = {
    'backend': 'sqlserver',
    'hostname': '10.125.4.54' if AMBIENTE == AMBIENTE_DESENVOLVIMENTO else '10.125.4.17',
    'port': '1433',
    'trusted': sqls_trusted,
    'usuario': sqls_usuario,
    'senha': sqls_senha,
    'usepool': False,
    'tds_version': 8.0,
    'connections': 2 if AMBIENTE == AMBIENTE_DESENVOLVIMENTO else 20,
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
