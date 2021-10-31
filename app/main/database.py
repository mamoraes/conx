import sqlalchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from config import Config

engine = create_engine(Config.SQLALCHEMY_DATABASE_URI, convert_unicode=True)
# print(Config.SQLALCHEMY_DATABASE_URI)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()


def init_db():
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()
    # from app.models import User

    Base.metadata.create_all(bind=engine)

def eh_conexao_ativa(cnx_str: str) -> bool:
    conexao_usuario = sqlalchemy.create_engine(cnx_str) # , execution_options=gEngineExecutionOptions
    try:
        conexao_usuario.execute('select 1')
        return (True)
    except:
        return (False)

