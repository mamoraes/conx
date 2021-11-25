//------------------------ Define algumas funções básicas do gráfico (incluir nó, incluir link, renderizar, etc..)-------------->
//listaNoInicial, listaLigacaoInicial 	--> listas que armazenam os nós  e ligações que estão no gráfico
//									  	--> atualizá-los sempre que um nó/ligação for adicionado e/ou removido.
	
function existeIdNo(noId)	{
	if (graph.getNode(noId)) {
		return true;
	} else {
		return false;
	}
}

//------------------------------------------------------------------------------------------------------------------------------		
//Adiciona um nó
// Parâmetros: 
//		Nome do nós: nomeNo
// 		Dados: Json
//		inicio: true ou false  --> para não atrasar a geração do gráfico, no início, a checagem dos nós não é realizada
function adicionaNo(nomeNo, dados, inicio) {
	if ( inicio == true) {
		//graph.addNode(nomeNo, dados);
		return graph.addNode(nomeNo, JSON.parse(JSON.stringify(dados))); //sem essa copia, esta replicando dados do primeiro item
	} else {
		//verificar se o nó já existe no vetor de nós
		//se já existir, não faço nada
		var encontrado = existeIdNo(nomeNo);
		//caso contrário, insiro o nó
		if (encontrado == false) {
			//graph.addNode(nomeNo, dados);
			return graph.addNode(nomeNo, JSON.parse(JSON.stringify(dados))); //sem essa copia, esta replicando dados do primeiro item
			//inserir Nó na lista de Nós
		} else { //apesar de existir, talvez haja notas e cores que podem ser atualizadas
			var noaux = graph.getNode(nomeNo);
			noaux.data.nota = comparaJuntaTexto(noaux.data.nota, dados.nota);
			noaux.data.texto_tooltip = comparaJuntaTexto(noaux.data.texto_tooltip, dados.texto_tooltip);			
			if (!noaux.data.cor) {
				noaux.data.cor = dados.cor;
				ajustaCorDeFundoDaImagem(noaux, false);
			}
		}
	}
}

function contadorLink() { //inclui id único para cada link
	//dados.id = noOrigem + '_' + noDestino; 
	if (!contadorLink.contador) {
		contadorLink.contador = 1;
	} else {
		contadorLink.contador++;
	}
	//dados.id = "idlink_" + Math.random().toString(16).slice(2) //esse id é usado para identificar um label, opção para não usar texto de endereço
	return "idlink_" + contadorLink.contador; //esse id é usado para identificar um label, opção para não usar texto de endereço
}

//Adiciona um link entre os Nós
//Parâmetros:
//	Nome do Nó de origem: noOrigem
//	Nome do Nó de destino: noDestino
//  Dados adicionais: dados
// Retorna o link que foi criado
function adicionaLink(noOrigem, noDestino, dados, inicio) {
	//verificar se origem e destino são os mesmos
	//caso sejam, não faz sentido incluir ligação
	if (noOrigem == noDestino) { 
		return;
	}
	dados.id = contadorLink(); //inclui contador no campo texto
	inicio = false;
	if (inicio == true)	{
		if (MudaCorDeRelacionamentos == true) {
			//dados.cor = retornaCorDoRelacionamento(dados.linkId);
			dados.cor = retornaCorDoRelacionamento(dados.tipoDescricao);
		} else {
			dados.cor = dados.cor;
		}
		//dados.label = retornaLabel(dados.linkId, dados.label);
		return graph.addLink(noOrigem, noDestino, JSON.parse(JSON.stringify(dados)));
	};
	//verificar se o link já existe no vetor de ligações
	//se já existir
	var encontrado=false;
	var cont=0;
	var invertido=false;
	var linkAux = graph.hasLink(noOrigem,noDestino);
	if (!linkAux) {
		linkAux = graph.hasLink(noDestino,noOrigem);
		invertido = true;
	}
	if (linkAux) {
		encontrado = true;
		var labelMudou = false;
		//verificar se possuem mesmo id e descricação
		var tiposDescricao = linkAux.data.tipoDescricao;
		var tiposNovos = dados.tipoDescricao;
		for (var k=0, listaIDs=Object.keys(tiposNovos); k< listaIDs.length; k++) {
			if (tiposNovos[listaIDs[k]] != tiposDescricao[listaIDs[k]]) {
				tiposDescricao[listaIDs[k]] = tiposNovos[listaIDs[k]];
				labelMudou = true;
			}
		}
		//if (listaIDsAIncluir.length==0) { //nada a fazer, todos os tipos já estavam na ligação
		if (!labelMudou) { //nada a fazer, todos os tipos já estavam na ligação
			return;
		}
		var dadosLinkTemp = dadosLink;		
		dadosLinkTemp.camada = linkAux.data.camada;
		dadosLinkTemp.sentidoUnico = linkAux.data.sentidoUnico;
		dadosLinkTemp.id = dados.id;
		dadosLinkTemp.camada = dados.camada;
		dadosLinkTemp.tipoDescricao = JSON.parse(JSON.stringify(linkAux.data.tipoDescricao));
		for (var k=0, listaIds=Object.keys(dados.tipoDescricao); k<listaIds.length; k++) {
			dadosLinkTemp.tipoDescricao[listaIds[k]] = dados.tipoDescricao[listaIds[k]];		
		}
		if (!invertido) { //o link anterior vai ter prioridade na direção.	
			removeLigacao(noOrigem,noDestino);		
			return graph.addLink(noOrigem, noDestino, JSON.parse(JSON.stringify(dadosLinkTemp)));	
		} else {
			removeLigacao(noDestino,noOrigem);
			return graph.addLink(noDestino, noOrigem, JSON.parse(JSON.stringify(dadosLinkTemp)));	
		}
	};

	if(encontrado == false)	{
		//caso contrário, adicionar ligação
		//antes, verificar se o nó origem e destino existem
		if( existeIdNo(noOrigem) && existeIdNo(noDestino))	{
			var dadosLinkTemp = dadosLink;
			dadosLinkTemp.camada = dados.camada;
			dadosLinkTemp.sentidoUnico = dados.sentidoUnico;
			dadosLinkTemp.tipoDescricao = dados.tipoDescricao;
			dadosLinkTemp.id = 	contadorLink();
			//atualizar listaLigacaoInicial
			return graph.addLink(noOrigem, noDestino, JSON.parse(JSON.stringify(dadosLinkTemp)));
		} else	{		
			return;
		}
	}
}
		
function removeLigacao(noOrigem, noDestino)	{
	//atualizar o vetor de Ligação Inicial
	//remover ligacao
	var link = graph.hasLink(noOrigem,noDestino);
	if (link) {
		try { //remove texto do link, se existir
			var linkUIaux = graphics.getLinkUI(link.id);
			var element=document.getElementById('texto_ligacao_'+linkUIaux.attr('id'));
			element.parentNode.removeChild(element);
		} catch (e){;}
		graph.removeLink(link);
		return;
	}	
}
/*
function removeNo(no) {
	//remover o nó da lista de nós

	//remover ligações que partem do nó e que chegam ao nó
	var cont = 0;
	graph.forEachLinkedNode(no.id, function(nodeaux, link){
		var linkUIaux=null;
		try {
			linkUIaux = graphics.getLinkUI(link.id);
			element=document.getElementById('texto_ligacao_'+linkUIaux.attr('id'));
			element.parentNode.removeChild(element);
		} catch (e){; };
	});

	graph.removeNode(no.id)
}
*/

function removeIdNo(noId) { //diferente de removeNo, que remove o item com no.id
	//remover o nó da lista de nós

	//remover ligações que partem do nó e que chegam ao nó
	graph.forEachLinkedNode(noId, function(nodeaux, link){
		var linkUIaux=null;
		try {
			linkUIaux = graphics.getLinkUI(link.id);
			element=document.getElementById('texto_ligacao_'+linkUIaux.attr('id'));
			element.parentNode.removeChild(element);
		} catch (e){; };
	});

	graph.removeNode(noId);
	//remove no da lista de selecionados
	var index = gIdNosSelecionados.indexOf(noId);
	if (index > -1) {
		gIdNosSelecionados.splice(index, 1);
	}
}

function numeroDeGruposF() {
	var ngrupos=0;
	var listaDeNos = noLigacao['no'];
	if (listaDeNos[0].grupo==undefined) {
		return 0;
	}
	for ( var i = 0, tamanho = listaDeNos.length; i < tamanho ; i++ ) {	
		ngrupos = Math.max(ngrupos,listaDeNos[i].grupo);
	}
	return ngrupos;
}

function contaGrupoF(grupo) {
	var cont=0;
	var listaDeNos = noLigacao['no'];
	for ( var i = 0, tamanho = listaDeNos.length; i < tamanho ; i++ ) {
		if (listaDeNos[i].grupo==grupo) {	
			cont += 1;
		}
	}
	return cont;
}

function carregaListasIniciais(noLigacao,grupos) {
	var listaDeNos = noLigacao['no'];
	var listaLigacoes = noLigacao['ligacao'];
	var listaGrupos = [];
	var nosAInserir = 0;
	if (grupos) { //intervalo, por exemplo, 10-20 ou 10-
		if (grupos.search('-')!=-1) {
			var intervalo = grupos.split('-');
			var kmax = (intervalo[1]!='') ? parseInt(intervalo[1]) : (numeroDeGruposF());
			for (var k=parseInt(intervalo[0]); k<=kmax; k++) {
				listaGrupos.push(k);
			}			
		} else { 
			listaGrupos = grupos.split(',');
			for (var k=0; k<listaGrupos.length; k++) {
				listaGrupos[k]= parseInt(listaGrupos[k]);
			}
		}
	}		
	if (listaGrupos.length>0) {
		for ( var i = 0, tamanho = listaDeNos.length; i < tamanho ; i++ ) {
			var dadosNosTemp=listaDeNos[i];		
			dadosNosTemp.tipo = dadosNosTemp.tipo.toUpperCase();
			if (dadosNosTemp.grupo) {
				if (listaGrupos.indexOf(dadosNosTemp.grupo) !=-1) {
					adicionaNo(dadosNosTemp.id,dadosNosTemp, false); //adicionaNo(dadosNosTemp.id,dadosNosTemp, false);	
					nosAInserir++;
				}
			}
		}	
	} else { //inseri todos
		for ( var i = 0, tamanho = listaDeNos.length; i < tamanho ; i++ ) {
			var dadosNosTemp=listaDeNos[i];		
			dadosNosTemp.tipo = dadosNosTemp.tipo.toUpperCase();
			adicionaNo(dadosNosTemp.id,dadosNosTemp, false); //adicionaNo(dadosNosTemp.id,dadosNosTemp, false);	
			nosAInserir++;
		}		
	}
	for (var i = 0, arrayLength = listaLigacoes.length; i < arrayLength; i++) {
		var dadosLinkTemp = listaLigacoes[i];
		adicionaLink(dadosLinkTemp.origem,dadosLinkTemp.destino, dadosLinkTemp, false);	//poderia ser true, mas existe casos raros em que a ligação em sentido contrário - firma que é contadora e filial	
	}	
	return nosAInserir;
}

//adiciona Novos Nós e Ligações, partindo do Nó de Referência
function adicionarNovosNosELigacoes(noReferencia, listaNoAdicional, listaLigacaoAdicional)	{
	//se o nó de referência não foi passado 
	//não faço nada
	var nosInseridos = []; //reinicia lista de nós inseridos nesta operação
	var dadosNosTemp = dadosNos;
	var cNosLigacoes = 0; //conta quantos links ou nos foram criados. Só resume layout se tiver sido adicionado algo
	var refreshPosicoes = false;
	for(var cont=0, tam = listaNoAdicional.length; cont < tam; cont++)	{
		for (p of ['camada','tipo','sexo','label','situacao','m1','m2','m3','m4','m5','m6','m7','m8','m9','m10','m11','cor','nota','texto_tooltip']) {
			dadosNosTemp[p] = listaNoAdicional[cont][p];
		}
		/* 
		dadosNosTemp.camada = listaNoAdicional[cont].camada;
		dadosNosTemp.tipo = listaNoAdicional[cont].tipo;
		dadosNosTemp.sexo = listaNoAdicional[cont].sexo;
		dadosNosTemp.label = listaNoAdicional[cont].label;
		dadosNosTemp.situacao = listaNoAdicional[cont].situacao;
		dadosNosTemp.m1 = listaNoAdicional[cont].m1;
		dadosNosTemp.m2 = listaNoAdicional[cont].m2;
		dadosNosTemp.m3 = listaNoAdicional[cont].m3;
		dadosNosTemp.m4 = listaNoAdicional[cont].m4;
		dadosNosTemp.m5 = listaNoAdicional[cont].m5;
		dadosNosTemp.m6 = listaNoAdicional[cont].m6;
		dadosNosTemp.m7 = listaNoAdicional[cont].m7;
		dadosNosTemp.m8 = listaNoAdicional[cont].m8;
		dadosNosTemp.m9 = listaNoAdicional[cont].m9;
		dadosNosTemp.m10 = listaNoAdicional[cont].m10;
		dadosNosTemp.m11 = listaNoAdicional[cont].m11;
		dadosNosTemp.cor = listaNoAdicional[cont].cor;
		dadosNosTemp.nota = listaNoAdicional[cont].nota;
		dadosNosTemp.texto_tooltip = listaNoAdicional[cont].texto_tooltip; */
		// dadosNosTemp.posicao = listaNoAdicional[cont].posicao;
		//passar elementos da lista de Adicional para a lista inicial
		if (adicionaNo(listaNoAdicional[cont].id,dadosNosTemp, false)) { //true);
			cNosLigacoes++;
			nosInseridos.push(listaNoAdicional[cont].id);
			if (listaNoAdicional[cont].posicao) {
				layout.setNodePosition(listaNoAdicional[cont].id, listaNoAdicional[cont].posicao.x, listaNoAdicional[cont].posicao.y);
				refreshPosicoes = true;
			}
		}
	}	


	if (refreshPosicoes) { // && (! (bEstaRenderizando()))) {
		graphics.renderNodes();
		graphics.renderLinks();
	}

	if (nosInseridos.length !=0) {
		gHistoricoIdNosInseridos.push(nosInseridos);
	}
	var dadosLinkTemp=dadosLink;
	var noPinado = false;
	if (noReferencia && (nosInseridos.indexOf(noReferencia) == -1)) { 
		noPinado = layout.isNodePinned(graph.getNode(noReferencia));	
		if (!noPinado) {
			layout.pinNode(graph.getNode(noReferencia),1);		
		}
	}
	gHistoricoUltimosLinksInseridos=[];
	for(var cont=0, tam = listaLigacaoAdicional.length; cont < tam; cont++)	{
		dadosLinkTemp.camada = listaLigacaoAdicional[cont].camada;
		dadosLinkTemp.cor = listaLigacaoAdicional[cont].cor;
		dadosLinkTemp.tipoDescricao = listaLigacaoAdicional[cont].tipoDescricao;
		if (adicionaLink(listaLigacaoAdicional[cont].origem,listaLigacaoAdicional[cont].destino, dadosLinkTemp, false)) {
			cNosLigacoes++;
			if (! ((graph.hasLink(listaLigacaoAdicional[cont].origem,listaLigacaoAdicional[cont].destino)==null)
				|| (graph.hasLink(listaLigacaoAdicional[cont].destino,listaLigacaoAdicional[cont].origem)==null))) {
				gHistoricoUltimosLinksInseridos.push({'origem':listaLigacaoAdicional[cont].origem,'destino':listaLigacaoAdicional[cont].destino});
			}
		}
	}
	if (!refreshPosicoes && bEstaRenderizando) {
		if (cNosLigacoes !=0) {
			renderizaPausaEmSegundos(Math.sqrt(listaLigacaoAdicional.length)*3);
			if (noReferencia && !noPinado && (nosInseridos.indexOf(noReferencia) == -1)) {
				setTimeout(
					function() { 
							layout.pinNode(graph.getNode(noReferencia),0); 
					}, 
					Math.sqrt(listaLigacaoAdicional.length)*3*1000
				);
			};
		}
	}
	atualizaContagemNos();
}

function textoLinkF(tipoDescricao,bExibeComplemento) {
	var itensLigacao = [];
	var listaAux=Object.keys(tipoDescricao);
	for (var k=0, tk = listaAux.length; k<tk; k++) {
		var tipo = listaAux[k];
		if ((tipo != 150) && (tipo !=151) && (tipo != 155)) { //se for endereço, telefone ou conta-corrente não exibe label
			var descricao = tipoDescricao[tipo];
			var tipoNaLista = listaTipos[tipo]?listaTipos[tipo]:''; 
			if ((tipoNaLista!='')&&(descricao!='')&&(tipoNaLista!=descricao)&&(bExibeComplemento)) { //(descricao.substring(0,2)==': ') {
				itensLigacao.push(tipoNaLista + ': ' + descricao);	
			} else if ((tipoNaLista!='')&&(descricao!='')&&(tipoNaLista!=descricao)&&(421<=tipo)) { //(descricao.substring(0,2)==': ') {
				itensLigacao.push(tipoNaLista + ': ' + descricao);	
			} else if ((tipoNaLista=='')&&(descricao!='')) {
				itensLigacao.push(descricao);	
			} else if (tipoNaLista!='') {
				itensLigacao.push(tipoNaLista);
			} else {
				itensLigacao.push('tipo ' + tipo);
			}
		}
	}
	var textoLabel = itensLigacao.join(',');
	return textoLabel;
}



function retornaLabel(linkId, descricao) {
    //o campo descrição pode apresentar dado adicional, por exemplo, o valor. Se a descrição for diferente do nome padrão do label, inclui dois pontos entre os dois.
	var retorno = descricao;
	var tipoNaLista = listaTipos[linkId]?listaTipos[linkId]:'';
	if (!descricao) { 
		retorno = tipoNaLista;
	} else if ((descricao != tipoNaLista) && (tipoNaLista != '')) {
		retorno = tipoNaLista + ': ' + descricao;
	}
	return retorno;
}

