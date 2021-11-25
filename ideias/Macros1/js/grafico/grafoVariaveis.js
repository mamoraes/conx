//------------------------ Define algumas funções básicas do gráfico (incluir nó, incluir link, renderizar, etc..)-------------->

//-----------------------------------------------------PARÂMETROS DE CONFIGURAÇÃO ----------------------------
const TerceiraCamadaPadrao = true;			//--se true, exibe terceira camada por padrão
const MudaCorDeRelacionamentos = true;      //se true, sobreescreve cores dos relacionamentos
const passosIniciais = 50   			//número de passos iniciais antes de exibir a figura
const gravidade = -4.2;						//força de repulsão
const comprimento = 25; //30						//comprimento "ótimo" da ligação
var tamanhoNo = 15; 						//----------Tamanho do nó
var tamanhoSeta = 8; //4; //7; 						//----------Tamanho da meia seta (altura: tamanhoSeta e compimento: tamanhoSeta*2)
const kTamanhoFonte = 4;
var kgrandeQuantidadeDeNos = 2000;
//------------------------------------------------------Cores utilizadas
 //algumas funções as cores são definidas na função retornaCorFonteNaCamada
const corCamadaZero = "red"; //"#FF6600";
const corPrimeiraCamada = "black"; //"#66CC33";
const corSegundaCamada = "DodgerBlue"; //"DimGray"; //"MidnightBlue";//"darkblue"; //"#333333";
const corTerceiraCamada = "green"; //"DodgerBlue"; //"blue"; //"#00CCCC";
const corCamadaAdicional = "#FFFF00"; //Yellow //"#8FBC8F";  //DarkSeaGreen
const corFonteCamadaAdicional = "SaddleBrown";// "Teal";

const corPadrao = "#000000";
const corSelecao = "Gray";
const corLinkSelecao = "Red"; //"Aqua";

const kcamadaAdicional = 99;
//-----------------------------------------------------FIM - PARÂMETROS DE CONFIGURAÇÃO-------------------------
//define lista para armazenar nós e ligações recebidas da Macro
//var listaNoInicial = [];
//var listaLigacaoInicial = [];
//define lista para armazenar nós e ligações recebidas com o xrhget
//listaNoAdicional = []; alterado para parametro da funcao var 
//var listaLigacaoAdicional = [];	alterado para parametro da funcao 
//-----------------------------------------------------------------
//                              Caminhos para as imagens


var caminhoImagem = "/macros/static/images/"; //pasta, deve ser adicionado ao nome dos arquivos de imagem abaixo:

//caminhoImagem = "/macros/static/images/"; //pasta, deve ser adicionado ao nome dos arquivos de imagem abaixo:
const caminhoImagemPF = "icone-grafo-desconhecido.png";
var gAleatorio = "?k=" + Math.random();

//---------------------------------------------------------------------------------------------------------------
//                             Variáveis que armazenam o estado corrente


//---------------------------------------------------------------------------------------------------------------
/*
var relacionamentosExcluidos = 
{
	"ex_socio":[],
	"ex_empregado":[],
	"empregado":[],
	"dependente_siape":[],
	"telefone":[],
	"endereco":[],
	"contador":[],
	"filial":[],
};

var nosExcluidos = 
{
	"filial":[],
};
*/
//---------------------------------------------------------------------------------------------------------------

var dadosNos = {
		"tipo": "PF", 
		"sexo": 0,
		"label": "",
		"tamanhoFonte": kTamanhoFonte,
		"corFonte": corPadrao,
		"camada" : "9",
		"avatar" : "",
		//"avatarSelecionado" : "",
		"situacao" : 1, // 1 = ativo, 2 = suspenso, 3 = baixado
		"origem": false,
		"m1" : 0,
		"m2" : 0,
		"m3" : 0,
		"m4" : 0,
		"m5" : 0,
		"m6" : 0,
		"m7" : 0,
		"m8" : 0,
		"m9" : 0,
		"m10" : 0,
		"m11" : 0,
		"ref" : null
};

/* Definição dos Dados para Links
*/	
var dadosLink = {
	"tipo":"tipoRelacionamento",
	"label": "label",
	"cor": "gray",
	"selecionado": false,
	"sentidoUnico": true,
	"ref" :  null,
	"linkId": "101",
	"tipoDescricao":{}
};

