import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

AMBIENTE_DESENVOLVIMENTO=1
AMBIENTE_PRODUCAO=2


if os.path.exists(basedir + '/ambiente_producao'):
    AMBIENTE = AMBIENTE_PRODUCAO
elif os.path.exists(basedir + '/ambiente_desenvolvimento'):
    AMBIENTE = AMBIENTE_DESENVOLVIMENTO
else:
    raise Exception('Nao foi encontrado o arquivo de configuracao do ambiente.')




AMBIENTE_CONECTADO_MACROS = True if os.path.exists(basedir + '/ambiente_conectado_macros') else False
AMBIENTE_CONECTADO_CGUDATA = True if os.path.exists(basedir + '/ambiente_conectado_cgudata') else False
AMBIENTE_DESCONECTADO = not (AMBIENTE_CONECTADO_CGUDATA and AMBIENTE_CONECTADO_MACROS)


class Config(object):
    def nome_app(APP_NAME = 'conx'):
        if APP_NAME:
            nome_app = APP_NAME
        else:
            nome_app = 'app'
        return nome_app

    def cria_pasta(pasta = basedir):
        if not os.path.isdir(pasta):
            try:
                os.makedirs(pasta)
            except OSError:  #utiliza a pasta existente
                pasta = basedir
        return(pasta)

    SECRET_KEY = os.environ.get('SECRET_KEY') or 'coelho_ricochete'

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, nome_app()+'.db')

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 25)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') is not None
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    ADMINS = ['your-email@example.com']
    LANGUAGES = ['en', 'es', 'pt']
    MS_TRANSLATOR_KEY = os.environ.get('MS_TRANSLATOR_KEY')
    POSTS_PER_PAGE = 25
    UPLOAD_PASTA = cria_pasta(os.path.join(basedir,'_UPLOADS'))
    EXTENSOES_PERMITIDAS = ['csv','doc','docx','eml','epub','gif','jpg','jpeg','json','htm','html','mp3','msg',
                            'odt','ogg','pdf','png','pptx','ps','rtf','tiff','tif','txt','wav','xls','xlsx']
    EMOJIS = {'conexoes': '&#x1F4A2;', 'trilhas':'&#x1F4DD;', 'incluir':'', 'excluir':'','alterar':'', 'checkin':'','checkout':''}



