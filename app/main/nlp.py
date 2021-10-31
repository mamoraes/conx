
import spacy
from spacy.matcher import Matcher
from spacy.tokens import Span
from spacy import displacy
import os
import pt_core_news_sm
#import pyPdf
#import PyPDF2
import textract
import chardet


nlpp = pt_core_news_sm.load()

def callback_method(matcher, doc, i, matches):
    match_id, start, end = matches[i]
    entity = doc[start:end]
    print(entity.text)

def on_match(matcher, doc, id, matches):
    print('Matched!', matches)
def add_event_ent(matcher, doc, i, matches):
    # Get the current match and create tuple of entity label, start and end.
    # Append entity to the doc's entity. (Don't overwrite doc.ents!)
#    match_id, start, end = matches[i]
#    entity = Span(doc, start, end, label="EVENT")
#    doc.ents += (entity,)
    pass
#matcher.add("CPFCNPJ", [[{"TEXT": {"REGEX": "0-9}\.\0-9{3}\.\0-9{3}\-\0-9{2}|0-9{2}\.\0-9{3}\.\0-9{3}\/\0-9{4}\-\0-9{2}$"}}]], on_match=on_match)
#matcher.add("CPF", [[{"SHAPE": "ddd"}, {"ORTH": "."}, {"SHAPE": "ddd"}, {"ORTH": "."}, {"SHAPE": "ddd"},{"ORTH": "-"}, {"SHAPE": "dd"}]], on_match=on_match)
def displacy_service(text):
    doc = nlp(text)
    return displacy.parse_deps(doc)
def get_texto(nome_arquivo):
    texto = ''
    extensao = os.path.splitext(nome_arquivo)[1].lower()
    if extensao == '.txt' or extensao == '.csv':
        try:
            with open(nome_arquivo,'rb') as arq:
                docbytes = arq.read()
                #docbytes = textract.process(nome_arquivo)
                encod = chardet.detect(docbytes)["encoding"]
                arq.close()
            if encod == None:
                encod = 'utf-8'
            texto = docbytes.decode(encod)
            leu = True
        except:
            leu = False

        if not leu:
            for encod in ['utf-8', 'latin_1', 'cp1252','ascii']:
                try:
                    texto = textract.process(nome_arquivo).decode(encod)
                    leu = True
                except:
                    leu = False
                if leu:
                    break
    else:
        texto = textract.process(nome_arquivo).decode('utf-8')
    return texto

def scan(nome_arquivo):
    if not os.path.exists(nome_arquivo):
        return [],'DOCUMENTO NÃO LOCALIZADO'

    documento = get_texto(nome_arquivo)

    '''elif extensao == '.pdf' or extensao == '.xls' or extensao == '.xlsx' or extensao == '.doc' or extensao == '.pdf':
            documento = textract.process(nome_arquivo).decode('utf-8')
        elif extensao == '.pdf2':
            pdfFileObject = open(nome_arquivo, "rb")
            pdfReader = PyPDF2.PdfFileReader(pdfFileObject)
            numpags = pdfReader.numPages
            for i in range(numpags):
                texto = pdfReader.pages[i].extractText()
                print(texto)
                documento += "\n\n"+texto'''

    #documento = get_texto(nome_arquivo)
    if documento == '':
        return [],'NENHUM TEXTO IDENTIFICADO'
    doc = nlpp(documento)
    matcher = Matcher(nlpp.vocab, validate=True)
    pattern = [{"TEXT": {"REGEX": r"^\d{3}[.]?\d{3}[.]?"}}, {"TEXT": {"REGEX": r"^\d{3}-\d{2}$"}}]
    matcher.add('CPF', add_event_ent, pattern)
    pattern = [{"TEXT": {"REGEX": r"^\d{11}$"}}]
    matcher.add('CPF', add_event_ent, pattern)
    pattern = [{"TEXT": {"REGEX": r"^\d{2}[.]?\d{3}[.]?\d{3}[.]?"}}, {"TEXT": {"REGEX": r"^\d{4}-\d{2}$"}}]
    matcher.add('CNPJ', add_event_ent, pattern)
    pattern = [{"TEXT": {"REGEX": r"^\d{14}$"}}]
    matcher.add('CNPJ', add_event_ent, pattern)
    pattern = [{"TEXT": {"REGEX": "[a-zA-Z0-9-_.]+@[a-zA-Z0-9-_.]+"}}]
    matcher.add('EMAIL', add_event_ent, pattern)
    matches = matcher(doc)
    achados=[]
    for match_id, start, end in matches:
        span = doc[start:end]
        tipo = 'CPF/CNPJ' if nlpp.vocab.strings[match_id] == None else nlpp.vocab.strings[match_id]
        anterior = 0 if (start < 3) else start -3
        posterior = len(doc) if end > (len(doc)-4) else end + 3
        achado = {'ente': span.text, 'tipo': tipo, 'contexto': doc[anterior:posterior]}
        achados.append(achado)
    for ente in doc.ents:
        if ente.label_ in ['PER','MISC','ORG']:
            max = len(documento)
            ini = 0 if ente.start_char < 30 else ente.start_char - 30
            fim = max if ente.end_char > max - 30 else ente.end_char + 30
            achado={'ente':ente.text, 'tipo':ente.label_, 'contexto':documento[ini:fim]}
            achados.append(achado)
    marcas = displacy.render(doc, style="ent", page=False)
    return(achados,marcas)

