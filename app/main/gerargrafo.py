
class Nodo:
    def __init__(self, id, label, tipo="ENT", tooltip="", fonte="RIF"):
        self.id = id
        self.tipo = tipo
        self.label = label
        self.cor = "Silver"
        self.sexo = 0
        self.m1 = 0
        self.m2 = 0
        self.situacao = ""
        self.dataOperacao = ""
        self.texto_tooltip = tooltip
        self.fonte = fonte
        self.camada = 0 if self.fonte == "RIF" else 1

    def todict(self):
        return {
            "id": self.id,
            "tipo": self.tipo,
            "sexo": self.sexo,
            "label": self.label,
            "camada": self.camada,
            "situacao": self.situacao,
            "cor": self.cor,
            "texto_tooltip": self.texto_tooltip,
            "m1": self.m1,
            "m2": self.m2,
            "m3": 0,
            "m4": 0,
            "m5": 0,
            "m6": 0,
            "m7": 0,
            "m8": 0,
            "m9": 0,
            "m10": 0,
            "m11": 0,
            "dataoperacao": self.dataOperacao,
        }


class NoPF(Nodo):
    def __init__(self, id, label="", cor="Silver", sexo=0, fonte="RIF"):
        Nodo.__init__(self, id, label, "PF")
        self.sexo = sexo

    def todict(self):
        return Nodo.todict(self)


class NoPJ(Nodo):
    def __init__(self, id, label="", cor="Silver", fonte="RIF"):
        Nodo.__init__(self, id, label, "PJ")
        self.cor = cor
        self.sexo = 1


class NoConta(Nodo):
    def __init__(self, id, label="CONTA", cor="Green"):
        Nodo.__init__(self, id, label, "CCR")
        self.cor = cor


class NoGrupo(Nodo):
    def __init__(self, id, label="GRUPO", cor="Blue"):
        Nodo.__init__(self, id, label, "GR")
        self.cor = cor
        self.fonte = "grupos"


class NoComunicacao(Nodo):
    def __init__(self, id, label="COMUNICACAO", cor="Red", dataOperacao=None):
        Nodo.__init__(self, id, label, "COM")
        self.cor = cor

    # self.dataOperacao=dataOperacao

class NoCaso(Nodo):
    def __init__(self, id, label="Caso", cor="purple"):
        Nodo.__init__(self, id, label, "CS")
        self.cor = cor
        self.fonte = "Casos"

class NoRinf(Nodo):
    def __init__(self, id, label="Rinf", cor="ciano"):
        Nodo.__init__(self, id, label, "RI")
        self.cor = cor
        self.fonte = "Rinfs"



class Aresta:
    def __init__(self, origem, destino, descricao="", cor="Silver", fonte="RIF"):
        self.origem = origem
        self.destino = destino
        self.descricao = descricao
        self.cor = cor
        self.fonte = fonte
        self.camada = 0 if self.fonte == "RIF" else 1

    def todict(self):
        return {
            "origem": self.origem,
            "destino": self.destino,
            "cor": self.cor,
            "camada": self.camada,
            "tipoDescricao": {"0": self.descricao},
        }