function replaceAll(string, token, newtoken) {
	if (!string) { return ''; } ;
	while (string.indexOf(token) != -1) {
		string = string.replace(token, newtoken);
	}
	return string;
}

//------------grafoRelacionamento.html
function retornaStrTipo(tipo) {
	var r = "PJ";
	if ( tipo >  limiteTipoPJ )	{
		r = "PF";
	}
	return r;
}

function retornAvatar(dados) { //(tipo, id, sexo, situacao) {	
	if (dados.tipo=='PF')	{
		if (dados.situacao==0) { //situacao==0 ativa
			if (dados.sexo==1) {
				avatar = 'icone-grafo-masculino.png';
			} else if (dados.sexo==2) {
				avatar = 'icone-grafo-feminino.png';
			} else {
				avatar ='icone-grafo-desconhecido.png';
			}
		} else {
			if (dados.sexo==1) {
				avatar = 'icone-grafo-masculino-inativo.png';
			} else if (dados.sexo==2) {
				avatar = 'icone-grafo-feminino-inativo.png';
			} else {
				avatar ='icone-grafo-desconhecido.png';
			}			
		}
	} else if (dados.tipo=='PJ')	{
		// if (dados.id.slice(8,12) =="0001") { // m1 tem tipo de empresa
		var empresaMatriz = dados.sexo %2;
		var tipoEmpresa = Math.floor(dados.sexo/2);
		if (empresaMatriz==1) { // ==1 matriz
			if ((1<=tipoEmpresa)&&(tipoEmpresa<=5)) {
				avatar = (dados.situacao==2)? 'icone-grafo-empresa-' + tipoEmpresa + '.png' : 'icone-grafo-empresa-'+ tipoEmpresa + '-inativo.png';
			} else {
				avatar = (dados.situacao==2)?'icone-grafo-empresa.png':'icone-grafo-empresa-inativo.png';
			}
		} else { //filial
			avatar = (dados.situacao==2)?'icone-grafo-empresafilial.png':'icone-grafo-empresafilial-inativo.png';											
		}
	} else if (dados.tipo=='TEL')	{
		avatar = 'icone-grafo-telefone.png';		
	} else if (dados.tipo=='END')	{
		avatar = 'icone-grafo-endereco.png';		
	} else if (dados.tipo=='CC')	{
		avatar = 'icone-grafo-conta.png';		
	} else if (dados.tipo=='INF')	{
		avatar = 'icone-grafo-informacaoRelevante.png';		
	} else if (dados.tipo=='ENT')	{ //tipo 'entidade', para adicionar dados via json
		avatar = 'icone-grafo-informacaoRelevante.png';		
	} else if (dados.tipo=='DOC')	{ //tipo 'documento', para adicionar dados via json
		avatar = 'icone-grafo-informacaoRelevante.png';		
	} else if (dados.tipo=='IDE')	{ //tipo 'IDE', para adicionar dados via json
		avatar = 'icone-grafo-desconhecido.png';		
	} else { //pessoa estrangeira
		avatar = 'icone-grafo-empresa-estrangeira.png';
	}
	return avatar;
}

function ehSentidoUnico(descricao) {
	var retorno = true;
	var descricoesComSentidoUnico = ["irmão","endereco","telefone","endereço"];
	if (descricao.length > 0) {
		var tam = descricoesComSentidoUnico.length;
		var cont;
		descricao = descricao.replace(",","");
		for (cont = 0; cont < tam; cont++)	{
			descricao = descricao.replace(descricoesComSentidoUnico[cont],"");
		}
		descricao = descricao.replace(" ","");
		if (descricao.length == 0)	{
			retorno = false;
		}
	}
	return retorno;
}

function ehSentidoUnicoF(tipoDescricao) {
	var retorno = true;
	var descricoesComSentidoUnico = ["irmão","endereco","telefone","endereço"];
	// 306,150,151,155
	if ((tipoDescricao[306] != undefined) ||
		(tipoDescricao[150] != undefined) ||
		(tipoDescricao[151] != undefined) ||
		(tipoDescricao[155] != undefined)) {
			retorno=false;
	}
	return retorno;
}


function retornaSituacao(codigo, tipo) {
	var retorno = 0;
	if (tipo=="PF")	{
		if(codigo == '0')	{
			retorno = 2;
		} else	{
			if ((codigo == '2') || (codigo == '4')) {
				retorno = 1;
			} else	{
				retorno = 0;
			}
		}
		//dadosNosTemp.situacao = "{{dado|safe}}";
	} else {
		if (tipo=="PJ")	{
			if(codigo == '2')	{
				retorno = 2;
			} else	{
				if ((codigo == '3' ) || (codigo == '4')) {
					retorno = 1;
				} else {
					retorno = 0;
				}
			}
		} else {
			retorno = 3;
		}
	}
	return retorno;
}

function retornaCorFonteNaCamada(camada)	{ 
	/*
	const corCamadaZero = "#FF6600";
	const corPrimeiraCamada = "black"; //"#66CC33";
	const corSegundaCamada = "DodgerBlue"; //"DimGray"; //"MidnightBlue";//"darkblue"; //"#333333";
	const corTerceiraCamada = "green"; //"DodgerBlue"; //"blue"; //"#00CCCC";
	const corCamadaAdicional = "#FFFF00"; //Yellow //"#8FBC8F";  //DarkSeaGreen
	const corFonteCamadaAdicional = "SaddleBrown";// "Teal"; */
	var corFonte = corPadrao;
	if (camada == 0) {
		corFonte= "Red";
	} else if (camada == 1) {
		corFonte="GoldenRod";
	} else if (camada ==2) {
		corFonte="Green"; //"";
	} else if (camada == 3) {
		g3camada = true;
		corFonte="Blue"; //DodgerBlue";
	} else if (camada == 4) {
		corFonte="SaddleBrown";
	} else {
		corFonte="Gray"; //corPadrao;
	}
	return corFonte;
}

//------------------------ Código que define algumas funções para manipulação do gráfico --------------------------------------->
//javascript  ------------  Define Algumas Funcoes para Manipular o Grafico
//arquivo chamado em "dossie/grafico/base/base_macro_grafo.html"

// we use this method to highlight all realted links
// when user hovers mouse over a node:
function highlightRelatedNodes(nodeId, isOn) {
	// just enumerate all realted nodes and update link color:
	graph.forEachLinkedNode(nodeId, function(node, link){				// link.ui is a special property of each link
		if (!link.data.selecionado)	{
			graphics.getLinkUI(link.id).attr('stroke', isOn ? corLinkSelecao : link.data.cor );
		}				
	});
	
	graph.forEachLinkedNode(nodeId, function(node, link){ //troca cor da legenda
		var elem = document.getElementById('texto_ligacao_' + link.data.id);
		if (elem) {
			elem.attr('fill',isOn ? corLinkSelecao :corTextoLinkF(link.data.tipoDescricao))						
		}	
	});	
	
	
	//if ($("#botao_exibir_ocultar_texto_ligacao").prop('value').search("Exibir")>=0) { //ligacoes estão ocultas
	//console.log(document.getElementById('selExibirOcultar').options['opTextoLigacao'].text.startsWith('Exibir'));
	if (document.getElementById('selExibirOcultar').options['opTextoLigacao'].text.startsWith('Exibir')) { //texto das ligacoes estão ocultas
		if (isOn) {		
			graph.forEachLinkedNode(nodeId, function(node, link){		
				//var tempSVG = Viva.Graph.svg('text').attr('x', '+7px').attr('y', '-4px').attr('font-size','7').attr('fill','red').attr('text-anchor','middle').text(link.data.label);
				if (!tempSVGList[node.id]) {
					var tempSVG = Viva.Graph.svg('text')
									.attr('x', '+7px')
									.attr('y', '-4px')
									.attr('fill',corSelecao)
									.attr('font-size', kTamanhoFonte)
									.attr('text-anchor','middle') 
									.text(textoLinkF(link.data.tipoDescricao)); //.text(link.data.label);
					graphics.getNodeUI(node.id).appendChild(tempSVG);
					tempSVGList[node.id]=tempSVG;
				}
			});
		} 
	}
	if (!isOn) {
		Object.keys(tempSVGList).forEach(function (nodeid) { 
			graphics.getNodeUI(nodeid).removeChild(tempSVGList[nodeid]);
		});
		tempSVGList={};
	}
};

function ajustaCorDeFundoDaImagem(node, selecionado) {
	var nodeUI=graphics.getNodeUI(node.id);
	var cor;
	if (selecionado==true) {
		cor = corSelecao;
	} else {
		cor= corFundoImagemF(node); 	
	} //cor = (selecionado)?'red':'white';
	for (var c=0;c<nodeUI.children.length;c++) { 
		if ((nodeUI.children[c].tagName=='rect') && (nodeUI.children[c].getAttribute('tipo')=='fundo')) { 
			nodeUI.children[c].setAttribute('fill',cor);
			break; //muda a cor do primeiro retângulo, que é fundo. Existe outro retângulo que é a faixa 'falecido' ou informação relevante
		} 
	}	
}

function ajustaBorda(node) {
	var nodeUI=graphics.getNodeUI(node.id);
	var corStroke = node.data.corFonte;
	for (var c=0;c<nodeUI.children.length;c++) { 
		if ((nodeUI.children[c].tagName=='rect') && (nodeUI.children[c].getAttribute('tipo')=='fundo')) { 
		//if (nodeUI.children[c].getAttribute('tipo')=='borda') { 
			nodeUI.children[c].attr('stroke',corStroke);
		} 		
		if (nodeUI.children[c].tagName=='text') { 
		//if (nodeUI.children[c].getAttribute('tipo')=='borda') { 
			nodeUI.children[c].attr('fill',corStroke);
		} 
	}	
}

var selecionaNoIdNaoUtilizada = function(nodeId, isSelect) { //esta função não é utilizada
	// just enumerate all realted nodes and update link color:
	graph.forEachLinkedNode(nodeId, function(node, link){
		// link.ui is a special property of each link
		// points to the link presentation object.
		link.data.selecionado = isSelect;
		graphics.getLinkUI(link.id).attr('stroke', isSelect ? corLinkSelecao : link.data.cor );
	});
};

function selecionaListaIdNos(listaNoIds) { //listaNos = lista de no.id's
	var tempNo;	
	//selecionaNode(null, false);
	resetaNosSelecionados();
	for (var i=0, tam=listaNoIds.length; i<tam; i++) {
		tempNo = graph.getNode(listaNoIds[i]);
		if (tempNo) {
			ajustaCorDeFundoDaImagem(tempNo, true);
			if (gIdNosSelecionados.indexOf(tempNo.id)==-1) {
				gIdNosSelecionados.push(tempNo.id); 
			}
		};
	}
}

function selecionaNode(no, isSelect) { //se no='' e isSelect=false, desseleciona tudo, se no<>'' e false, deseleciona o especificado
	var tempNo;
	//Se isSelect=true, selecionar o nó e adicioná-lo no vetor
	//Se isSelect=false, remover todos os nós do vetor e remover seleção.
	if (isSelect == true) {
		//nodeId não pode ser nulo, nem vazio
		//tempNo = graph.getnode(nodeId);
		ajustaCorDeFundoDaImagem(no,true);
		if (gIdNosSelecionados.indexOf(no.id)==-1) {
			gIdNosSelecionados.push(no.id);
		}
		graph.forEachLinkedNode(no.id, function(node, link){ //destaca links
			link.data.selecionado = true;
			graphics.getLinkUI(link.id).attr('stroke', corLinkSelecao );
		});
	} else { //desseleciona tudo
		if ((no=='')||(no==null)) {
			for (var c=0, elementos = gIdNosSelecionados.length; c < elementos ;c++) {
				//tempNo = gIdNosSelecionados.pop(); //possivel fonte de inconsistência
				tempNo = graph.getNode(gIdNosSelecionados[c]);
				if (tempNo) {
					ajustaCorDeFundoDaImagem(tempNo, false);
					graph.forEachLinkedNode(tempNo.id, function(node, link){ //retorna cor original dos links
						link.data.selecionado = false;
						graphics.getLinkUI(link.id).attr('stroke', link.data.cor );
					});
				}
			}
			gIdNosSelecionados = [];
		} else { //desseleciona só o especificado
			ajustaCorDeFundoDaImagem(no, false);
			graph.forEachLinkedNode(no.id, function(node, link){ //retorna cor original dos links
				if (link) {
					link.data.selecionado = false;
					graphics.getLinkUI(link.id).attr('stroke', link.data.cor );
				}
			});
			if (gIdNosSelecionados.indexOf(no.id)!=-1) {
				gIdNosSelecionados.splice(gIdNosSelecionados.indexOf(no.id),1);	
			}
		}
	}
};

function excluirNo(node) {
	if (gIdNosSelecionados.length==0) {
		gIdNosSelecionados.push(node.id);
	}
	excluirIdNosDeLista(gIdNosSelecionados, true);
};

function armazenarNo(node) {
	if(gNoArmazenado==null) {
		gNoArmazenado=node;
		alerta("O Nó "+node.data.label+" foi armazenado.");
	} else {
		alerta(" Nó armazenado: "+node.data.label+".\nNó que foi substituído: "+gNoArmazenado.data.label+".");
		gNoArmazenado=node;
	}
};

function marcarComoOrigem(node) {
	//procurar o no na lista de No inicial
	//setar origem como verdadeiro
	//substituir figura
	//mais fácil excluir, mudar o valor e incluir --> problema, será necessário reincluir todos os links...
	if (gIdNosSelecionados.length==0) {
		gIdNosSelecionados.push(node.id);
	}

	var tmens = "Deseja realmente marcar os Nós selecionados como origem? Eles ficarão com fundo e com texto em vermelho e com o atributo camada=0.";
	jConfirm(tmens,'Sistema Macros',
		function(resposta) {
			if (resposta==true) {
				for (var c=0, elementos = gIdNosSelecionados.length; c < elementos ;c++) {
					//tempNo = gIdNosSelecionados.pop(); //possivel fonte de inconsistência
					tempNo = graph.getNode(gIdNosSelecionados[c]);
					if (tempNo) {
						tempNo.data.camada = 0;
						tempNo.data.corFonte = retornaCorFonteNaCamada(0);
						ajustaCorDeFundoDaImagem(tempNo,true);
						ajustaBorda(tempNo); //falhando
						//isso não acerta a cor do rótulo
					}
				}
			}		
		}
	);
};

function colorirNo(node, exibeMensagem, removerCor) {
	//procurar o no na lista de No inicial
	//setar origem como verdadeiro
	//substituir figura
	//mais fácil excluir, mudar o valor e incluir --> problema, será necessário reincluir todos os links...
	if (gIdNosSelecionados.length==0) {
		gIdNosSelecionados.push(node.id);
	}
	function colorir(gIdNosSelecionados, cor) {
		for (var c=0, elementos = gIdNosSelecionados.length; c < elementos ;c++) {
			//tempNo = gIdNosSelecionados.pop(); //possivel fonte de inconsistência
			tempNo = graph.getNode(gIdNosSelecionados[c]);
			if (tempNo) {
				// tempNo.data.camada = 0;
				tempNo.data.cor = cor;
				ajustaCorDeFundoDaImagem(tempNo,false); //true); //colocar false aqui quebra o padrão da interface... os selecionados deveriam ficar na cor cinza.
				//ajustaBorda(tempNo); //falhando
				//isso não acerta a cor do rótulo
			}
		}
	}
	var cor;
	if (removerCor) {
		cor = null;
	} else {
		cor = document.querySelector("#palheta").value; //"Blue";		
	}
	if (exibeMensagem) {
		var tmens = "Deseja realmente destacar os Nós selecionados?";
		jConfirm(tmens,'Sistema Macros',
			function(resposta) {
				if (resposta==true) {
					colorir(gIdNosSelecionados, cor);
				}
			}
		);
	} else {
		colorir(gIdNosSelecionados, cor);
	}
		
};

function editarNota(node) {
	var texto = node.data.nota;
	var textoAnterior = texto;
	if (!texto) texto = '';
	texto = prompt('Faça uma anotação para o item ' + node.id + (node.data.label?(' - ' + node.data.label):'') +'.\nPara excluir a anotação, digite um espaço e OK. \nUsando o botão central do mouse vc pode editar esta anotação.', texto)
	if (texto) {
		node.data.nota = texto;
		var elemento = document.querySelector('#texto_nota_' + ajustaQuerySelector(node.id));
		if (elemento) {
			elemento.innerHTML = texto;
		}
	}
}

function salvarNotasLocal(node) {
	var notas = localStorage.getItem('notas');
	notas = notas ?  JSON.parse(notas) : {};
	graph.forEachNode(function(node){
		if (node) {
			if (node.data.nota) {
				var texto =  node.data.nota;
				var textoStorage = notas[node.id];
				if (textoStorage) {
					texto = comparaJuntaTexto(textoStorage, texto);
				} 
				notas[node.id] = texto;
			}
		}
	});
	localStorage['notas'] = JSON.stringify(notas);
}

function recuperarNotasLocal(node) {
	var notas = localStorage.getItem('notas');
	notas = notas ?  JSON.parse(notas) : {};
	if (!notas) return;
	graph.forEachNode(function(node){
		if (node) {
			var texto =  node.data.nota;
			if (!texto) texto = '';
 			var textoStorage = notas[node.id];
			if (textoStorage) {
				texto = comparaJuntaTexto(textoStorage, texto);
			} 
			node.data.nota = texto; 
			var elemento = document.querySelector('#texto_nota_' + ajustaQuerySelector(node.id));
			if (elemento) {
				elemento.innerHTML =texto;
			}
		}
	});
}