var graph = Viva.Graph.graph();
//var layout = Viva.Graph.Layout.forceDirected(graph);
var layout = null, renderer = null;
var gtemp;
var gNomeNoProcurado="";          	// variável global utilizada na busca de nomes
var gIdNoProcurado="";          	// variável global utilizada na busca de ids
var gUltimoNoModificado=null;
var gUltimoNodeId=null;
var gSVGtemp;
var gRightClickNo=null;  //sempre que o botão direito é pressionado em cima do nó, o nó é armazenado nesta variável global
var gNoArmazenado=null;  //sempre que a opção armazenar nó é selecionada, o Nó corrente é armazenado nela.
var gIdNosSelecionados=[]; //Vetor que armazenará os ids dos Nós selecionados
/* parece que esse gOcultar3Camada e gOcultarCamada não estão sendo utilizados */
var gOcultar3Camada = true;
var gOcultarCamada = {
	"ocultar" : true,
	"camada" : "3"
	}
var g3camada = false;
var situacaoCPF = {
	0:"Regular",
	1:"Cancelada por Encerramento de Espólio",
	2:"Suspensa",
	3:"Cancelada por Óbito sem Espolio",
	4:"Pendente de Regularização",
	5:"Cancelada por Multiplicidade",
	8:"Nula",
	9:"Cancelada de Ofício"
};		
var situacaoCNPJ = {
	0:'Baixada',
	1:'Nula',
	2:'Ativa',
	3:'Suspensa',
	4:'Inapta',
	8:'Baixada'
};
var gTemporizadorLayout = 0;
//var gContadorIncluido = false; --- definido em javascriptContador.html
var gHistoricoIdNosInseridos = []; //lista de nós inseridos, para posterior remoção. Cada grupo fica num subarray. ex = [ [no1,no2], [no3,no4,no5] ]
var gHistoricoUltimosLinksInseridos = []; //lista do último grupo de link inseridos
//var dadosNosTemp=dadosNos;
//var dadosLinkTemp=dadosLink;

var tempLink, gtempNo;
var tempSVGList={};
var graphics = Viva.Graph.View.svgGraphics();
//var defs = graphics.getSvgRoot().append('defs');
var defs = null;
var nodeSize = tamanhoNo;

