# coding: utf-8
from sqlalchemy import BigInteger, Column, Integer, String, text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
metadata = Base.metadata


class Caso(Base):
    __tablename__ = 'caso'

    id = Column(Integer, primary_key=True, unique=True)
    nome = Column(String(255))
    descricao = Column(String(16777216))


class CasoRinf(Base):
    __tablename__ = 'caso_rinf'

    rinf_id = Column(BigInteger, primary_key=True, nullable=False, server_default=text("0"))
    caso_id = Column(BigInteger, primary_key=True, nullable=False, server_default=text("0"))


class Entidade(Base):
    __tablename__ = 'entidade'

    nome = Column(String(255))
    obs = Column(String(16777216))
    cpfcnpj = Column(String(15), nullable=False)
    id = Column(Integer, primary_key=True)


class EntidadeCaso(Base):
    __tablename__ = 'entidade_caso'

    caso_id = Column(BigInteger, primary_key=True, nullable=False, server_default=text("0"))
    obs = Column(String(16777216))
    origem = Column(String(255))
    entidade_id = Column(BigInteger, primary_key=True, nullable=False, server_default=text("0"))
    fonte_id = Column(BigInteger, server_default=text("0"))


class EntidadeRinf(Base):
    __tablename__ = 'entidade_rinf'

    rinf_id = Column(BigInteger, primary_key=True, nullable=False, server_default=text("0"))
    rinf_indexador = Column(Integer, primary_key=True, nullable=False, server_default=text("0"))
    infoadicional = Column(String(16777216))
    entidade_id = Column(BigInteger, primary_key=True, nullable=False, server_default=text("0"))


class Fonte(Base):
    __tablename__ = 'fonte'

    id = Column(Integer, primary_key=True)
    nome = Column(String(255))
    descricao = Column(String(16777216))


class Rinf(Base):
    __tablename__ = 'rinf'

    id = Column(Integer, primary_key=True)
    numero = Column(String(255))
    obs_justificativa = Column(String(255))
    nup_justificativa = Column(String(50))


class TipoVinculo(Base):
    __tablename__ = 'tipo_vinculo'

    id = Column(Integer, primary_key=True)
    descricao = Column(String(50))


class Vinculo(Base):
    __tablename__ = 'vinculo'

    descricao = Column(String(50))
    dest_id = Column(BigInteger, primary_key=True, nullable=False, server_default=text("0"))
    tipo_id = Column(BigInteger, primary_key=True, nullable=False, server_default=text("0"))
    orig_id = Column(BigInteger, primary_key=True, nullable=False, server_default=text("0"))