function notasLocalStorage() {
	var notas = localStorage.getItem('notas');
	notas = notas ?  JSON.parse(notas) : {};
	var chaves = Object.keys(notas);
	var texto = '';
	for (var i=0, tam=chaves.length; i<tam; i++) {
		var c = chaves[i];
		texto += c + ' -> ' + notas[c] + '\n';
	}
	return texto;
}

function mostrarNotasLocal() {
	var t = notasLocalStorage();
	if (!t) { t='Não há Anotações';}
	alert(t);
}

function removerNotasLocal() {
	localStorage.removeItem('notas');
}


function notasSelecionados() { // 2019-03-20
	if (gIdNosSelecionados.length==0) {
		return ;
	}
	var texto = prompt('Digite um texto de anotação para os itens selecionados', '')
	if (!texto) return;
	for (var c=0, elementos = gIdNosSelecionados.length; c < elementos ;c++) {
		var tempNo = graph.getNode(gIdNosSelecionados[c]);
		if (tempNo) {
			var notaTexto = comparaJuntaTexto(tempNo.data.nota, texto);
			tempNo.data.nota = notaTexto;
			var elemento = document.querySelector('#texto_nota_' + ajustaQuerySelector(tempNo.id));
			if (elemento) {
				elemento.innerHTML = notaTexto;
			}
		}	
	}		
};

function notasInserirPorCPFCNPJ() { // 2019-03-20
	var texto = prompt('Insira anotações por CPF/CNPJ. Digite os CPFs/CNPJs separados de ; com a Nota, finalizando com |', '')
	if (!texto) return;

	//var items = noIn.replace('|',';','g').split(';');
	var linhas = texto.split('|'); // |  é caractere separador
	var listaItens=[];
	for (linha1 of linhas) { //sintaxe of, linha1 é indexador 0.. tam-1
		var linha = linha1.split(';');
		var item = linha[0].trim();
		var nota = linha.slice(1).join(';').trim();
		if (item=='') { continue; };
		var identificador = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(item,".",""),"-",""),",",""),"/",""),"\\","");
		if ((identificador.length == 11) || (identificador.length==14)) {
			listaItens.push([identificador,nota]);	
		} else {
			if (identificador.length != 0) {
				alerta("CPF/CNPJ inválido:" + identificador);
			};
		}
	}
	var itensNaoLocalizados = [];
	for (linha of listaItens) {
		var tempNo = graph.getNode(linha[0]);
		if (tempNo) {
			var notaTexto = comparaJuntaTexto(tempNo.data.nota, linha[1]);
			tempNo.data.nota = notaTexto;
			var elemento = document.querySelector('#texto_nota_' + ajustaQuerySelector(tempNo.id));
			if (elemento) {
				elemento.innerHTML = notaTexto;
			}
		} else {
			itensNaoLocalizados.push(linha[0] + ';' + linha[1]);	
		}
	}
	if (itensNaoLocalizados.length != 0) {
		alert('Não foram localizados os itens: ' + itensNaoLocalizados.join(', '));
	}


};

function comparaJuntaTexto(texto1, texto2) {
	var texto = '', t1='', t2='';
	if (texto1) {
		t1=texto1.trim();
	}
	if (texto2) {
		t2=texto2.trim();
	}
	if (t1==t2) {
		texto = t1;
	} else if ((!t2) || (t1.search(t2)!=-1)) {
		texto = t1;
	} else if ((!t1) || (t2.search(t1)!=-1)) {
		texto = t2;
	} else {
		texto = t1 + ', ' + t2;
	}
	return texto;
}

function ajustaQuerySelector(texto) {
	// não se pode usar / que tem em endereço como identificador
	var t = replaceAll(replaceAll(texto, '/','__'),' ', '_');
	return t;
}

function ligarNos(node) {
	if(gNoArmazenado==null) {
		alerta("Não há nó armazenado!!!");
	} else {
		if(gNoArmazenado.id==node.id) {
			alerta("Os nós de origem e de destino são os mesmos.");
		} else {
			//var resposta = confirm("Deseja realmente unir o Nó "+node.data.label+" ao Nó "+gNoArmazenado.data.label+" ?");
			jConfirm("Deseja realmente unir o Nó "+node.data.label+" ao Nó "+gNoArmazenado.data.label+" ?",'Sistema Macros',
				function(retorno) {
					if (!retorno) { return; };
					//dadosLink.linkId = "0"; //"000"
					dadosLink.id=contadorLink();
		
					jPrompt('Digite o texto da ligação','','Sistema Macros',
						function(retorno) {
							//dadosLink.label = retorno;
							dadosLink.tipoDescricao = {"0":retorno};
							adicionaLink(node.id,gNoArmazenado.id,dadosLink,false);
							renderizaPausaEmSegundos(2);					
						}
					);				
				}
			);
		}
	}
};

function selecionaNosAdjacentes(IdNosSelecionados) {
	var nosASelecionar = [];
	for (var k=0, tk=IdNosSelecionados.length; k<tk; k++) {
		var itemid = IdNosSelecionados[k];
		graph.forEachLinkedNode(itemid, function(node, link){ 
			if (link) {
				nosASelecionar.push(node.id);
			}
		});
	}
	for (var k=0, tk=IdNosSelecionados.length; k<tk; k++) {
		nosASelecionar.push(IdNosSelecionados[k]);
	}	
	selecionaListaIdNos(nosASelecionar);
}

function fixarNo(IdNosSelecionados){
	//layout.pinNode(node,!layout.isNodePinned(node));
	var estadoLeiaute = bEstaRenderizando();
	var label= $('#mc_fixar_no')[0].label;
	var bfix= (label=='Fixar Nó')?true:false;
	for (var k=0, tk=IdNosSelecionados.length; k<tk; k++) {
		var itemid = IdNosSelecionados[k];
		var no = graph.getNode(itemid);
		layout.pinNode(no,bfix);
	}
	rendererContinuarPausar(estadoLeiaute);
	
};

function eliminaRelacionamento(dropdown) {
	//alert($("#selFiltro input").attr("value"));
	//valorTipo = $("#selFiltro input").attr("value"); //isso não funciona com dojo 1.9
	var valorTipo = dropdown.value;
	if (valorTipo=='') { return; }
	dropdown.value = '';
	if (valorTipo=='ESC') { 
		excluiNosSoltos();
		return;
	} else if (valorTipo=='E1C') {
		excluiNosFolha();
		return;
	} else if (valorTipo=='EPoda') {
		excluiNosPoda(true);
		return;
	} else if (valorTipo=='ExcluiPFInativo') {
		excluiPFInativo();
		return;
	} else if (valorTipo=='ExcluiPJInativo') {
		excluiPJInativo();
		return;
	} else if (valorTipo=='ExcluiPJFilial') {
		excluiPJFilial();
		return;
	} else if (valorTipo=='ExcluiTelefone') {
		excluiNoTipo('TEL');
		return;
	} else if (valorTipo=='ExcluiEndereco') {
		excluiNoTipo('END');
		return;
	} else if (valorTipo=='ExcluiContaCorrente') {
		excluiNoTipo('CC');
		return;
	} else if (valorTipo=='ExcluiSemMarcadores') {
		excluiNoTipo('SemMarcadores');
		return;
	} else if (valorTipo=='ExcluiTudo') {
		excluiTudo();
		return;
	};	
	var relacionamentosAExcluir = [];
    if (valorTipo=='ExcluiValor') {
		relacionamentosAExcluir = listaLigacoesComValor();
	} else {
		graph.forEachLink(function(link){
			tempLink = link; //apenas para debugar no navegador
			var listaIDs = Object.keys(link.data.tipoDescricao);
			if (listaIDs.indexOf(valorTipo) != -1) {
				var relacionamento = {
					"origem": link.fromId,
					"destino": link.toId ,
				};
				relacionamentosAExcluir.push(relacionamento);
			}
		});
	}
	excluirListaRelacionamentos(relacionamentosAExcluir,false);

};

function listaLigacoesComValor() {
	var relacionamentosAExcluir = [];
	var valorMinimo=prompt('Selecione um valor. As ligações com valor abaixo do especificado (em milhares) serão excluídas',100);
	if (valorMinimo) {		
		graph.forEachLink(function(link){
			tempLink = link; 
			var bRemove = true;
			var bTodosValoresAbaixo = true;
			for (var k=0, listaAux=Object.keys(link.data.tipoDescricao); k<listaAux.length; k++) {
				var tipo = listaAux[k];
				if (((500<=tipo) && (tipo<600)) ||(tipo==421)) { //
					var descricao = link.data.tipoDescricao[tipo];
					if ((descricao.substring(descricao.length-4)==' mil')) {
						var valorMil = parseInt(descricao.replace(' mil').replace('.',''));
						if (valorMil>=valorMinimo) {
							bTodosValoresAbaixo=false;
						}
					}
				} else {
					bRemove = false;
					break;
				}
			}			
			if (bRemove && bTodosValoresAbaixo) { 
				relacionamentosAExcluir.push({"origem": link.fromId,"destino": link.toId});
			}
		});	
	}
	return relacionamentosAExcluir;
}

function excluirListaRelacionamentos(relacionamentosAExcluir, bTodos) {
	var relacionamentosFiltrados=[];
	var bApenasUltima=document.getElementById('cbFiltraApenasUltimaInclusao').checked;
	if (bTodos ||(!bApenasUltima) || (gHistoricoIdNosInseridos.length==0)) {
		relacionamentosFiltrados = relacionamentosAExcluir;
	} else {
		//var nosInseridos = gHistoricoIdNosInseridos[gHistoricoIdNosInseridos.length-1];
		function ligacaoRecente(origem,destino) {
			for (var k=0, tam=gHistoricoUltimosLinksInseridos.length; k<tam; k++) {
				if ((gHistoricoUltimosLinksInseridos[k].origem==origem)&&(gHistoricoUltimosLinksInseridos[k].destino==destino)) {
					return true;
				}
			}
			return false;
		}
		for (var k=0, tam = relacionamentosAExcluir.length; k<tam; k++) {
			var relacionamento = relacionamentosAExcluir[k];
			var id1 = relacionamento.origem, id2 = relacionamento.destino;
			//if ((nosInseridos.indexOf(id1)>-1) || (nosInseridos.indexOf(id2)>-1)) { //se um dos nós foi incluido recentemente, então exclui ligação
			if (ligacaoRecente(id1,id2)) {
				relacionamentosFiltrados.push(relacionamento);
			}
		}
	}	
	if (relacionamentosFiltrados.length==0) {
		alerta('Não foram encontradas ligações do tipo selecionado.');
		return;
	};
	if (relacionamentosFiltrados.length==1) {
		var mensagem = 'Deseja realmente remover a ligação? Não será possível reverter.';
	} else {
		var mensagem = 'Deseja realmente remover as ' + relacionamentosFiltrados.length + ' ligações? Não será possível reverter.';
	}
	jConfirm(mensagem,'Sistema Macros', 
		function(resp) {
			if (resp) {
				for (var c=0, cmax=relacionamentosFiltrados.length; c<cmax; c++)	{   
					relacionamento = relacionamentosFiltrados[c];
					removeLigacao(relacionamento.origem , relacionamento.destino );
				}			
			}
		}
	);

}

function selecaoExibirOcultar(dropdown) {
	var myindex  = dropdown.selectedIndex;
	var idSel=dropdown.options[myindex].id;
	var textoSelecao = dropdown.value;
	if (textoSelecao=='Selecione...') { return true; }
	dropdown.value = '';
	if (idSel=='opRotulo') {
		if (textoSelecao.startsWith('Ocultar')) {
			dropdown.options[myindex].text = 'Exibir Rótulo';
			mostraTextoDeNo(false);
		} else {
			dropdown.options[myindex].text = 'Ocultar Rótulo';
			mostraTextoDeNo(true);
		}
	} else if (idSel=='opTextoLigacao') {
		if (textoSelecao.startsWith('Ocultar')) {
			dropdown.options[myindex].text = 'Exibir Texto Ligação';
			$( "[id^='texto_ligacao_']" ).attr("visibility","hidden");			
		} else {
			dropdown.options[myindex].text = 'Ocultar Texto Ligação';
			$( "[id^='texto_ligacao_']" ).attr("visibility","visible");			
		}		
	} else if (idSel=='op1Camada') {
		if (textoSelecao.startsWith('Ocultar')) {
			dropdown.options[myindex].text = 'Exibir 1a Camada';
			ocultarCamada(1,true);
		} else {
			dropdown.options[myindex].text = 'Ocultar 1a Camada';
			ocultarCamada(1,false);
		}		
	} else if (idSel=='op2Camada') {
		if (textoSelecao.startsWith('Ocultar')) {
			dropdown.options[myindex].text = 'Exibir 2a Camada';
			ocultarCamada(2,true);
		} else {
			dropdown.options[myindex].text = 'Ocultar 2a Camada';
			ocultarCamada(2,false);
		}		
	} else if (idSel=='op3Camada') {
		if (textoSelecao.startsWith('Ocultar')) {
			dropdown.options[myindex].text = 'Exibir 3a Camada';
			ocultarCamada(3,true);
		} else {
			dropdown.options[myindex].text = 'Ocultar 3a Camada';
			ocultarCamada(3,false);
		}		
	} else if (idSel=='opOutrasCamadas') {
		if (textoSelecao.startsWith('Ocultar')) {
			dropdown.options[myindex].text = 'Exibir Outras Camadas';
			ocultarCamada(4,true);
		} else {
			dropdown.options[myindex].text = 'Ocultar Outras Camadas';
			ocultarCamada(4,false);
		}		
	} else if (idSel=='opEscala') {
		graphics.resetScale();
	} 
	
	return true;
};

function selecaoExibirOcultar_executaOpcao(opcaoIndex) {
    //opcao = 1=Ocultar/Exibir Rotulo, 2=Ocultar/Exbir Texto Ligação, 3=Ocultar 1a Camada, 4=Ocultar 2a Camada, 5=Ocultar 3a Camada, 6=Ocultar Outras Camadas
	var dropObjeto = document.getElementById('selExibirOcultar');
	dropObjeto.selectedIndex=opcaoIndex;
	selecaoExibirOcultar(dropObjeto);
}

function mostraTextoDeNo(bmostra) {			
	graph.forEachNode(function(node){
		if (node) {
			var elementTexto1 = document.getElementById("texto_no_linha1_" + node.id);
			var elementTexto2 = document.getElementById("texto_no_linha2_" + node.id);
			if (bmostra) {
				if (elementTexto1) { elementTexto1.setAttribute("visibility","visible"); };
				if (elementTexto2) { elementTexto2.setAttribute("visibility","visible"); };
			} else {
				if (elementTexto1) { elementTexto1.setAttribute("visibility","hidden"); };
				if (elementTexto2) { elementTexto2.setAttribute("visibility","hidden"); };
			}
		}
	});
}
function mostraTextoDeLigacao(bmostra) {
	if (bmostra) {
		$( "[id^='texto_ligacao_']" ).attr("visibility","visible");					
	} else {
		$( "[id^='texto_ligacao_']" ).attr("visibility","hidden");		
	}
}

function ocultarCamada(camada,ocultar){
	graph.forEachNode(function(node) {
		if ((node.data.camada == camada) || ((camada==4) && (node.data.camada >= 4))) {
			if (ocultar == true) {
				graph.forEachLinkedNode(node.id, function(node, link) {
					link.data.ref.hide();
					$( "#texto_ligacao_" + link.data.id ).attr("visibility","hidden");
				});
				node.data.ref.hide();
			} else {
				graph.forEachLinkedNode(node.id, function(node, link) {
					link.data.ref.show();
					$( "#texto_ligacao_" + link.data.id ).attr("visibility","visible");
				});
				node.data.ref.show();
			}
		}
	});
};	

function shuffelWord(word) {
  var shuffledWord = '';
  word = word.split('');
  while (word.length > 0) {
    shuffledWord +=  word.splice(word.length * Math.random() << 0, 1);
  }
  return shuffledWord;
}

function embaralha(palavra) { //embaralha cada parte de um nome
	var saida='';
	t = palavra.split(' ');
	var ts = [];
	for (var k=0;k<t.length; k++) {
		ts.push(shuffelWord(t[k]));
	}
	return ts.join(' ');
}

function descaracterizaIdentificadores(descaracterizaPJ, descaracterizaINF) { //sempre descaracteriza cpf, endereço, telefone
	jConfirm("Deseja descaracterizar identificadores e nomes? NÃO SERÁ POSSÍVEL REVERTER!!!",'Sistema Macros',
		function(resposta) {
			if (!resposta) { return; }
			graph.forEachNode(function(node){
				if (node) {
					if (node.data.tipo=='PF') {
						var cpfDescaracterizado = '***.' + node.id.substr(3,3) + '.' + node.id.substr(6,3) + '-**';
						var elementTexto1 = document.getElementById("texto_no_linha1_" + node.id);
						var elementTexto2 = document.getElementById("texto_no_linha2_" + node.id);
						if (elementTexto1) { elementTexto1.text(cpfDescaracterizado); };
						if (elementTexto2) { elementTexto2.text(embaralha(elementTexto2.text())); };
					} else if (node.data.tipo=='PJ') {
						 if (descaracterizaPJ) {
							var cpfDescaracterizado = '**.' + node.id.substr(2,3) + '.' + node.id.substr(5,3) + '/****-**';
							var elementTexto1 = document.getElementById("texto_no_linha1_" + node.id);
							var elementTexto2 = document.getElementById("texto_no_linha2_" + node.id);
							if (elementTexto1) { elementTexto1.text(cpfDescaracterizado); };
							if (elementTexto2) { elementTexto2.text(embaralha(elementTexto2.text())); };
						 }
					} else if ((node.data.tipo != 'INF') || descaracterizaINF) {
						var elementTexto1 = document.getElementById("texto_no_linha1_" + node.id);
						var elementTexto2 = document.getElementById("texto_no_linha2_" + node.id);
						if (elementTexto1) { elementTexto1.text(embaralha(elementTexto1.text())); };
						if (elementTexto2) { elementTexto2.text(embaralha(elementTexto2.text())); };
					}			
				}
			});
		}
	);
}