//converter para string (no javascript não faz diferença, mas no python faz)
// listaTipos é definido em grafoRelacionamentos.html, pelo django
var listaTiposOld =  { //atualizado em 2015-01-30
	  100:"filial"
	, 101:"responsável"
	, 102:"contador"
	, 103:"sócio"
	, 104:"representante"
	, 105:"procurador"
	, 106:"ex-sócio"
	, 127:"empregado"
	, 128:"ex-empregado"
	, 150:"telefone"
	, 151:"endereço"
	, 155:"conta_corrente"
	, 160:"dependente_SIAPE"
	, 161:"possivel_pai_SIAPE"
	, 162:"possivel_mae_CPF"
	, 165:"dependente_BF"
	, 166:"responsavel_legal"
	, 200:"vinculo_macros"
	, 250:"informação relevante"
	, 300:"responsável técnico"
	, 301:"ex-responsável técnico"
	, 302:"fiscal terceirizado da CEF"
	, 304:"pai"
	, 305:"mãe"
	, 306:"irmão"
	, 401:"SIAPE_AVOS"
	, 402:"SIAPE_BISAVOS"
	, 403:"SIAPE_BISNETO(A)"
	, 404:"SIAPE_COMPANHEIRO(A)"
	, 405:"SIAPE_CONJUGE"
	, 406:"SIAPE_ENTEADO(A)"
	, 407:"SIAPE_EX-ESPOSO"
	, 408:"SIAPE_FILHO(A)"
	, 409:"SIAPE_IRMA(O)"
	, 410:"SIAPE_NETO(A)"
	, 411:"SIAPE_PAIS"
	, 412:"SIAPE_EST_EM_LEI"
	, 421:"doadores"
	, 999:"INDEFINIDO"
	//vinculos sociais atualizado em 4/4/2016
	, 1:'filho'
	, 2:'pai'
	, 3:'laranja'
	, 4:'real proprietário'
	, 5:'operador'
	, 6:'amante'
	, 7:'representante legal'
	, 8:'representada'
	, 9:'representada por'
	, 10:'preposto'
	, 11:'amiga'
	, 12:'amigo'
	, 13:'empregadora'
	, 14:'empregado'
	, 15:'mãe'
	, 16:'filha'
	, 17:'marido'
	, 18:'esposa'
	, 19:'irmã'
	, 20:'procuradora'
	, 21:'sob a responsabilidade técnica'
	, 22:'responsável técnico'
	, 23:'procurador'
	, 24:'irmão'
	, 25:'mesmo endereço'
	, 26:'mesmo telefone'
	, 28:'Secretário Municipal'
	, 29:'cliente (contador)'
	, 30:'contador'
	, 31:'indicado para assunção de carg'
	, 32:'aliado político'
	, 33:'tem como testemunha na constit'
	, 34:'testemunha na constituição'
	, 35:'empregado(a)'
	, 36:'empregador(a)'
	, 37:'irmãos'
	, 38:'advogado'
	, 39:'advogado(a)'
	, 40:'cliente - advogado(a)'
	, 41:'assessor'
	, 42:'Diretor'
	, 43:'Supervisor'
	, 44:'primo'
	, 45:'prima'
	, 46:'tio'
	, 47:'sobrinho'
	, 48:'comparsa'
	, 49:'fornecedor'
	, 50:'segurança'
	, 51:'motorista'
	, 52:'receptadora de $'
	, 53:'repassadora de $'
	, 54:'companheiro'
	, 55:'companheira'
	, 56:'compradora de jóias'
	, 57:'vendedora de jóias'
	, 58:'vendedora de imóvel'
	, 59:'compradora de imóvel'
	, 60:'outorgante'
	, 61:'outorgado'
	, 62:'cunhado'
	, 63:'cunhada'
	, 64:'ex-marido'
	, 65:'ex-esposa'
	, 66:'tem como sócio'
	, 67:'Sócio-administrador'
	, 68:'a'
	, 69:'a pessoa de confiança'
	, 70:'.'
	, 71:'dá ordens em'
	, 72:'o homem de confiança'
	, 73:'uma espécie de faz tudo'
	, 74:'braço direito'
	, 75:'Sediada no mesmo endereço'
	, 76: "assessorado"
	, 77: "arrolou como testemunha"
	, 78: "testemunha de defesa"
	, 79: "consulente"
	, 80: "consultor"
	, 81: "maridoes"
	, 82: "constituída (aditivo) com o te"
	, 83: "Sócia oculta"
	, 84: "tem como sócia oculta"
	, 85: "Sediada no mesmo endereços"
	, 86: "proprietária do prédio"
	, 87: "Sediada no prédio de proprieda"
	, 88: "Sediada no prédio de proprieda"
	, 89: "Sediada no prédio de proprieda"
	, 90: "Sediada no prédio de proprieda"
	, 91: "procuradorrrep"
	, 92: "procuradorrep"
	, 93: "paif"
	, 94: "cônjuge"
	, 500:"TC"
	, 550:"Siconv"
	, 526:"TCESP"
	, 509:"TCMGO"
	, 513:"TCMMT"
	, 506:"TCMCE"
	, 520:"TCERN"
	, 505:"TCMBA"
	, 516:"TCEPE"
	, 523:"TCERS"
	, 502:"TCEAL"	
	, 525:"TCESE"	
	, 527:"TCETO"	
};

// questão de compatibilidade. a partir da versão 13/4/2016 a lista de tipos é passado pelo template do django em grafoRelacionamentos.html.
// mas isso pode dar erro quando se tenta abrir uma rede de lista antiga.
try {
	if (listaTipos) { listaTipos = null;};
} catch(e) {
	
	listaTipos = listaTiposOld;
}

listaUF = {
	1:"AC",
	2:"AL",
	3:"AM",
	4:"AP",
	5:"BA",
	6:"CE",
	7:"DF",
	8:"ES",
	9:"GO",
	10:"MA",
	11:"MG",
	12:"MS",
	13:"MT",
	14:"PA",
	15:"PB",
	16:"PE",
	17:"PI",
	18:"PR",
	19:"RJ",
	20:"RN",
	21:"RO",
	22:"RR",
	23:"RS",
	24:"SC",
	25:"SE",
	26:"SP",
	27:"TO"
};