var abreRelatorio = function (cpfcnpj){
	//window.blur();		
	window.opener.Dossie.dossie(cpfcnpj);
	//window.opener.focus(); isso não funciona
	//window.opener.alert('O Relatório do cpf/cnpj ' + cpfcnpj + ' foi aberto.'); //removendo, isso bloqueia a aba, não permite abrir mais de um relatório por vez
};

var abreMacro = function (tipoLigacao, cpfcnpj1, cnpfcnpj2 ){ //
	var nomeMacro = ''; 
	var cpfcnpj = cpfcnpj1;
	var tipoKeys = Object.keys(tipoLigacao);
	if ((tipoLigacao.hasOwnProperty('101')) || (tipoLigacao.hasOwnProperty('102')) || (tipoLigacao.hasOwnProperty('103')) || (tipoLigacao.hasOwnProperty('104'))  || (tipoLigacao.hasOwnProperty('105')) || (tipoLigacao.hasOwnProperty('106')) ) {
		nomeMacro = 'macro_cnpj';
	} else if ((tipoLigacao.hasOwnProperty('128')) || (tipoLigacao.hasOwnProperty('127') )) {
		nomeMacro = 'macro_rais';
	} else if ((tipoLigacao.hasOwnProperty('160')) || (tipoLigacao.hasOwnProperty('161') )) {
		nomeMacro = 'macro_siape_dependente_representante';
	} else if (tipoLigacao.hasOwnProperty('250')) {
		nomeMacro = 'macro_informacaorelevante';
	} else if (tipoLigacao.hasOwnProperty('350')) {
		nomeMacro = 'macro_denatran';
	} else if (tipoLigacao.hasOwnProperty('413')) {
		nomeMacro = 'macro_siape';
	}
	if (nomeMacro!='') { //verifica se já tem aba aberta com o identificador
		var listaAbas = window.opener.Global.tabs.getChildren();
		var cp = null;
		for (var k=1; k<listaAbas.length; k++) {
			if (cpfcnpj == listaAbas[k].title) {
				cp = listaAbas[k];
				break;
			}
		}
		if (cp) {
			window.opener.Global.tabs.selectChild(cp);
		} else {
			window.opener.Dossie.dossie(cpfcnpj);
		}
		window.opener.Dossie.selecionaEScrollMacro(nomeMacro);
		//alert('A macro foi aberta');
	}
};
	
function abreNovoGrafico(no) {
	var strUrl;
	//falta validar o tipo e o id -------------------------------------------------------------------------
	var noReferencia = no.id;
	var caminho = new String(window.location);
	var ref = "macro_grafo";
	if (caminho.indexOf("macro_grafo1")!=-1)	{
		ref = "macro_grafo1";
	} else if	(caminho.indexOf("macro_grafo2")!=-1){
		ref = "macro_grafo2";
	} else if	(caminho.indexOf("macro_grafo3")!=-1){
		ref = "macro_grafo3";
	}
	//alert(window.location);
	strUrl = "/macros/"+no.data.tipo.toLowerCase()+"/"+ref+"/"+noReferencia+"/grafo/";
	//-----------------------------------------------------------------------------------------------------
	var novaJanela=window.open(strUrl);
	novaJanela.focus();
};
	
var	centralizaNo = function(no){

};


function excluiNosSoltos() {
	var temp = 0;
	var listaParaRemover = [];	
	graph.forEachNode(function(node) {
		if (node) {
			//alert(node.id+ "  " + graph.getLinks(node.id));
			temp = 0 + graph.getLinks(node.id).length;
			if(temp == 0) {
				//alert("excluir");
				//significa que o nó não tem ligação
				//removeIdNo(node.id);
				listaParaRemover.push(node.id);
			}
		}
	});
	excluirIdNosDeLista(listaParaRemover, false);
};

function excluiNosFolha() {
	var ligacoes =0;	
	var listaParaRemover = [];	
	graph.forEachNode(function(node) {
		if (node) {
			ligacoes = 0 + graph.getLinks(node.id).length;
			if ((ligacoes == 1) && (node.data.camada != 0) && (node.data.tipo!='INF') && (node.data.m10 != 1)
				&& (textoTooltip(node,false)=='') && (!node.data.cor) &&(!node.data.nota)) { //node.data.origem != true
				listaParaRemover.push(node.id);
			}
		}
	});
	var nExcluidos = excluirIdNosDeLista(listaParaRemover, false);
	return nExcluidos;
};

function excluiNosPoda(exibeMensagem) {
	var bApenasUltima=document.getElementById('cbFiltraApenasUltimaInclusao').checked;
	var texto = 'Deseja realizar a Poda da árvore, excluindo os itens até que todos tenham mais de 1 ligação, sejam origem da consulta, tenham marcador ou informação relevante? \nNÃO SERÁ POSSÍVEL REVERTER!!!!\n\nObs:Utilize a opção \'Marcar como Origem\' no menu contextual para que um item seja considerado como origem e não ser removido por esta rotina.';
	if (bApenasUltima) {
		texto += 'ESSA ROTINA SE APLICARÁ A TODOS OS NÓS.';
	}
	if (exibeMensagem) {
		if (!confirm(texto)) {
			return;
		}
	}
	var ligacoes;	
	var listaParaRemover;	
	var contagem=0;
	while (true) {
		listaParaRemover = [];
		graph.forEachNode(function(node) {
			if (node) {
				ligacoes = 0 + graph.getLinks(node.id).length;
				// if ((ligacoes == 1) && (node.data.camada != 0) && (node.data.tipo!='INF') && (node.data.m10 != 1)) { //node.data.origem != true
				if ((ligacoes == 1) && (node.data.camada != 0) && (node.data.tipo!='INF') && (node.data.m10 != 1) 
					&& (textoTooltip(node,false)=='') && (!node.data.cor) &&(!node.data.nota)
					) { //node.data.origem != true
					//mantém item que tem marcador
					listaParaRemover.push(node.id);
				}
			}
		});
		contagem += listaParaRemover.length;
		if (listaParaRemover.length==0) {
			break;
		}
		for (var k=0; k<listaParaRemover.length; k++) {
			removeIdNo(listaParaRemover[k]);
		}
	}
	atualizaContagemNos();
	if (exibeMensagem) {
		if (contagem>0) {
			alerta('Foram removidos ' + contagem + ' items.');
		} else {
			alerta('Não foram localizados itens para remover.');
		}
	}
}

function excluirIdNosDeLista(lista, todos) { //se todos=false, verifica checkbox Exclui Apenas última inclusão
	var listafiltrada=[];
	var bApenasUltima=document.getElementById('cbFiltraApenasUltimaInclusao').checked;
	if (todos || (!bApenasUltima) || (gHistoricoIdNosInseridos.length==0)) {
		listafiltrada = lista;
	} else {
		var nosInseridos = gHistoricoIdNosInseridos[gHistoricoIdNosInseridos.length-1];
		listafiltrada = lista.filter(function(n) {
		  return nosInseridos.indexOf(n) > -1;
		});
	}
	if (listafiltrada.length==0) {
		alerta('Não há itens do tipo selecionado');
		return 0;
	}
	selecionaListaIdNos(listafiltrada);
	jConfirm('Deseja remover ' + listafiltrada.length + ' itens selecionados? Não será possível reverter.','Sistema Macros',
		function(resp) {
			if (resp) {
				for (var i=0, tam=listafiltrada.length; i<tam; i++) {
					removeIdNo(listafiltrada[i]);
				}
				atualizaContagemNos();
				return listafiltrada.length;
			} else {
				return 0;
			}
				
		}
	);
}

function excluiPFInativo() { 
	var listaParaRemover = [];
	graph.forEachNode(function(node) {
		if (node) {
			if ((node.data.tipo == 'PF') && (node.data.situacao != 0)) {
				listaParaRemover.push(node.id);
			}
		}
	});
	excluirIdNosDeLista(listaParaRemover, false);
};

function excluiPJInativo() { 
	var listaParaRemover = [];
	graph.forEachNode(function(node) {
		if (node) {
			if ((node.data.tipo == 'PJ') && (node.data.situacao != 2)) {
				listaParaRemover.push(node.id);
			}
		}
	});
	excluirIdNosDeLista(listaParaRemover, false);
};

function excluiPJFilial() { 
	var listaParaRemover = [];
	graph.forEachNode(function(node) {
		if (node) {
			if ((node.data.tipo == 'PJ') && (node.id.slice(8,12) != "0001")) {
				listaParaRemover.push(node.id);
			}
		}
	});
	excluirIdNosDeLista(listaParaRemover, false);
};

function excluiNoTipo(tipo) { 
	var listaParaRemover = [];
	graph.forEachNode(function(node) {
		if (node) {
			if (tipo=='SemMarcadores') {
				// if ((textoTooltip(node)=='')&&(node.data.camada!='0')) {
				if ((textoTooltip(node,false)=='')&&(node.data.camada!='0')) {
					listaParaRemover.push(node.id);
				}
			} else {
				if (node.data.tipo == tipo) {
					listaParaRemover.push(node.id);
				}
			}
		}
	});
	excluirIdNosDeLista(listaParaRemover, false);
};

function excluiTudo() {
	jConfirm('Deseja remover TODOS OS ITEMS DA REDE? NÃO SERÁ POSSÍVEL REVERTER.','Sistema Macros',
		function(resp) {
			if (resp) {
				graph.forEachNode(function(node) {
					if (node) {
						removeIdNo(node.id);
					}
				});	
				return 1;
			} else {
				return 0;
			}
				
		}
	);

}

function inserirNo() {
	jPrompt("Digite o CPF/CNPJ a inserir \n", "",'Sistema Macros',
		function(noIn) {
			if (!noIn) { return;};
			var items = noIn.replace('|',';','g').split(';'); // | também é caractere separador
			//for (var c=0,tam=items.length;c<tam;c++) {
			var listaItens=[];
			for (item of items) {
				item = item.trim();
				if (item=='') { continue; };
				no = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(item,".",""),"-",""),",",""),"/",""),"\\","");
				if ((no.length == 11) || (no.length==14)) {
					//incluiLigacao('macro_grafo1', [no], true); 
					listaItens.push(no);	
				} else {
					if (no.length != 0) {
						alerta("CPF/CNPJ inválido:" + no);
					};
				}
			}
			incluiLigacao('macro_grafo1', listaItens, true); 
		}
	);
};

var abreLinkedin = function (node){
	var strUrl='';
	var nomes=node.data.label.split(' ');
	var nome2 = nomes[nomes.length-1];
	for (var i=1; i<nomes.length; i++) {
		if (nomes[i].length>2) { 
			nome2=nomes[i]; 
			break;
		}
	}
	if (node.data.tipo=='PF') {
		strUrl = 'https://www.linkedin.com/pub/dir/?first=' + nomes[0] + '&last=' + nomes[nomes.length-1];		
	} else if (node.data.tipo='PJ') {
		strUrl = 'https://www.linkedin.com/pub/dir/?first=' + nomes[0] + '&last=' + nome2;	
	}
	if (strUrl == '') { return; }
	var novaJanela=window.open(strUrl);
	novaJanela.focus();
};

var abreFacebook = function (node){
	var strUrl='';
	var nomes=node.data.label.split(' ');
	if ((node.data.tipo=='PF') ||(node.data.tipo='PJ')) {
		strUrl = 'https://www.facebook.com/search.php?q=' + nomes[0] + '+' + nomes[nomes.length-1];		
	}
	if (strUrl == '') { return; }
	var novaJanela=window.open(strUrl);
	novaJanela.focus();
};

var abreEmSite = function (siteUrl, node){
	var strUrl='';
	if ((node.data.tipo=='PF') || (node.data.tipo='PJ')) {
		strUrl = siteUrl + '"' + node.data.label + '"';		
	}
	if (strUrl == '') { return; }
	var novaJanela=window.open(strUrl);
	novaJanela.focus();
};

var abreGoogle = function(node) {
	abreEmSite('https://www.google.com/?#q=', node);
};

var abreSites = function (node){
	abreEmSite('https://www.google.com/?#q=', node);	
	abreFacebook(node);
	abreLinkedin(node);	
	abreEmSite('http://www.jusbrasil.com.br/diarios/busca?q=', node);
};

function formataCPFCNPJ(texto) {
	var retorno = texto;
	if (texto != texto.replace(/\D+/, '')) {
		return retorno;
	}
	if (texto.length == 14) {
		retorno = texto.substr(0,2)+"."+texto.substr(2,3)+"."+texto.substr(5,3)+"/"+texto.substr(8,4)+"-"+texto.substr(12,2);
	} else {
		if (texto.length == 11)	{
			retorno = texto.substr(0,3)+"."+texto.substr(3,3)+"."+texto.substr(6,3)+"-"+texto.substr(9,2);
		}
	}
	return retorno;
}

function ehCPFCNPJ(texto) {
	if (texto != replace(/[^0-9]+/, '')) {
		return false;
	}
	if (( texto.length == 14) || (texto.length == 11)) {
		return true;
	} 
	return false;
}		

function carregaMenuLateral(node, carregar) {
	//alert(" teste imagem");
		// <!--"/macros/verfoto/{{dados.cnpj|cut:"-"|cut:"."|cut:"/"}}/principal"-->
	if(window.getSelection){
		window.getSelection().removeAllRanges();
	}
	if (carregar == false)	{
		//$("#menu_foto").html("<img src=\"/macros/static/images/desconhecido-foto-grafo.jpg\"  style=\"width: 150px;\">");
		$("#menu_foto").html("");
		$("#menu_nome").html("");
		$("#menu_cpfcnpj").html("");
		///macros/verfoto/{{dados.cnpj|cut:"-"|cut:"."|cut:"/"}}/principal
	} else	{	
		if ((node.data.tipo == 'PF') || (node.data.tipo == 'PJ') || (node.data.tipo == 'ES')) {
			//$("#menu_foto").html("<img src=\"/macros/verfoto/"+node.id+"/principal\"  style=\"width: 150px;\" alt=\"Carregando foto...\">");
			$("#menu_nome").html("<b>Nome</b>: "+node.data.label.substr(0,100)); //estava substr(0,50)
			$("#menu_foto").html("<img src=" +  caminhoImagem + node.data.avatar + " style=\"height: 150px;\" alt=\"Carregando foto...\">");
			if ((node.data.tipo == 'PF') || (node.data.tipo == 'PJ')) {
				$("#menu_cpfcnpj").html('<b>'+(node.id.length == 11 ? "CPF" : "CNPJ")+'</b>:' + '<a href="javascript:abreRelatorio(' + "'" + node.id + "'" + ');" title="Abre Relatório na Aba principal">' + formataCPFCNPJ(node.id) + '</a>');
				
			} else {
				$("#menu_cpfcnpj").html("<b>"+(node.id.length == 11 ? "CPF" : "CNPJ")+"</b>: "+formataCPFCNPJ(node.id));
			}
			if (grafoOnline()) {
				dojo.ready(function(){
					var xhrArgs = {
						url: "/macros/temfoto/" + node.id + gAleatorio,
						handleAs: "json",
						load: function(data){
							var tam=0, cont;
							try {
								temFoto = data['temFoto'];
								if (temFoto) {
									$("#menu_foto").html("<img src=\"/macros/verfoto/"+node.id+"/principal\"  style=\"width: 150px;\" alt=\"Carregando foto...\">");
									iconeComFoto(node); 
								} else {
									$("#menu_foto").html("<img src=" +  caminhoImagem + node.data.avatar + " style=\"height: 150px;\" >");
								}
							} catch(err) {
								$("#menu_foto").html("<img src=" +  caminhoImagem + node.data.avatar + " style=\"height: 150px;\" >");
							}
						},
						error: function(error){	
							$("#menu_foto").html("<img src=" +  caminhoImagem + node.data.avatar + " style=\"height: 150px;\" alt=\"Carregando foto...\">");
						}
					}
					var deferred = dojo.xhrGet(xhrArgs);
				});	
			} else {
				//$("#menu_foto").html("<img src=" +  caminhoImagem + node.data.avatar + " style=\"height: 150px;\" alt=\"Carregando foto...\">");
			}
		} else if (node.data.tipo == 'END') {
			$("#menu_foto").html("<img src=" +  caminhoImagem + node.data.avatar + " style=\"height: 150px;\" alt=\"Carregando foto...\">");
			$("#menu_nome").html("<b>Endereço</b>: " + node.id.split('__')[1]);
			$("#menu_cpfcnpj").html("<b>Cidade/UF</b>: " + node.id.split('__')[0]);
		} else if (node.data.tipo == 'TEL') {
			$("#menu_foto").html("<img src=" +  caminhoImagem + node.data.avatar + " style=\"height: 150px;\" alt=\"Carregando foto...\">");
			$("#menu_nome").html("<b>Telefone</b>: " + node.id);
			$("#menu_cpfcnpj").html("");
		} else if (node.data.tipo == 'CC') {
			$("#menu_foto").html("<img src=" +  caminhoImagem + node.data.avatar + " style=\"height: 150px;\" alt=\"Carregando foto...\">");
			$("#menu_nome").html("<b>Conta-Corrente Banco</b>:" + node.id.split('-')[0] + ' <b>Agência</b>:' + node.id.split('-')[1] + ' <b>Conta</b>:' + node.id.split('-')[2]);
			$("#menu_cpfcnpj").html("");
		}
		// /macros/verfoto/{{dados.cnpj|cut:"-"|cut:"."|cut:"/"}}/principal
	}

}

function iconeComFoto(node) {
	//coloca foto no lugar do ícone
	var nodeUI=graphics.getNodeUI(node.id);
	for (var c=0;c<nodeUI.children.length;c++) { 
		if (nodeUI.children[c].tagName=='image') { 
			nodeUI.children[c].setAttribute('xlink:href', "/macros/verfoto/"+node.id+"/principal"); 
			break;
		} 
	}
}

function saveTextAsFile(textToSave, nomeArquivo, mime)
{   //salva arquivo texto sem precisar mandar para o servidor.
	var textToSaveAsBlob = new Blob([textToSave], mime); //{type:"text/plain"});
	var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
	var fileNameToSaveAs = nomeArquivo; 
	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "Download File";
	downloadLink.href = textToSaveAsURL;
	downloadLink.onclick = destroyClickedElement;
	downloadLink.style.display = "none";
	document.body.appendChild(downloadLink);
	downloadLink.click();
}

function destroyClickedElement(event)
{
	document.body.removeChild(event.target);
}

function postJsonStr() {
	var jsonstr = "";
	var mime="";
	//var formato = dijit.byId('selFormatoDownload').get('value');
	var formato = document.getElementById("selFormatoDownload").value;
	document.getElementById("selFormatoDownload").selectedIndex = 0;
	if (formato=="svg")	{
		jsonstr = converteParaSVG();
		mime = {type:"image/svg"};
		alerta("SVG (Scalable Vector Graphics) pode ser aberto no Internet Explorer.\nÉ um grafico vetorial, em que pode ser feito zoom sem perda de definição.\nPara gerar um svg com todo o gráfico,\nreduza primeiro a visualização com a roda do mouse.\nO arquivo resultante estará compactado. \nDescompacte antes de abrir no Internet Explorer.\nNo Internet Explorer o arquivo SVG poderá ser salvo como JPG ou PNG.");
		//alert(jsonstr);
	} else {
		jsonstr = converteParaJSON();
		mime = {type:"application/json"};

	}
	if ((formato=="svg") || (formato=="json")) {
		saveTextAsFile(jsonstr,'rede de relacionamentos.'+formato, mime);
		return true; 
	}
	// quando é svg, manda pro servidor. poderia usar também a rotina saveTextAsFile, que salva localmente direto, mas precisaria substituir as imagens por base64.
 	var ifr = document.getElementById('iframeDownload');
	ifr.onload = null;
	var ifrDoc = ifr.contentDocument || ifr.contentWindow.document;
	var form = ifrDoc.getElementById( 'formGrafoConversor' );
	form.jsonstr.value = jsonstr;
	form.action = "/macros/grafo/conversor/" + formato;
	form.submit();
	//dijit.byId('selFormatoDownload').set('value', '');
	//document.getElementById("selFormatoDownload").value=''; 
}

function selecaoDownloadGrafo(dropdown) {
	//var formato = dijit.byId('selFormatoDownload').get('value');
	var formato = dropdown.value;
	if (formato == '') { return; }
	var ifr = document.getElementById('iframeDownload');
	ifr.onload = postJsonStr;
	ifr.src = '/macros/static/formGrafoConversor.html';
	
}

function importarJSONHandleFileSelect(evt) {
	var files = evt.target.files; // FileList object
	var f=files[0];
	var reader = new FileReader();
	reader.onload = (function(f) {
		return function(e) {
			var contents = e.target.result;
			//alert( "Got the file.n"  +"name: " + f.name + "n"  +"type: " + f.type + "n"  +"size: " + f.size + " bytesn"  + "starts with: " + contents.substr(1, contents.indexOf("n"))); 
			if (f.name.endsWith('.csv')) {
				importaLista(contents);
			} else if (f.name.endsWith('.json')){
				importaJSON(contents);
			} else {
				alerta('O arquivo a ser importado deve ter extensão .json ou .csv');
			}
		};
	})(f);
	reader.readAsText(f);
}

function importaJSON(textoJSON) { //carrega arquivo no formato json 
	carregaNosLigacoesJSON(JSON.parse(textoJSON));
}

function importaLista01(texto) {
	var linhas = texto.replace('\n\r','\n').replace('\r\n','\n').replace('\r','\n').split('\n');
	var c=0, linha = '', tam;
	var nosAIncluir = [];
	for (var c=0, tam=linhas.length; c<tam; c++) {
		linha=linhas[c];
		if (linha.search('\t')>-1) {
			campos = linha.split('\t');
		} else if (linha.search(';')>-1) {
			campos = linha.split(';');
		} else {
			campos = [linha,];
		}
		var textoLigacao = campos[2];	
		var id_origem = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(campos[0],".",""),"-",""),",",""),"/",""),"\\","");
		var id_destino = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(campos[1],".",""),"-",""),",",""),"/",""),"\\","");
		if ((id_origem.length == 11) || (id_origem.length==14)) {
			if (! existeIdNo(id_origem)) {				
				nosAIncluir.push(id_origem); 
			}
		}
		if ((id_destino.length == 11) || (id_destino.length==14)) {
			if (! existeIdNo(id_destino)) {				
				nosAIncluir.push(id_destino); 
			}
		}
	}
	//console.log(nosAIncluir);
	var listaLigacaoAdicional = [], listaNoAdicional = [];
	var contLigacoesNovas = 0;
	//alert(IsObject(data));
	var nosNovos=0;
	$("svg").css("cursor", "wait");
	var xhrArgs = {
		url: "/macros/grafo/conversor/lista",
		preventCache: true,
		sync: true, 
		content: {'no':nosAIncluir.join(',')},
		load: function(data){
			var tam=0, cont, nosEntrada;
			try {
				dados= JSON.parse(data);
				nosEntrada = dados['no'];	
				//console.log(JSON.stringify(nosEntrada));
				tam = nosEntrada.length;
			} catch(err) {
				alerta("Aconteceu um erro: " + err );				
				tam = -1
			}
			if (tam==-1) { 
				return;
			}
			if (tam==0){ 
				alerta("Os cpfs/cnpjs informados não foram localizados (1).");
				return;
			}

			for(var cont=0,tamanho=nosEntrada.length;cont < tamanho;cont++)	{
				var dadosNosTemp = nosEntrada[cont];
				if (!graph.getNode(dadosNosTemp.id)) { //(dadosNosTemp.length > 7) {
					nosNovos = nosNovos + 1;
					listaNoAdicional.push(
						{"id": dadosNosTemp.id,
						"tipo": dadosNosTemp.tipo, //retornaStrTipo(data.no['0'][chaves[cont]].tipo), 
						"sexo": dadosNosTemp.sexo, 
						"label": dadosNosTemp.label, 							
						"camada": kcamadaAdicional, //camadaBase + dadosNosTemp.camada,
						"origem":false,
						"situacao": retornaSituacao(dadosNosTemp.situacao, retornaStrTipo(dadosNosTemp.tipo)),
						"m1": dadosNosTemp.m1,
						"m2": dadosNosTemp.m2,
						"m3": dadosNosTemp.m3,
						"m4": dadosNosTemp.m4,
						"m5": dadosNosTemp.m5,
						"m6": dadosNosTemp.m6,
						"m7": dadosNosTemp.m7,
						"m8": dadosNosTemp.m8,
						"m9": dadosNosTemp.m9,
						"m10": dadosNosTemp.m10,
						"m11": dadosNosTemp.m11
						});
				}
			}
		},
		error: function(err){
				//$("svg").css("cursor", "default");
			console.log("Aconteceu um erro: " + err);
			$("svg").css("cursor", "default");
			}
		//var deferred =  dojo.xhrPost(xhrArgs);
	};

	dojo.xhrPost(xhrArgs);
	for (var c=0, tam=linhas.length; c<tam; c++) {
		linha=linhas[c]
		linha=linhas[c];
		if (linha.search('\t')>-1) {
			campos = linha.split('\t');
		} else if (linha.search(';')>-1) {
			campos = linha.split(';');
		} else {
			campos = [linhas];
		}
		var textoLigacao = campos[2];	
		var id_origem = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(campos[0],".",""),"-",""),",",""),"/",""),"\\","");
		var id_destino = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(campos[1],".",""),"-",""),",",""),"/",""),"\\","");
		if (!textoLigacao) {
			textoLigacao = '';
		}
		listaLigacaoAdicional.push(
			{"origem":id_origem, 
			"destino":id_destino, 
			"tipoDescricao":{'0':textoLigacao},
			"camada": kcamadaAdicional, 
			});
	}
	adicionarNovosNosELigacoes(null, listaNoAdicional, listaLigacaoAdicional);
	$("svg").css("cursor", "default");
	renderizaPausaEmSegundos(10);	
}

function importaLista(texto) {
	var linhas = texto.replace('\n\r','\n').replace('\r\n','\n').replace('\r','\n').split('\n');
	var c=0, linha = '', tam;
	var nosAIncluir = [];
	for (var c=0, tam=linhas.length; c<tam; c++) {
		linha=linhas[c];
		if (linha.search('\t')>-1) {
			campos = linha.split('\t');
		} else if (linha.search(';')>-1) {
			campos = linha.split(';');
		} else {
			campos = [linha,];
		}
		var textoLigacao = campos[2];	
		var id_origem = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(campos[0],".",""),"-",""),",",""),"/",""),"\\","");
		var id_destino = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(campos[1],".",""),"-",""),",",""),"/",""),"\\","");
		if ((id_origem.length == 11) || (id_origem.length==14)) {
			if (! existeIdNo(id_origem)) {				
				nosAIncluir.push(id_origem); 
			}
		}
		if ((id_destino.length == 11) || (id_destino.length==14)) {
			if (! existeIdNo(id_destino)) {				
				nosAIncluir.push(id_destino); 
			}
		}
	}
	//console.log(nosAIncluir);
	var listaLigacaoAdicional = [], listaNoAdicional = [];
	//var contLigacoesNovas = 0;
	//alert(IsObject(data));
	listaNoAdicional = importaDadosNos(nosAIncluir, true)
	
	for (var c=0, tam=linhas.length; c<tam; c++) {
		linha=linhas[c]
		linha=linhas[c];
		if (linha.search('\t')>-1) {
			campos = linha.split('\t');
		} else if (linha.search(';')>-1) {
			campos = linha.split(';');
		} else {
			campos = [linhas];
		}
		var textoLigacao = campos[2];	
		var id_origem = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(campos[0],".",""),"-",""),",",""),"/",""),"\\","");
		var id_destino = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(campos[1],".",""),"-",""),",",""),"/",""),"\\","");
		if (!textoLigacao) {
			textoLigacao = '';
		}
		listaLigacaoAdicional.push(
			{"origem":id_origem, 
			"destino":id_destino, 
			"tipoDescricao":{'0':textoLigacao},
			"camada": kcamadaAdicional, 
			});
	}
	adicionarNovosNosELigacoes(null, listaNoAdicional, listaLigacaoAdicional);
	$("svg").css("cursor", "default");
	renderizaPausaEmSegundos(10);	
}

function importaDadosNos(nosAIncluir, exibeMensagem) { //2019-03-14
	var listaNoAdicional = [];
	var contLigacoesNovas = 0;
	var nosAIncluir2 = [ ...new Set(nosAIncluir) ] ; //remove duplicação
	//alert(IsObject(data));
	var nosNovos=0;
	$("svg").css("cursor", "wait");
	var xhrArgs = {
		url: "/macros/grafo/conversor/lista",
		preventCache: true,
		sync: true, 
		content: {'no':nosAIncluir2.join(',')},
		load: function(data){
			var tam=0, cont, nosEntrada;
			try {
				dados= JSON.parse(data);
				nosEntrada = dados['no'];	
				//console.log(JSON.stringify(nosEntrada));
				tam = nosEntrada.length;
			} catch(err) {
				alerta("Aconteceu um erro: " + err );				
				tam = -1
			}
			if (tam==-1) { 
				return;
			}
			if (tam==0){ 
				if (exibeMensagem) {
					alerta("Os cpfs/cnpjs informados não foram localizados.(2)");
				}
				return;
			}

			for(var cont=0,tamanho=nosEntrada.length;cont < tamanho;cont++)	{
				var dadosNosTemp = nosEntrada[cont];
				if (!graph.getNode(dadosNosTemp.id)) { //(dadosNosTemp.length > 7) {
					nosNovos = nosNovos + 1;
					listaNoAdicional.push(
						{"id": dadosNosTemp.id,
						"tipo": dadosNosTemp.tipo, //retornaStrTipo(data.no['0'][chaves[cont]].tipo), 
						"sexo": dadosNosTemp.sexo, 
						"label": dadosNosTemp.label, 							
						"camada": kcamadaAdicional, //camadaBase + dadosNosTemp.camada,
						"origem":false,
						"situacao": retornaSituacao(dadosNosTemp.situacao, retornaStrTipo(dadosNosTemp.tipo)),
						"m1": dadosNosTemp.m1,
						"m2": dadosNosTemp.m2,
						"m3": dadosNosTemp.m3,
						"m4": dadosNosTemp.m4,
						"m5": dadosNosTemp.m5,
						"m6": dadosNosTemp.m6,
						"m7": dadosNosTemp.m7,
						"m8": dadosNosTemp.m8,
						"m9": dadosNosTemp.m9,
						"m10": dadosNosTemp.m10,
						"m11": dadosNosTemp.m11
						});
				}
			}
		},
		error: function(err){
				//$("svg").css("cursor", "default");
			console.log("Aconteceu um erro: " + err);
			$("svg").css("cursor", "default");
		},
		handle: function(in1,in2){
			$("svg").css("cursor", "default");
		}
		//var deferred =  dojo.xhrPost(xhrArgs);
	};

	dojo.xhrPost(xhrArgs);
	
	//adicionarNovosNosELigacoes(null, listaNoAdicional, listaLigacaoAdicional);
	//$("svg").css("cursor", "default");
	return listaNoAdicional;
} //importaDadosNos



//retorna Json
function converteParaJSON() {	
	//return dojo.toJson({'no':listaNoInicial, 'ligacao':listaLigacaoInicial});
	//return JSON.stringify({'no':listaNoInicial, 'ligacao':listaLigacaoInicial}, filtroDeMembros);
	var nosAux=[], ligacoesAux=[];
	//pega dados apartir do vivagraph, assim não é preciso fazer ajustes em listaLigacaoInicial ou listaNoInicial
	graph.forEachNode( 
		function(node) {
			nosAux.push({
				"id": node.id,
				"tipo":node.data.tipo, 
				"sexo":node.data.sexo,
				"label": node.data.label, 
				"camada": node.data.camada,
				"situacao": node.data.situacao,
				"m1": node.data.m1,
				"m2": node.data.m2,
				"m3": node.data.m3,
				"m4": node.data.m4,
				"m5": node.data.m5,
				"m6": node.data.m6,
				"m7": node.data.m7,
				"m8": node.data.m8,
				"m9": node.data.m9,
				"m10": node.data.m10,
				"m11": node.data.m11,
				"cor": node.data.cor,
				"nota": node.data.nota,				
				"posicao": layout.getNodePosition(node.id),

			});						
		}
	);
	graph.forEachLink(function(link){
		ligacoesAux.push(
			{"origem":link.fromId,
			"destino":link.toId ,
			"cor":link.data.cor,
			"camada":link.data.camada,
			"tipoDescricao": link.data.tipoDescricao
			}
		);
	});
	return JSON.stringify({'no':nosAux, 'ligacao':ligacoesAux});

}


function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
	var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians))
	};
}

function describeArc(x, y, radius, startAngle, endAngle) {

	var start = polarToCartesian(x, y, radius, endAngle);
	var end = polarToCartesian(x, y, radius, startAngle);

	var arcSweep = endAngle - startAngle <= 180 ? "0" : "1";

	var d = [
		"M", start.x, start.y, 
		"A", radius, radius, 0, arcSweep, 0, end.x, end.y
	].join(" ");

	return d;       
}

var listaImagens= ["icone-grafo-conta.png",
						"icone-grafo-desconhecido.png",
						"icone-grafo-empresa.png",
						"icone-grafo-empresafilial-inativo.png",
						"icone-grafo-empresafilial.png",
						"icone-grafo-empresa-inativo.png",
						"icone-grafo-empresa-1.png",
						"icone-grafo-empresa-2.png",
						"icone-grafo-empresa-3.png",
						"icone-grafo-empresa-4.png",
						"icone-grafo-empresa-5.png",
						"icone-grafo-empresa-1-inativo.png",
						"icone-grafo-empresa-2-inativo.png",
						"icone-grafo-empresa-3-inativo.png",
						"icone-grafo-empresa-4-inativo.png",
						"icone-grafo-empresa-5-inativo.png",
						"icone-grafo-endereco.png",
						"icone-grafo-feminino.png",
						"icone-grafo-feminino-inativo.png",
						"icone-grafo-masculino.png",
						"icone-grafo-masculino-inativo.png",
						"icone-grafo-telefone.png",				
						"icone-grafo-empresa-estrangeira.png",		
						"icone-grafo-informacaoRelevante.png"];
						
function converteParaSVG() {
	//ver http://d3export.housegordon.org/ exemplo para exportação svg		
	var svg_xml = (new XMLSerializer).serializeToString(document.getElementsByTagName('svg')[0]); 
	svg_xml = replaceAll(svg_xml,'xmlns:xlink="http://www.w3.org/1999/xlink"',''); //esse link é acrescentado em campo de texto, causando erro no svg
	svg_xml = svg_xml.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" '); //define namespace para link
	var dicionario = converteImagens2Base64();

	for (var k=1; k<=listaImagens.length; k++) {
		var key=listaImagens[k];
		var baseStr=dicionario[key];
		var strProcurar = 'xlink:href="/macros/static/images/' + key + '"';
		//var strSubstituicao = 'xlink:href="data:image/png;base64,'+baseStr + '"';
		var strSubstituicao = 'xlink:href="'+baseStr + '"';
		//svg_xml=replaceAll(svg_xml, strProcurar, strSubstituicao);
		svg_xml = svg_xml.replace(new RegExp(strProcurar,'g'), strSubstituicao); //isso é mais rápido que replaceAll
	}
	return svg_xml;
}

function converteImagens2Base64() {
	var dicionarioBase64 = {};
	var c = document.createElement('canvas');
	for (var k=0; k<listaImagens.length; k++) {
		var nomeImagem = listaImagens[k]; //imagem' + k;
		var img = document.getElementById(nomeImagem);
		c.height = img.naturalHeight;
		c.width = img.naturalWidth;
		var ctx = c.getContext('2d');

		ctx.drawImage(img, 0, 0, c.width, c.height, 0, 0, c.width, c.height);
		var base64String = c.toDataURL();
		dicionarioBase64[nomeImagem] = base64String;
	}
	return dicionarioBase64;
}


//--------------------base_macro_grafo.html--------


function removeNosInseridos() {
	if (gHistoricoIdNosInseridos.length==0) {
		return;
	}
	var nosInseridos = gHistoricoIdNosInseridos.pop();
	for(var cont=0, tam = nosInseridos.length; cont < tam; cont++) {
		removeIdNo(nosInseridos[cont]);
	}
	atualizaContagemNos();
	renderizaPausaEmSegundos(5);
}

function renderizaPausaEmSegundos(segundos) { // se segundos=0, usa tempo
	gTemporizadorLayout++;
	//renderer.resume();
	rendererContinuarPausar(true);
	setTimeout(
		function() { 
			gTemporizadorLayout--;
			if (gTemporizadorLayout==0) { //pausa somente se todos os pedidos de pausa terem expirado
				//renderer.pause();
				rendererContinuarPausar(false);
			}
		}, 
		segundos*1000
	);
}

function incluiLigacao(nome_macro, listaIds, bExibeMensagem) {
	//alert(gRightClickNo.data.tipo+" "+gRightClickNo.id);
	if (listaIds==[]) {
		alert('listaIds vazio na função incluiLigacao');
		return;
	}
	if (listaIds.length==0) {
		if (gRightClickNo.id==null) { return; }
		listaIds = [gRightClickNo.id];
	}	
	var idTemp = listaIds[0];
	var nosSelecionados = listaIds;

	/*
	if ((nome_macro=='macro_tribunalcontasestadual')) {
		if (gIdNosSelecionados.length!=0) {
			nosSelecionados = gIdNosSelecionados;
		}
	}
	*/
	var strUrl = '';
	var noReferencia;
	var nome_rotina = nome_macro;
	var camadaBase = kcamadaAdicional; //fazer ajustes na camadaBase, agora que pode-se incluir vários itens ao mesmo tempo
	var ligacaoEntrada, nosEntrada;
	if (nome_macro == 'macro_grafo') {
		var camadaConsulta = camada;
		camadaConsulta = prompt('Digite a camada do grafico a partir do nó selecionado:',camada);
		if (!camadaConsulta) { 
			return; 
		} else if ((camadaConsulta==1)&&(gIdNosSelecionados.length<=1)) {
			alerta('Dica: para adicionar 1 camada, dê um duplo-clique no ícone');
		} else if (camadaConsulta>3) {
			alerta('Escolha uma camada de 1 a 3.');
			return;
		}
		nome_rotina = 'macro_grafo' + String(camadaConsulta);
	} else if (nome_macro == 'macro_grafo_lista') {
		//nao faz nada
	}
	if (idTemp.length == 0)	{
		//alteração idTemp tem que ser explicitamente fornecido
		console.log('idTemp não fornecido na rotina incluiLigacao');
		return;
		//falta validar o tipo e o id -------------------------------------------------------------------------
		noReferencia = gRightClickNo.id;
		strUrl = "/macros/"+gRightClickNo.data.tipo.toLowerCase()+"/"+nome_rotina+"/"+noReferencia;
		camadaBase = kcamadaAdicional;
	} else {
		noReferencia = idTemp;
		if(idTemp.length == 11)	{
			strUrl = "/macros/pf/"+nome_rotina+"/" + noReferencia;
		} else {
			if(idTemp.length == 14)	{
				strUrl = "/macros/pj/"+nome_rotina+"/"+noReferencia;
			}
		}
		var noTemp = graph.getNode(idTemp);
		if (noTemp) {
			camadaBase = noTemp.data.camada; //estava sem +1
			if ((nome_macro=='macro_endnormalizado') || (nome_macro=='macro_telefone') || (nome_macro=='macro_contacorrente') || (nome_macro=='macro_informacaorelevante')) {
				camadaBase = camadaBase + 1;
			}			
		}
	}
	if (nome_macro=='macro_grafo_lista') {
		jPrompt("Digite o numero da lista.\n Observação: a lista deve ter a macro \n'Rede de Relacionamentos' e estar concluída.",'','Sistema Macros',incluiLigacao_cb);
	} else if ((nome_macro=='macro_grafo') || nome_macro.startsWith('macro_grafo')) {
		strUrl = strUrl + '/json/';
		incluiLigacao_cb(true);
	} else {
		strUrl = strUrl + '/ligacao/';
		incluiLigacao_cb(true);
	}
	function incluiLigacao_cb(numeroLista) {
		if (nome_macro=='macro_grafo_lista') {
			if (!numeroLista) { return;};
			strUrl = "/macros/cs/macro_grafo/" + numeroLista + '/json/';		
		}
		var listaLigacaoAdicional=[];
		var listaNoAdicional=[];
		$("svg").css("cursor", "wait"); 
		dojo.ready(function(){
			//var targetNode = dojo.byId("licenseContainer");
			var xhrArgs = {
				//url: "/macros/{{tipo}}/{{mnemonico}}/{{cpfcnpj}}/",
				url: strUrl,
				handleAs: "json",
				preventCache: true,
				content: {'lista_nos':nosSelecionados}, 
				load: function(dados){
					$("svg").css("cursor", "default");
					//salvar nós e ligações dos vetores da lista Adicional, antes de usá-los....
					//inserir novos nós e ligações
					var tam=0, cont;
					try {
						ligacaoEntrada = dados['ligacao'];
						tam = ligacaoEntrada.length;
						nosEntrada = dados['no'];	
					} catch(err) {
						tam = -1
						alerta("Aconteceu um erro: " + err);
					}
					if (tam==-1) { 
						return;
					}
					if (tam==0){ 
						alerta("Não foram encontradas ligações");
						return;
					}
					var listaLigacaoAdicional = [], listaNoAdicional = [];
					var contLigacoesNovas = 0;
					for (var cont = 0; cont < tam; cont++) {
						dadosLinkTemp = ligacaoEntrada[cont];
						if (!graph.hasLink(dadosLinkTemp.origem,dadosLinkTemp.destino)) {
							contLigacoesNovas = contLigacoesNovas + 1;
						}
						//poderia incluir apenas se não existisse o link, mas talvez haja ligações novas. 
						listaLigacaoAdicional.push(
							{"origem":dadosLinkTemp.origem, 
							"destino":dadosLinkTemp.destino, 
							"tipoDescricao":dadosLinkTemp.tipoDescricao
							}
						);
					}
					var bTipoValor = ordenaLigacaoValor(listaLigacaoAdicional);
					var nosNovos=0;
					for(var cont=0,tamanho=nosEntrada.length;cont < tamanho;cont++)	{
						var dadosNosTemp = nosEntrada[cont];
						if (!graph.getNode(dadosNosTemp.id)) { //(dadosNosTemp.length > 7) {
							nosNovos = nosNovos + 1;
							listaNoAdicional.push(
								{"id":dadosNosTemp.id,
								"tipo":dadosNosTemp.tipo, //retornaStrTipo(data.no['0'][chaves[cont]].tipo), 
								"sexo":dadosNosTemp.sexo, 
								"label": dadosNosTemp.label, 							
								"camada":camadaBase + dadosNosTemp.camada, 
								"origem":false,
								"situacao": retornaSituacao(dadosNosTemp.situacao, retornaStrTipo(dadosNosTemp.tipo)),
								"m1": dadosNosTemp.m1,
								"m2": dadosNosTemp.m2,
								"m3": dadosNosTemp.m3,
								"m4": dadosNosTemp.m4,
								"m5": dadosNosTemp.m5,
								"m6": dadosNosTemp.m6,
								"m7": dadosNosTemp.m7,
								"m8": dadosNosTemp.m8,
								"m9": dadosNosTemp.m9,
								"m10": dadosNosTemp.m10,
								"m11": dadosNosTemp.m11
								});
						}
					}
					var tam = nosNovos;
					//tam = nosEntrada.length;
					var resposta = true;
					var tLigacao = '';
					if (contLigacoesNovas>1) {
						tLigacao = ' e ' + contLigacoesNovas + ' novas ligações.';
					} else if ( contLigacoesNovas==1) {
						tLigacao = ' e 1 nova ligacão.';					
					} else {
						tLigacao = ' e não há nova ligação.'
					}
					if (dados['observacao']) {
						tLigacao += '\n\nObservação: ' + dados['observacao'] + '\n\n';
					}
					function fInsereLocal(resposta) { //este código tem que ser levado para antes de if (tam>10)??
						if (!resposta) { return; };
						if ((tam>0) || (listaLigacaoAdicional.length != 0)) {
							adicionarNovosNosELigacoes(noReferencia, listaNoAdicional, listaLigacaoAdicional);
							if (bTipoValor) { //remove icones sem ligacao
								for (var n=0, tn=listaNoAdicional.length; n<tn; n++) {
									var idDoNo = listaNoAdicional[n].id;
									if (graph.getLinks(idDoNo).length==0) {
										removeIdNo(idDoNo);
									}
								}
							}
							if (nome_macro=='macro_grafo1') {
								selecionaListaIdNos(listaIds);	
							}
						}	
					}
					if (bExibeMensagem) {
						if (tam > 20){
							if (bTipoValor) {
								var tvalores='';
								for (var k=0, tk=listaLigacaoAdicional.length;k<tk; k+=Math.floor(tk/4)) {
									var vaux = listaLigacaoAdicional[k].tipoDescricao[Object.keys(listaLigacaoAdicional[k].tipoDescricao)[0]];
									tvalores = tvalores + 'item ' + (k+1) + ' = ' + vaux + '\n...\n';
								}
								jPrompt('Foram localizadas '+ listaLigacaoAdicional.length + ' ligações, por ordem decrescente:\n' + tvalores + '\nEspecifique quantos itens deseja inserir, por exemplo, digite 20 para 20 primeiros maiores itens, ou especifique um intervalo, por exemplo, 10-20', 
										listaLigacaoAdicional.length, 'Sistema Macros', 
										function(quantLigacoes) {
											if (!quantLigacoes) 
												return;
											if (String(quantLigacoes).search('-')==-1) {
												listaLigacaoAdicional.splice(quantLigacoes);
											} else {
												var ini = parseInt(quantLigacoes.split('-')[0])-1;
												listaLigacaoAdicional.splice(0,ini);
												var fim = parseInt(quantLigacoes.split('-')[1]);
												listaLigacaoAdicional.splice(fim);
											}
											fInsereLocal(true);
										}
								);
								return;
							} else {
								jConfirm("Localizados " + tam + " novos elementos" + tLigacao + "Deseja realmente adicioná-los?",'Sistema Macros',fInsereLocal);
								return;
							}
						} else if (tam>1) {
							alerta('Localizados ' + tam +' novos elementos' + tLigacao);
						} else if (tam==1) {
							alerta('Localizado 1 novo elemento' + tLigacao );
						} else {
							alerta('Não há novo elemento' + tLigacao);
						}
					}
					fInsereLocal(true);
				},
				error: function(err){
					alerta("Aconteceu um erro: " + err);	
					$("svg").css("cursor", "default");
				}
			}
			var deferred = dojo.xhrGet(xhrArgs);
		});	
	}; //incluiLigacao_cb
}

function ordenaLigacaoValor(listaLigacaoAdicional) {
	var bTipoValor = true;
	for (var k=0, tam=listaLigacaoAdicional.length;k<tam;k++) {
		var tipoDescricao = listaLigacaoAdicional[k].tipoDescricao;
		var tipos = Object.keys(tipoDescricao);
		for (m=0, tam2=tipos.length; m<tam2; m++) {
			var tipo = tipos[m];
			if (!(((500<=tipo) && (tipo<600)) ||(tipo==421))) { 
				bTipoValor = false;
				break;
			}			
		}
		if (!bTipoValor) 
			break;
	}
	function valor(textoMil) {
		if ((textoMil.substring(textoMil.length-4)==' mil')) {
			var valorMil = parseInt(textoMil.replace(' mil').replace('.',''));
		}	
		return valorMil;
	}
	if (bTipoValor) {
		listaLigacaoAdicional.sort( function(a,b) {
			var h1=a.tipoDescricao, h2=b.tipoDescricao;
			var k1=Object.keys(h1)[0], k2=Object.keys(h2)[0];
			var v1=h1[k1], v2 = h2[k2];
			if (valor(v1) < valor(v2)) {
				return 1;
			} else if (valor(v1) > valor(v2)) {
				return -1;
			} else {
				return 0;
			}
		});
	}
	return bTipoValor;
}

function noIdsLigadosF(listaIds, bTodos) {
	var idsLigados = [];
	for (var k=0, tam=listaIds.length; k<tam; k++) {
		graph.forEachLinkedNode(listaIds[k], function(nodeaux, link){
			if ((nodeaux.data.tipo == 'PF') || (nodeaux.data.tipo == 'PJ')) {
				 //para endereço, cc ou telefone pode ser um só, mas para informação relevante tem que buscar todas
				if (idsLigados.indexOf(nodeaux.id)==-1) {
					idsLigados.push(nodeaux.id);
				}
				if (!bTodos) { 
					return;
				}
			}
		});		
	}
	return idsLigados;
}


function abreJanelaComDados(node) { //xxx
	//window.open("/macros/static/ajudaHtml.html",'texto','height=540,width=800,location');
	var win = null; url='';
	if (node.data.tipo=='DOC') {
		url = node.id.substr(1);
		if (url.startsWith('http')) {
			win = window.open(url);
		} else { //arquivo local ou outras opções
			// url = 'file:///' + url; //não funciona, permissão negada
			url = '/macros/consulta_google?abrirArquivo=' + encodeURIComponent(url); 
			//win = window.open(url); 

			dojo.ready(function(){
				var xhrArgs = {
					url: url,
					handleAs: "json",
					preventCache: true,
					// content: '', 
					load: function(dados){
						$("svg").css("cursor", "default");
						console.log(dados);
						try {
							textoJSON = dados;
							//if (!dados['retorno']) {
							//	alert(Arquivo não disponível);
							//}
						} catch(err) {
						//	tam = -1
							alert("Aconteceu um erro A: " + err);
						}
					},
					error: function(error){	
						alert("Aconteceu um erro B: " + error);
					}
				}
				var deferred = dojo.xhrGet(xhrArgs);
			});				

		}
		return;
	}
	if (node.id.length==11) {
		win = window.open('/macros/pf/macro_cpf/'+ node.id, node.id, 'resizable,scrollbars,status,menubar=no, toolbar=no, personalbar=no, location=no, titlebar=0, height=300, width=500');
	} else if (node.id.length==14) {
		win = window.open('/macros/pj/macro_cnpj/'+ node.id, node.id,'resizable,scrollbars,status,menubar=no, toolbar=no, personalbar=no, location=no, titlebar=0, height=300, width=500');
	}
	
	
	if (win) {
		win.onload = function() {
			var ht = win.document.body.innerHTML;
			//var pa = ht.split('</div>');
			//pa[0]=''; 
			//win.document.body.innerHTML = pa.join('</div>');
			win.document.body.innerHTML = ht.replace(/<(.|\n)*?<\/div>/, ''); //retira tudo antes do primeiro </div>
			win.document.title = node.id;
			if (node.id.length==14) {
				var ht = win.document.body.innerHTML;
				ht = ht.replace(/<td(.|\n)*?<\/td>/, ''); //tira primeiro <td ... </td>
				win.document.body.innerHTML = ht.replace(/<p(.|\n)*?<\/p>/, ''); //tira primeiro <p>... </p>
			} else {
				win.sizeToContent();
			}
		}
	}
}

function expandirCamada1(node) {
	var no;
	var tipo;
	var idligado=''; 
	var idsLigados=[];	
	var listaPFPJ=[],listaTEL=[],listaEND=[],listaCC=[],listaINF=[];
	for (var k=0, tam=gIdNosSelecionados.length; k<tam; k++) {
		no = graph.getNode(gIdNosSelecionados[k]);
		tipo = no.data.tipo;
		if ((tipo=='PF') || (tipo=='PJ')) {
			listaPFPJ.push(no.id);
		} else if (tipo=='TEL') {
			listaTEL.push(no.id);
		} else if (tipo=='END') {
			listaEND.push(no.id);
		} else if (tipo=='CC') {
			listaCC.push(no.id);
		} else if (tipo=='INF') {
			listaINF.push(no.id);
		}
	}
	var bMensagem = true;
	//exibe a mensagem apenas 1 vez
	if (listaPFPJ.length>0) {
		incluiLigacao('macro_grafo1',listaPFPJ,bMensagem);
		//bMensagem = false;
	} 
	if (listaINF.length>0) {
		idLigados = noIdsLigadosF(listaINF,true);
		if (idLigados.length>0) {
			incluiLigacao('macro_informacaorelevante',idLigados, bMensagem);
		}
	}		
	if (listaCC.length>0) {
		idLigados = noIdsLigadosF(listaCC,false);
		if (idLigados.length>0) {
			incluiLigacao('macro_contacorrente',idLigados, bMensagem);
			//bMensagem = false;
		}
	}
	if (listaEND.length>0) {
		idLigados = noIdsLigadosF(listaEND,false);	
		if (idLigados.length>0) {
			incluiLigacao('macro_endnormalizado',idLigados, bMensagem);
			//bMensagem = false;
		}
	} 
	if (listaTEL.length>0) {
		idLigados = noIdsLigadosF(listaTEL,false);
		if (idLigados.length>0) {		
			incluiLigacao('macro_telefone',idLigados, bMensagem);
			//bMensagem = false;
		}
	} 

	return;
}



function expandirCamada1_01(node) {
	if ((node.data.tipo == 'PF') ||(node.data.tipo == 'PJ')) {
		incluiLigacao('macro_grafo1',gIdNosSelecionados,true);
	} else { //busca cpf/cnpj relacionado ao telefone/endereco
		var idligado=''; 
		var idsLigados=[];
		graph.forEachLinkedNode(node.id, function(nodeaux, link){
			if ((nodeaux.data.tipo == 'PF')|| (nodeaux.data.tipo == 'PJ'))
				 //para endereço, cc ou telefone pode ser um só, mas para informação relevante tem que buscar todas
				idsLigados.push(nodeaux.id);
				if (node.data.tipo!='INF') { 
					idligado=nodeaux.id;
					return;
				}
		});
		if (node.data.tipo=='TEL') {
			incluiLigacao('macro_telefone',[idligado], true);
		} else if (node.data.tipo=='END') {
			incluiLigacao('macro_endnormalizado',[idligado], true);
		} else if (node.data.tipo=='CC') {
			incluiLigacao('macro_contacorrente',[idligado], true);
		} else if (node.data.tipo=='INF') {
			for (var k=0, tamaux=idsLigados.length; k<tamaux; k++) {
				incluiLigacao('macro_informacaorelevante', [idsLigados[k]], false); 
			}
		}
	}
}

function carregaNosLigacoesJSON(data) {
	//salvar nós e ligações dos vetores da lista Adicional, antes de usá-los....
	//inserir novos nós e ligações
	var listaLigacaoAdicional=[];
	var listaNoAdicional=[];
	var tam=0, cont;
	var erro;
	var nosNovos = [];
	try {
		ligacaoEntrada = data['ligacao'];
		tam = ligacaoEntrada.length;
	} catch(err) {
		tam = -1
		alerta("Aconteceu um erro: " + err);	
	}
	if (tam==-1) { 
		return;
	} else if (tam==0) { 
		alerta("Não foram encontradas ligações");
		return;
	}
	for (var cont = 0; cont < tam; cont++) {
		dadosLinkTemp = ligacaoEntrada[cont];
		listaLigacaoAdicional.push(
			{"origem":dadosLinkTemp.origem, 
			"destino":dadosLinkTemp.destino, 
			"camada": kcamadaAdicional, 
			"tipoDescricao": dadosLinkTemp.tipoDescricao
			});
		//safety, verifica se os itens já existem.
		if ((dadosLinkTemp.origem.length == 11) || (dadosLinkTemp.origem.length==14)) {
			if (! existeIdNo(dadosLinkTemp.origem)) {		
				nosNovos.push(dadosLinkTemp.origem); 
			}
		}
		if ((dadosLinkTemp.destino.length == 11) || (dadosLinkTemp.destino.length==14)) {
			if (! existeIdNo(dadosLinkTemp.destino)) {				
				nosNovos.push(dadosLinkTemp.destino); 
			}
		}
	}
	var tam, cont, chaves;
	nosEntrada = data['no']
	tam = nosEntrada.length;
	var notasSemLabel = {};
	//var nosNovos = [];
	for(var cont=0;cont < tam;cont++)	{
		var dadosNosTemp = nosEntrada[cont];
		/*
		if  (((!existeIdNo(dadosNosTemp.id))&& ((dadosNosTemp.tipo=='PF')||(dadosNosTemp.tipo=='PJ'))) ||  (!dadosNosTemp.label)) { 
			//se o json não tiver label do cpf,cnpj, isso deve ter vindo da rotina do coaf, por isso pede os dados pro servidor. Se tiver anotação, salva para inserir depois de pegar os dados do servidor
			nosNovos.push(dadosNosTemp.id); 
			if (dadosNosTemp.nota) {
				notasSemLabel[dadosNosTemp.id] = dadosNosTemp.nota;
			}
		} else {
			listaNoAdicional.push(JSON.parse(JSON.stringify(dadosNosTemp)))
		}*/
		//se for tipo pf ou pj e não tiver label, pode ter vindo da rotina coaf. neste caso precisa pegar os dados
		//if  ( (!dadosNosTemp.label) && ((dadosNosTemp.tipo=='PF')||(dadosNosTemp.tipo=='PJ')) )
		if  ( dadosNosTemp.carregarDados ) { // 2019-06-18 OBSERVACAO: carregarDados=True para forçar carregamento de dados, utilizado na rotina coaf
			//se o json não tiver label do cpf,cnpj, isso deve ter vindo da rotina do coaf, por isso pede os dados pro servidor. Se tiver anotação, salva para inserir depois de pegar os dados do servidor
			nosNovos.push(dadosNosTemp.id); //xxx
			if (dadosNosTemp.nota) {
				notasSemLabel[dadosNosTemp.id] = dadosNosTemp.nota;
			}
		} else {
			listaNoAdicional.push(JSON.parse(JSON.stringify(dadosNosTemp)));
		}
	}
	//console.log(nosNovos);
	var dadosNosNovos = importaDadosNos(nosNovos, false);
	for(var cont=0;cont < dadosNosNovos.length;cont++)	{
		if (notasSemLabel[dadosNosNovos[cont].id]) {
			dadosNosNovos[cont].nota = notasSemLabel[dadosNosNovos[cont].id];
		}
		listaNoAdicional.push(JSON.parse(JSON.stringify(dadosNosNovos[cont])));
	}
	function fInsercao(resposta) { //funcao callback para jprompt
		if (resposta == true) {
			adicionarNovosNosELigacoes(null, listaNoAdicional, listaLigacaoAdicional);
		}
	}
	var resposta = true;
	var temp = 0;
	temp = 0 + tam;
	var mens='';
	if (tam > 10){ //se o tamanho for maior que 10, perguntar se o usuário que realmente inserir os nós
		// resposta = confirm("O nó está conectado em " + tam + " elementos.\nDeseja adicionar realmente adicioná-los?");
		mens = "Deseja realmente adicionar " + tam + " elementos?";
		if (data['observacao']) { 
			mens += '\n\nObservação: ' + data['observacao']; 
		}
		jConfirm(mens,'Sistema Macros',fInsercao);
	} else {
		mens='Serão inseridos '+ tam +' elementos.';
		if (data['observacao']) { 
			mens += '\n\nObservação: ' + data['observacao']; 
		}		
		alerta(mens);
		fInsercao(true);
	}
}

function resetaNosSelecionados() {
	selecionaNode('',false);
	carregaMenuLateral("",false); //reseta informações no Menu Lateral
}

function bEstaRenderizando() {
	var botao = document.querySelector('#botao_leiaute_continuar_pausar');
	if (botao.value == 'Pausar') {
		return true;
	} else {
		return false;
	}
}

function rendererContinuarPausar(bresume) {
	//troca estado do leiaute automático
	var botao = document.querySelector('#botao_leiaute_continuar_pausar');
	//var bEstadoBotao = bEstaRenderizando();
	if (! bresume) {
		renderer.pause();
		botao.value = 'Continuar';
	} else {
		renderer.resume();
		botao.value = 'Pausar';
	}
}

function pesquisar() {
	//ids dos campos de busca: nome_a_pesquisar, id_a_pesquisar
	var campoNome, campoId, listaNome=[], listaId=[];
	campoNome = $("#nome_a_pesquisar").attr("value").toUpperCase();
	//campoId = $("#id_a_pesquisar").attr("value").toUpperCase();
	campoId = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(campoNome,".",""),"-",""),",",""),"/",""),"\\","")," ",";");
	var campoIdTeste = replaceAll(campoId, ";","");
	if (/^\d+$/.test(campoIdTeste)) { //só digitos
		listaNome = campoId.split(';');
	} else {
		listaNome = campoNome.replace('|',';','g').split(';');
	}
	var cont=0;
	var idCentralizou = false;
	var localizados = [];
	//var listaNomeEIds = listaNome.concat(campoId.split(';')); 
	for (nomeIt of listaNome) {
		nomeIt = nomeIt.trim();
		if (nomeIt=='') { continue;};
		var nomeId = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(nomeIt,".",""),"-",""),",",""),"/",""),"\\","").trim(); //reduntante para cpf/cnpj
		graph.forEachNode(function(node){
			var tid = '';
			/*
			if (node.data.id) { 
				tid = node.data.id; //por algum motivo, em alguns casos node.data.id está undefined, dando erro se faz node.data.id.search
			} else if (node.id) {
				tid = node.id; 
			}*/
			tid = node.id;
			var achou=false;
			
			/*
			if ((node.data.label.search(nomeIt.toUpperCase())> -1) || //TODO remover acentuação
				(tid.search(nomeIt.toUpperCase())> -1) ||
				(tid.search(campoId)> -1) 
				){ */
			
			if ((node.data.label.search(nomeIt.toUpperCase())> -1)) { //TODO remover acentuação
				achou = true;
				localizados.push(nomeIt);  
			} 
			if  ((nomeId) && ((tid.search(nomeId.toUpperCase())> -1) ||
				(tid.search(nomeId)> -1) ) ){
				achou = true;
				localizados.push(tid);
			}
			if (achou) {
				cont++;
				//é a primeira ocorrência do nome procurado
				//limpar vetor de nós selecionados
				if (cont == 1) {
					resetaNosSelecionados();
				}
				//agora, basta ir adicionando os nós que forem sendo encontrados
				selecionaNode(node,true);
				if (! idCentralizou) { //centraliza no nó localizado
					var position = layout.getNodePosition(node.id);
					renderer.moveTo(position.x,position.y);
					idCentralizou = true;
				}
				graph.forEachLinkedNode(node.id, function(node, link){
					if (link) {
						link.data.selecionado = true;
						graphics.getLinkUI(link.id).attr('stroke', corLinkSelecao );
					}
				});
			} 
		});
	}
	cont = localizados.length;
	if (cont == 0 ) {
		alerta("<"+campoNome+"> não foi encontrado!!!");
	} else {
		if (cont==1) {
			alerta(" Foi encontrada 1(uma) ocorrência contendo  <"+localizados[0]+">.\nO item será destacado com fundo cinza na figura.");
		} else {
			alerta(" Foram encontradas "+cont+" ocorrências contendo <"+localizados.join(', ')+">.\nOs itens serão destacados com fundo cinza nas figuras.");
		}
	}
}


function pesquisar01() {
	//ids dos campos de busca: nome_a_pesquisar, id_a_pesquisar
	var campoNome, campoId;
	campoNome = $("#nome_a_pesquisar").attr("value").toUpperCase();
	campoId = $("#id_a_pesquisar").attr("value").toUpperCase();
	campoId = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(campoId,".",""),"-",""),",",""),"/",""),"\\","");
	campoId = replaceAll(campoId," ",";");
	var cont=0;
	var idCentralizou = false;
	// se ambos os campos possuirem tamanho menor ou igual a três, desconsiderar
	if ((campoNome.length <= 3) && (campoId.length <= 3)) {
		alerta("Os valores informados nos campos de pesquisa\ndevem conter mais de 3 caracteres!!!");
	} else {
		//busca por nome e id
		if (( campoNome.length > 3) && ( campoId.length > 3)) {
			graph.forEachNode(function(node){
				alerta(gNomeNoProcurado+"  "+node.data.label+"  "+node.data.label.search(gNomeNoProcurado));
				if((node.data.label.search(campoNome.toUpperCase())> -1) && (node.id.search(campoId.toUpperCase())> -1)) {
					cont++;
					//é a primeira ocorrência do nome procurado
					//limpar vetor de nós selecionados
					if (cont == 1) {
							resetaNosSelecionados();
					}
					//agora, basta ir adicionando os nós que forem sendo encontrados
					//tempNo = graph.getnode(nodeId);
					if (!idCentralizou) { //centraliza no nó localizado
						var position = layout.getNodePosition(node.id);
						renderer.moveTo(position.x,position.y);
						idCentralizou = true;
					}
					selecionaNode(node,true);
				} 
			});	
			if (cont == 0 ) {
				alerta(" O nome <"+campoNome+"> e o Id <"+campoId+"> não foram encontrados!!!");
			}
		} else {
			//busca por nome
			if(campoNome.length > 3) {
				var listaNome = campoNome.replace('|',';','g').split(';');
				for (nomeIt of listaNome) {
					nomeIt = nomeIt.trim();
					if (nomeIt=='') { continue;};
					graph.forEachNode(function(node){
						if(node.data.label.search(nomeIt.toUpperCase())> -1){
							cont++;
							//é a primeira ocorrência do nome procurado
							//limpar vetor de nós selecionados
							if (cont == 1) {
								resetaNosSelecionados();
							}
							//agora, basta ir adicionando os nós que forem sendo encontrados
							selecionaNode(node,true);
							if (! idCentralizou) { //centraliza no nó localizado
								var position = layout.getNodePosition(node.id);
								renderer.moveTo(position.x,position.y);
								idCentralizou = true;
							}
							graph.forEachLinkedNode(node.id, function(node, link){
								if (link) {
									link.data.selecionado = true;
									graphics.getLinkUI(link.id).attr('stroke', corLinkSelecao );
								}
							});
						} 
					});
				}
				if (cont == 0 ) {
					alerta(" O nome <"+campoNome+"> não foi encontrado!!!");
				} else {
					if (cont==1) {
						alerta(" Foi encontrada 1(uma) ocorrência contendo o nome <"+campoNome+">.\nO item será destacado com fundo cinza na figura.");
					} else {
						alerta(" Foram encontradas "+cont+" ocorrências contendo o nome <"+campoNome+">.\nOs itens serão destacados com fundo cinza nas figuras.");
					}
				}
			} else {	//busca por id
				var listaID = campoId.replace('|',';','g').split(';');
				for (identificadorIt of listaID) {
					identificadorIt = identificadorIt.trim();
					if (identificadorIt =='') { continue; };
					graph.forEachNode(function(node){
						if(node.id.search(identificadorIt.toUpperCase())> -1){
							cont++;
							//é a primeira ocorrência do nome procurado
							//limpar vetor de nós selecionados
							if (cont == 1) {
								resetaNosSelecionados();
							}
							//agora, basta ir adicionando os nós que forem sendo encontrados
							selecionaNode(node,true);
							if (! idCentralizou) { //centraliza no nó localizado
								var position = layout.getNodePosition(node.id);
								renderer.moveTo(position.x,position.y);
								idCentralizou = true;
							}
							graph.forEachLinkedNode(node.id, function(node, link){
								if (link) {
									link.data.selecionado = true;
									graphics.getLinkUI(link.id).attr('stroke', corLinkSelecao );
								}
							});
						} 
					});
				}
				if (cont == 0 ) {
					alerta(" O Id <"+campoId+"> não foi encontrado!!!");
				} else if (cont>1) {
					alerta("Foram localizados " + cont + " cpfs/cnpjs");
				}
			}
		}					
	}
}

function selecionaGrupo(nodeGrupo) {
	var ngrupo = nodeGrupo.data.grupo;
	var lista = [];
	if (ngrupo==undefined) {
		alerta('Opção apenas disponível para Rede de Relacionamento de Lista.');
		return;
	}
	graph.forEachNode(function(node){
		if (node.data.grupo == ngrupo) {
			lista.push(node.id);
		}
	});
	if (lista.length == 0 ) {
		alerta('Não foram encontrados itens');
	} else {
		selecionaListaIdNos(lista);
	}
}

function abrirJanela(caminho) {
	window.open('/macros/static/ajudaHtml.html');
}


//------------------------------------------------------download Teste--------------------------------------------------------------
function onDownload() {
	uriContent = "data:application/octet-stream;filename=filename.txt," + encodeURIComponent("abcdef");
	novajanela = window.open(uriContent, 'filename.txt');

}

//Renderiza o gráfico
function renderiza(){
	//layout.run(10);
	renderer.run();
}


function walkTheDOM2(root, func) {
	var node = root;
	start: while (node) {
		func(node);
		if (node.firstChild) {
			node = node.firstChild;
			continue start;
		}
		while (node) {
			if (node === root) {
				break start;
			}
			if (node.nextSibling) {
				node = node.nextSibling;
				continue start;
			}
			node = node.parentNode;
		}
	}
}

function ajustaCaminhoDaImagemSVG(node) {
	// troca caminho da imagem no arquivo svg para ser exibida corretamente quando offline
	var tem=false;
	try {
		tem = node.hasAttribute('xlink:href');
	} catch (e) {};
	if (tem) {   
		var linque =node.getAttribute('xlink:href');
		if (linque.startsWith('/macros/static/images/')) {
			linque=linque.replace('/macros/static/images/',caminhoImagem);
			node.setAttribute('xlink:href',linque);
		}
	}
};

function imprimirGrafo() {
	var mwin;
	mwin = window.open("", "Gráfico","scrollbars=yes,menubar=no,toolbar=no,resizable=yes,status=no, personalbar=no, location=no");
	mwin.document.write('<style type="text/css">	html, body, svg  {	width: 100%;height: 100%;margin: 0;	overflow:hidden;} #borderContainer {width: 100%;height: 100%;}	.centralizado { margin: 0 auto;	text-align: left;} </style></head>');
	mwin.document.write('<body class="claro">	<div id="principal" style="width: 100%; height: 100% "> ');
	mwin.document.write(document.getElementsByTagName('svg')[0].outerHTML.replace(/text\-anchor="middle" fill="\w*"/g,'text-anchor="middle" fill="black"').replace(/text\-anchor="middle" fill="#\w*"/g,'text-anchor="middle" fill="black"'));
	mwin.document.write("</body></html>");
	mwin.document.close();
	mwin.document.body.onload=window.print;  
	mwin.focus();
}

function reiniciarGrafo() {
	jConfirm("Deseja reiniciar o gráfico? As alterações serão perdidas. Não será possível reverter.",'Sistema Macros',
		function(resposta) {
			if (resposta==true) {
				javascript:history.go(0);
			}		
		}
	);	
}

function grafoOnline() {
	if (document.URL.startsWith('https:')) { 
		return true; 	
	} else if (document.URL.startsWith('http:')) { 
		return true; 	
	} else {
		return false;
	}	
}
function baseURL() {
	if (grafoOnline()) {
		return '';
	} else {
		return 'https://app.cgu.gov.br';
	}
}

var SelecaoRetangular={};

SelecaoRetangular.Setup = function() {
	/*seleção retangular */
	var multiSelectOverlay;
	document.addEventListener('keydown', function(e) {
		if (e.which === 17 && !multiSelectOverlay) { // ctrl key
			multiSelectOverlay = SelecaoRetangular.startMultiSelect(graph, renderer, layout);
		}
	});
	document.addEventListener('keyup', function(e) {
		if (e.which === 17 && multiSelectOverlay) {
			multiSelectOverlay.destroy();
			multiSelectOverlay = null;
		}
	});
}

SelecaoRetangular.startMultiSelect = function(graph, renderer, layout) {
	var graphics = renderer.getGraphics();
	var domOverlay = document.querySelector('.graph-overlay');
	var overlay = SelecaoRetangular.createOverlay(domOverlay);
	overlay.onAreaSelected(handleAreaSelected);
  
	return overlay;

	function handleAreaSelected(area) {
		// For the sake of this demo we are using silly O(n) implementation.
		// Could be improved with spatial indexing if required.
		var topLeft = graphics.transformClientToGraphCoordinates({
		  x: area.x,
		  y: area.y
		});

    var bottomRight = graphics.transformClientToGraphCoordinates({
		x: area.x + area.width,
		y: area.y + area.height
    });

    graph.forEachNode(higlightIfInside);
    renderer.rerender();

    return;

    function higlightIfInside(node) {
		var nodeUI = graphics.getNodeUI(node.id);
		if (isInside(node.id, topLeft, bottomRight)) {
			selecionaNode(node,true);
		}
    }
	
	function isInside(nodeId, topLeft, bottomRight) {
		var nodePos = layout.getNodePosition(nodeId);
		return ((topLeft.x < nodePos.x) && (nodePos.x < bottomRight.x) &&
			(topLeft.y < nodePos.y) && (nodePos.y < bottomRight.y));
    }
  }
}

SelecaoRetangular.createOverlay = function(overlayDom) {
	var selectionClasName = 'graph-selection-indicator';
	var selectionIndicator = overlayDom.querySelector('.' + selectionClasName);
	if (!selectionIndicator) {
		selectionIndicator = document.createElement('div');
		selectionIndicator.className = selectionClasName;
		overlayDom.appendChild(selectionIndicator);
	}	

	var notify = [];
	var dragndrop = Viva.Graph.Utils.dragndrop(overlayDom);
	var selectedArea = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};
	var startX = 0;
	var startY = 0;

	dragndrop.onStart(function(e) {
		startX = selectedArea.x = e.clientX;
		startY = selectedArea.y = e.clientY;
		selectedArea.width = selectedArea.height = 0;
		updateSelectedAreaIndicator();
		selectionIndicator.style.display = 'block';
	});

	dragndrop.onDrag(function(e) {
		recalculateSelectedArea(e);
		updateSelectedAreaIndicator();
		notifyAreaSelected();
	});

	dragndrop.onStop(function() {
		selectionIndicator.style.display = 'none';
	});

	overlayDom.style.display = 'block';

	return {
		onAreaSelected: function(cb) {
			notify.push(cb);
		},
		destroy: function () {
			overlayDom.style.display = 'none';
			dragndrop.release();
		}
	};

	function notifyAreaSelected() {
		notify.forEach(function(cb) {
			cb(selectedArea);
		});
	}

	function recalculateSelectedArea(e) {
		var bcr = document.getElementById('principal').getBoundingClientRect();
		selectedArea.width = Math.abs(e.clientX - startX);
		selectedArea.height = Math.abs(e.clientY - startY);
		selectedArea.x = Math.min(e.clientX, startX)- bcr.x;
		selectedArea.y = Math.min(e.clientY, startY)- bcr.y;
	}

	function updateSelectedAreaIndicator() {
		var bcr = document.getElementById('principal').getBoundingClientRect();
		selectionIndicator.style.left = (selectedArea.x) + 'px';
		selectionIndicator.style.top = (selectedArea.y) + 'px';
		selectionIndicator.style.width = selectedArea.width + 'px';
		selectionIndicator.style.height = selectedArea.height + 'px';
	}	
}

/* Para usar a seleção retangular, criar a seguinte função depois de scale na função svgGraphics() em vivagraph.js
		transformClientToGraphCoordinates :  function (position) {
            var p = svgRoot.createSVGPoint(),
                t = svgContainer.getCTM(),
                origin = svgRoot.createSVGPoint().matrixTransform(t.inverse());

            p.x = 0;//dx;
            p.y = 0; //dy;

            p = p.matrixTransform(t.inverse());
            p.x = (p.x - origin.x) * t.a;
            p.y = (p.y - origin.y) * t.d;

            t.e += p.x;
            t.f += p.y;
			//return {scale:t.d, ox:t.e,oy:t.f};
			var pos={};
			pos.x = (position.x - t.e) / t.d;
			pos.y = (position.y - t.f) / t.d;

			return pos;
		},
*/

var selectElement = function(element){
  if(window.getSelection){
    //console.log('window.getSelection');
    var range = document.createRange();
    range.selectNodeContents(element);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange( range );
  }else if(document.selection){
    //console.log('document.selection');
    var range = document.body.createTextRange();
    range.moveToElementText(element);
    range.select();
  }else{
    //console.error('COULDN\'T SELECT :/');
  }
};

var copiaElemento = function(elementId) {
	var element = document.getElementById(elementId);
	if (element) {
		selectElement(element);
		document.execCommand('copy');
	}
};



function contaNosF() {
	var cont = 0;
	graph.forEachNode( function(node) {
		cont++;
		}
	);
	return cont;
}

function atualizaContagemNos() {
	$('#informacaoItens').text(contaNosF() + ' itens');
}

function mainGrafo() {
	if (navigator.userAgent.search('Firefox') == -1) {
		if (navigator.userAgent.search('Chrome') != -1) {
			alerta('O Gráfico de Relacionamentos não é compatível com este navegador. Muitas opções funcionam apenas no FIREFOX!!');
		}
		// define função startwith no chrome
		if (typeof String.prototype.startsWith != 'function') {
			String.prototype.startsWith = function (str){
				return this.slice(0, str.length) == str;
			};
		}
	}
	if (grafoOnline()) { //opção para salvar o grafo offline.
		caminhoImagem = "/macros/static/images/"; //pasta, deve ser adicionado ao nome dos arquivos de imagem abaixo:
	} else {
		//se estiver offline, pega nome da pasta definida pelo firefox, na hora do "salvar como"
		caminhoImagem = $("#frameImagens").children()[0].src.split("/").reverse()[1] +"/";
	};		
	if (!grafoOnline()) { //se o arquivo estiver offline, remove svg já existente
		var svgAnterior = document.getElementsByTagName('svg')[0];
		if (svgAnterior) {
			walkTheDOM2(svgAnterior, ajustaCaminhoDaImagemSVG); //ajusta caminho das imagens
			
			var resp = confirm("Deseja ver a versão Interativa do GRÁFICO DO SISTEMA MACROS?.\nPressione OK para ver a versão interativa somente com situação inicial\ne que pode ser manipulada,\nou pressione CANCEL para ver o gráfico estático com alterações.\nMuitas opções (como exportação) \nnão estarão disponíveis offline.");
			if (!resp) {
				return;
			}
			svgAnterior.remove();
			
			/*
			jConfirm("Deseja ver a versão Interativa do GRÁFICO DO SISTEMA MACROS?.\nPressione OK para ver a versão interativa somente com situação inicial\ne que pode ser manipulada,\nou pressione CANCEL para ver o gráfico estático com alterações.\nMuitas opções (como exportação) \nnão estarão disponíveis offline.","Sistema Macros",
				function(resp) {
					if (resp) {
						svgAnterior.remove();
					}
					// é preciso colocar todo o código de maingrafo que vem depois também dentro desta função
				}
			);	
			*/
		}			
	}
		
	layout = Viva.Graph.Layout.forceDirected(graph, {
	   springLength : comprimento, //80,
	   springCoeff : 0.0002,
	   dragCoeff : 0.02, //0.002,
	   gravity : gravidade, //-4.2,
	   theta : 0.03
	});
	//var 
	renderer = Viva.Graph.View.renderer(graph,                  
	{                       
		layout     : layout,                       
		graphics   : graphics,                       
		container  : document.getElementById('principal'),                       
		renderLinks : true,
		prerender :  true //passosIniciais //50
	});				
	//renderiza();
	//renderer.run(); //removido com o vivagraph 0.7
	//renderer.pause(); //meio estranho, mas é preciso rodar renderer.run() senão dá erro  //removido com o vivagraph 0.7

	criaMarcador();
	//criaMarcadorTextoLigacao(); 2014-06-20 substituido, texto de ligação não é mais por marcador	
	var podaArvore = false;
	var listaGrupos = [];
	var grupos;
	var nosAInserir = noLigacao.no.length;
	if (noLigacao.no.length>kgrandeQuantidadeDeNos) {
		alert('ATENÇÃO!!!! Este gráfico é grande (' + nosAInserir + ' itens) e talvez não seja possível visualizá-lo neste navegador. Verifique primeiro o resultado obtido no gráfico da Rede Central. Outras opções: a) importar o arquivo xls no aplicativo i2 Analyst\'s Notebook; b) diminuir o número de camadas; c) diminuir o número de elementos da lista; d) selecionar menos opções de tipo de ligação, por exemplo, remova filiais ou endereços. e) incluir uma lista de exclusão, para remover os cpfs/cnpjs que têm muitos vínculos ou não são relevantes para a consulta.'  );
		var numeroDeGrupos = numeroDeGruposF();
		if (numeroDeGrupos>0) {
			var grupos = prompt('Há '+ numeroDeGrupos + ' grupos no gráfico, total de ' + nosAInserir + ' itens. Como o gráfico é grande, selecione os grupos para exibir, separados por vírgulas (por exemplo, 2,10 para exibir o grupo 2 e 10, ou 2-10 para exibir os grupos neste intervalo), ou clique OK para tentar exibir todos os itens. A quantidade de itens por grupo é decrescente, o grupo nº 1 é com maior quantidade de itens.','');	
			//var textoBarraLateral=$('#informacoesBarra').text();
			if (grupos) {
				$('#informacaoGrupos').text('Grupos:' + grupos );
			}
		} 
	}
	configuraNos();		
	configuraLinks();			
	nosAInserir = carregaListasIniciais(noLigacao,grupos);	
	if ((grupos=='') && (nosAInserir>kgrandeQuantidadeDeNos)) {
		if (confirm('ATENÇÃO!!!! Este gráfico é grande (' + nosAInserir + ' itens). Deseja podar a árvore, removendo os itens que tem apenas 1 ligação?')) {
			excluiNosPoda(false);
		}
	}
	//mostraTextoDeNo(false);
	for (var i = 0; i < passosIniciais; i++) {
		layout.step();
	};
	//mostraTextoDeLigacao(true);
	//mostraTextoDeNo(true);
	renderer.run();
	//setTimeout(function() { renderer.pause();}, 60000);
	renderizaPausaEmSegundos(60);
	setTimeout(renderer.reset, 61); //centraliza	
	/* //2018-08-28 talvez isso seja confuso, o usuário pode não ler a mensagem e ver um gráfico incompleto sem saber
	if ((camada>1) && (contaNosF()>kgrandeQuantidadeDeNos)) {
		selecaoExibirOcultar_executaOpcao(2); //oculta rótulo de ligação
		selecaoExibirOcultar_executaOpcao(5); //oculta camada 3			
		selecaoExibirOcultar_executaOpcao(6); //oculta outras camadas
		if (camada==2) {
			selecaoExibirOcultar_executaOpcao(4); // oculta camada 2	
		}
		alerta('ATENÇÃO!!! Este gráfico tem ' + nosAInserir + ' itens. Para facilitar a visualização, a ÚLTIMA CAMADA E O TEXTO DAS LIGAÇÕES FORAM OCULTADAS!! Para reexibí-las, use as opções em Exibir/Ocultar no painel lateral.');
	}	//mostraTextoDeLigacao(false);
	*/
	SelecaoRetangular.Setup();
	atualizaContagemNos();
	if (ehCelular()) {
			graphics.resetScale();
	}
};

/*
function importSVG() {
	var s = window.btoa(new XMLSerializer().serializeToString(document.getElementsByTagName('svg')[0]));
	var encodedData = window.btoa(s);
	
	var b64 =btoa(document.getElementsByTagName('svg')[0].outerHTML);
	var newWindow = window.open("", "something","scrollbars=0, toolbar=0, width="+myImage.width+", height="+myImage.height);
	var myImage = new Image;
    //newWindow.document.write(myImage.outerHTML);
	newWindow.document.write(myImage.outerHTML);

	var myImage = new Image;
    myImage.style.border = 'none';
    myImage.style.outline = 'none';
    myImage.style.position = 'fixed';
    myImage.style.left = '0';
    myImage.style.top = '0';
	myImage.src = 'data:image/svg+xml;base64,' + s;
	//myImage.onload = function() {        
      var newWindow = window.open("", "something","scrollbars=0, toolbar=0, width="+myImage.width+", height="+myImage.height);
          newWindow.document.write(myImage.outerHTML);
	//}
}
*/


function redeGoogle(gRightClickNo) { //xxx experimental, busca de identificadores, o busca_flask.py deve estar rodando
	palavraBusca = prompt('Digite palavras de busca', gRightClickNo.data.label);
	if (!palavraBusca) { return; }
	var textoJSON = '';
	$("svg").css("cursor", "wait"); 
	var strUrl = '/macros/consulta_google?param=' + encodeURIComponent(palavraBusca) + '&nome=' + encodeURIComponent(gRightClickNo.data.label) + '&id=' + encodeURIComponent(gRightClickNo.id);
	dojo.ready(function(){
		var xhrArgs = {
			url: strUrl,
			handleAs: "json",
			preventCache: true,
			// content: '', 
			load: function(dados){
				$("svg").css("cursor", "default");
				console.log(dados);
				try {
					textoJSON = dados;
					carregaNosLigacoesJSON(textoJSON);
					//alert('resultado: ' + dados);
				} catch(err) {
				//	tam = -1
					alert("Aconteceu um erro 1: " + err);
				}
			},
			error: function(error){	
				alert("Aconteceu um erro 2: " + error);
			}
		}
		var deferred = dojo.xhrGet(xhrArgs);
	});	

	
}

function redeDocumento(gRightClickNo) {//xxx experimental, 
	palavraBusca = prompt('Digite uma url ou arquivo', 'C:\\Users\\tomita\\Downloads\\Guy Debord_Sociedade do espetáculo.pdf'); //'https://www.valor.com.br/politica/5973401/moro-admite-nao-incorporar-cgu-e-reforca-importancia-do-coaf');
	if (!palavraBusca) { return; }
	var textoJSON = '';
	$("svg").css("cursor", "wait"); 
	var strUrl = '/macros/consulta_google?url=' + encodeURIComponent(palavraBusca) + '&nome=' + gRightClickNo.data.label + '&id=' + gRightClickNo.id;
	dojo.ready(function(){
		var xhrArgs = {
			url: strUrl,
			handleAs: "json",
			preventCache: true,
			// content: '', 
			load: function(dados){
				$("svg").css("cursor", "default");
				console.log(dados);
				try {
					textoJSON = dados;
					carregaNosLigacoesJSON(textoJSON);
					//alert('resultado: ' + dados);
				} catch(err) {
				//	tam = -1
					alert("Aconteceu um erro 1: " + err);
				}
			},
			error: function(error){	
				alert("Aconteceu um erro 2: " + error);
			}
		}
		var deferred = dojo.xhrGet(xhrArgs);
	});	
}

function redeBloquearItem(gRightClickNo) {
	var strUrl = '/macros/consulta_google?';
	if (gRightClickNo.data.tipo=='DOC') {
		strUrl += 'url=' + encodeURIComponent(gRightClickNo.id.substr(1)) + '&block=yes';
	} else if (gRightClickNo.data.tipo=='IDE') {
		strUrl += 'param=' + encodeURIComponent(gRightClickNo.data.label) + '&block=yes';
	} else {
		return;
	}
	$("svg").css("cursor", "wait"); 
	dojo.ready(function(){
		var xhrArgs = {
			url: strUrl,
			handleAs: "json",
			preventCache: true,
			// content: '', 
			load: function(dados){
				$("svg").css("cursor", "default");
				console.log(dados);
				try {
					textoJSON = dados;
					//carregaNosLigacoesJSON(textoJSON);
					//alert('resultado: ' + dados);
				} catch(err) {
				//	tam = -1
					alert("Aconteceu um erro 1: " + err);
				}
			},
			error: function(error){	
				alert("Aconteceu um erro 2: " + error);
			}
		}
		var deferred = dojo.xhrGet(xhrArgs);
	});		
	
}