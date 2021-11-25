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
	inicio = false; //XXX
	if (inicio == true)	{
		if (MudaCorDeRelacionamentos == true) {
			dados.cor = retornaCorDoRelacionamento(dados.linkId);
		} else {
			dados.cor = dados.cor;
		}
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
		//verificar se possuem mesmo id e descricação
		var listaIDInicial = linkAux.data.linkId.split("_");
		var listaLabelInicial = linkAux.data.label.split(",");
		var listaIDNovo = dados.linkId.split("_");
		var listaLabelNovo = dados.label.split(",");
		//var listaIDtemp = [];
		//var listaLabeltemp = [];
		var listaIDsAIncluir=[], listaLabelsAIncluir=[];
		for (var k=0, tamaux=listaIDNovo.length; k<tamaux; k++) {
			var indice = listaIDInicial.indexOf(listaIDNovo[k]);
			if (indice==-1) { //não encontrado, tipo novo
				listaIDsAIncluir.push(listaIDNovo[k]);
				//listaLabelsAIncluir.push(listaLabelNovo[k]); //isso não funciona, porque o label e o id podem ter k diferente
			}
		}
		for (var k=0, tamaux=listaLabelNovo.length; k<tamaux; k++) {
			var indice = listaLabelInicial.indexOf(listaLabelNovo[k]);
			if (indice==-1) { //não encontrado, tipo novo
				//listaIDsAIncluir.push(listaIDNovo[k]);
				listaLabelsAIncluir.push(listaLabelNovo[k]);
			}
		}
		//if (listaIDsAIncluir.length==0) { //nada a fazer, todos os tipos já estavam na ligação
		if (listaLabelsAIncluir.length==0) { //nada a fazer, todos os tipos já estavam na ligação
			return;
		}
		var dadosLinkTemp = dadosLink;						
		dadosLinkTemp.linkId = linkAux.data.linkId+"_"+listaIDsAIncluir.join("_");
		dadosLinkTemp.label = linkAux.data.label+","+listaLabelsAIncluir.join(",");						
		dadosLinkTemp.camada = linkAux.data.camada;
		if (MudaCorDeRelacionamentos == true)	{
			dadosLinkTemp.cor = retornaCorDoRelacionamento(linkAux.data.linkId); //listaLigacaoAdicional[cont].cor;
		} else	{
			dadosLinkTemp.cor = linkAux.data.cor;
		}
		dadosLinkTemp.sentidoUnico = linkAux.data.sentidoUnico;
		dadosLinkTemp.id = dados.id;
		dadosLinkTemp.camada = dados.camada;
		if (!invertido) { //o link anterior vai ter prioridade na direção.
			//removeLigacao(linkAux.toId,linkAux.fromId);		
			removeLigacao(noOrigem,noDestino);		
			return graph.addLink(noOrigem, noDestino, JSON.parse(JSON.stringify(dadosLinkTemp)));	
		} else {
			//removeLigacao(linkAux.fromId,linkAux.toId);
			removeLigacao(noDestino,noOrigem);
			return graph.addLink(noDestino, noOrigem, JSON.parse(JSON.stringify(dadosLinkTemp)));	
		}
		//return graph.addLink(noOrigem, noDestino, JSON.parse(JSON.stringify(dadosLinkTemp)));	
	};

	if(encontrado == false)	{
		//caso contrário, adicionar ligação
		//antes, verificar se o nó origem e destino existem
		if( existeIdNo(noOrigem) && existeIdNo(noDestino))	{
			var dadosLinkTemp = dadosLink;
			dadosLinkTemp.camada = dados.camada;
			dadosLinkTemp.label = dados.label;
			dadosLinkTemp.linkId = dados.linkId;
			if (MudaCorDeRelacionamentos == true) {
				dadosLinkTemp.cor = retornaCorDoRelacionamento(dados.linkId);
			} else	{
				dadosLinkTemp.cor = dados.cor;
			}
			dadosLinkTemp.sentidoUnico = dados.sentidoUnico;
			dadosLinkTemp.id = 	contadorLink();
			//atualizar listaLigacaoInicial
			return graph.addLink(noOrigem, noDestino, JSON.parse(JSON.stringify(dadosLinkTemp)));
		} else	{
			//console.log('tentou inserir ligacao em no previamente definido ' + noOrigem + '-' + noDestino); 			
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

function carregaListasIniciais(noLigacao) {
	var listaDeNos = noLigacao['no'];
	var listaLigacoes = noLigacao['ligacao'];
	//var keysx = Object.keys(listaDeNos);
	for ( var i = 0, tamanho = listaDeNos.length; i < tamanho ; i++ ) {
		var dadosNosTemp=listaDeNos[i];
		dadosNosTemp.avatar =  retornAvatar(dadosNosTemp.tipo, dadosNosTemp.id, dadosNosTemp.sexo, dadosNosTemp.situacao);
		dadosNosTemp.corFonte = retornaCorFonteNaCamada(dadosNosTemp.camada);
		dadosNosTemp.tamanhoFonte = dadosNos.tamanhoFonte;			
		dadosNosTemp.tipo = dadosNosTemp.tipo.toUpperCase();
		//if ({{camadaLimite}} >= dadosNosTemp.camada) {
			if (dadosNosTemp.camada == 0) {
				dadosNosTemp.origem = true;
			}

		adicionaNo(dadosNosTemp.id,dadosNosTemp, false); //adicionaNo(dadosNosTemp.id,dadosNosTemp, false);	

		dadosNosTemp.origem = false;
		
	}
	for (var i = 0, arrayLength = listaLigacoes.length; i < arrayLength; i++) {
		var dadosLinkTemp = listaLigacoes[i];
		if (dadosLinkTemp.camada == 1){
			dadosLinkTemp.cor = "#0000FF";
		} else {
			dadosLinkTemp.cor = "gray";
			//dadosLinkTemp.sentidoUnico = true;
		}
		dadosLinkTemp.sentidoUnico = ehSentidoUnico(dadosLinkTemp.label);

		//adicionaLink(dadosLinkTemp.origem,dadosLinkTemp.destino, dadosLinkTemp, true);		
		adicionaLink(dadosLinkTemp.origem,dadosLinkTemp.destino, dadosLinkTemp, false);	//poderia ser true, mas existe casos raros em que a ligação em sentido contrário - firma que é contadora e filial	

		//teste de links duplos
		//adicionaLink("{{linha.id_dest}}","{{linha.id_orig}}", dadosLinkTemp);	
	}	

}



//adiciona Novos Nós e Ligações, partindo do Nó de Referência
function adicionarNovosNosELigacoes(noReferencia, listaNoAdicional, listaLigacaoAdicional)	{
	//se o nó de referência não foi passado 
	//não faço nada
	/*
	if (noReferencia != null) { //acrescentando
		if(!(noReferencia.length > 1)) //o id do nó não deve ter tamanho 1
		{
			return 0;
		}
	}
	*/
	var nosInseridos = []; //reinicia lista de nós inseridos nesta operação
	var dadosNosTemp = dadosNos;
	var cNosLigacoes = 0; //conta quantos links ou nos foram criados. Só resume layout se tiver sido adicionado algo
	for(var cont=0, tam = listaNoAdicional.length; cont < tam; cont++)	{
		dadosNosTemp.camada = listaNoAdicional[cont].camada;
		dadosNosTemp.tipo = listaNoAdicional[cont].tipo;
		dadosNosTemp.sexo = listaNoAdicional[cont].sexo;
		dadosNosTemp.label = listaNoAdicional[cont].label;
		dadosNosTemp.avatar = listaNoAdicional[cont].avatar;
		//dadosNosTemp.avatarSelecionado = listaNoAdicional[cont].avatarSelecionado;
		dadosNosTemp.tamanhoFonte = dadosNos.tamanhoFonte;
		dadosNosTemp.corFonte = listaNoAdicional[cont].corFonte;
		dadosNosTemp.situacao = listaNoAdicional[cont].situacao;
		dadosNosTemp.origem = listaNoAdicional[cont].origem;	
				
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
		//passar elementos da lista de Adicional para a lista inicial
		if (adicionaNo(listaNoAdicional[cont].id,dadosNosTemp, false)) { //true);
			cNosLigacoes++;
			nosInseridos.push(listaNoAdicional[cont].id);
		}
		//listaNoInicial.push(listaNoAdicional[cont]); //isso já ´é feito em adicionaNo
	}
	
	if (nosInseridos.length !=0) {
		gHistoricoIdNosInseridos.push(nosInseridos);
	}
	var dadosLinkTemp=dadosLink;
	//console.log('tamanho ' + listaLigacaoAdicional.length);
	var noPinado = false;
	if (noReferencia && (nosInseridos.indexOf(noReferencia) == -1)) { 
		noPinado = layout.isNodePinned(graph.getNode(noReferencia));	
		if (!noPinado) {
			layout.pinNode(graph.getNode(noReferencia),1);		
		}
	}
	for(var cont=0, tam = listaLigacaoAdicional.length; cont < tam; cont++)	{
		dadosLinkTemp.camada = listaLigacaoAdicional[cont].camada;
		dadosLinkTemp.label = listaLigacaoAdicional[cont].label;
		dadosLinkTemp.linkId = listaLigacaoAdicional[cont].linkId;
		dadosLinkTemp.cor = listaLigacaoAdicional[cont].cor;
		dadosLinkTemp.sentidoUnico = ehSentidoUnico(dadosLinkTemp.label); //listaLigacaoAdicional[cont].sentidoUnico;
		if (adicionaLink(listaLigacaoAdicional[cont].origem,listaLigacaoAdicional[cont].destino, dadosLinkTemp, false)) {
			cNosLigacoes++;
		}
		//passar elementos da lista de Adicional para a lista inicial
		//listaLigacaoInicial.push(listaLigacaoAdicional[cont]); //já é feito em adicionaLink
	}
	if (cNosLigacoes !=0) {
		//setTimeout(function() { renderer.pause(); }, Math.sqrt(listaLigacaoAdicional.length)*3000);
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

function replaceAll(string, token, newtoken) {
	if (!string) { return ''; } ;
	while (string.indexOf(token) != -1) {
		string = string.replace(token, newtoken);
	}
	return string;
}

function retornaCorDoRelacionamento(listaID) {
	retorno = "Silver";
	if (( listaID.search("100") > -1) || 
		( listaID.search("101") > -1) ||
		( listaID.search("104") > -1) ||
		( listaID.search("105") > -1))	{
		retorno = "DarkOrange";
	}else {
		if (( listaID.search("103") > -1) )	{
			retorno = "Blue";
		}else {
			if (( listaID.search("106") > -1) )	{
				retorno = "Black";
			}else	{
				if (( listaID.search("401") > -1) ||
					( listaID.search("402") > -1) ||
					( listaID.search("403") > -1) ||
					( listaID.search("404") > -1) ||
					( listaID.search("405") > -1) ||
					( listaID.search("406") > -1) ||
					( listaID.search("407") > -1) ||
					( listaID.search("408") > -1) ||
					( listaID.search("409") > -1) ||
					( listaID.search("410") > -1) ||
					( listaID.search("411") > -1) ||
					( listaID.search("412") > -1) ||
					( listaID.search("127") > -1) 
				){
					retorno = "Green";
				}else	{
					if ( listaID.search("102") > -1)	{
						retorno = "Cyan";
					} else{
						if ( listaID.search("128") > -1){
							retorno = "Khaki";
						} else	{
							if (( listaID.search("160") > -1) ||
								( listaID.search("162") > -1) ||
								( listaID.search("161") > -1))	{
								retorno = "mediumpurple";
							}
						}
					}

				}
			}
		}
	}
	//alert(listaID+"_"+retorno);	
	return retorno;
}
//------------grafoRelacionamento.html
function retornaStrTipo(tipo) {
	var r = "PJ";
	if ( tipo >  limiteTipoPJ )	{
		r = "PF";
	}
	return r;
}

function retornAvatar(tipo, id, sexo, situacao) {	
	if (tipo=="PF")	{
		if (situacao==0) { //situacao==0 ativa
			if (sexo==1) {
				avatar = 'icone-grafo-masculino.png';
			} else if (sexo==2) {
				avatar = 'icone-grafo-feminino.png';
			} else {
				avatar ='icone-grafo-desconhecido.png';
			}
		} else {
			if (sexo==1) {
				avatar = 'icone-grafo-masculino-inativo.png';
			} else if (sexo==2) {
				avatar = 'icone-grafo-feminino-inativo.png';
			} else {
				avatar ='icone-grafo-desconhecido.png';
			}			
		}
	} else if (tipo=="PJ")	{
		if (id.slice(8,12) =="0001") { //matriz
			avatar = (situacao==2)?'icone-grafo-empresa.png':'icone-grafo-empresa-inativo.png';
		} else { //filial
			avatar = (situacao==2)?'icone-grafo-empresafilial.png':'icone-grafo-empresafilial-inativo.png';											
		}
	} else if (tipo=="TEL")	{
		avatar = 'icone-grafo-telefone.png';		
	} else if (tipo=="END")	{
		avatar = 'icone-grafo-endereco.png';		
	} else if (tipo=="CC")	{
		avatar = 'icone-grafo-conta.png';		
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
		corFonte="Red";
	} else if (camada == 1) {
		corFonte="Black";
	} else if (camada ==2) {
		corFonte="DodgerBlue";
	} else if (camada == 3) {
		g3camada = true;
		corFonte="Green";
	} else if (camada == 4) {
		corFonte="GoldenRod";
	} else {
		corFonte="SaddleBrown"; //corPadrao;
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
		// points to the link presentation object.
		//alert(link.data.cor);
		//if (link.data.selecionado == false)	{
		if (!link.data.selecionado)	{
			graphics.getLinkUI(link.id).attr('stroke', isOn ? 'red' : link.data.cor );
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
									.attr('fill','red')
									.attr('font-size',node.data.tamanhoFonte)
									.attr('text-anchor','middle')
									.text(link.data.label);
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

function ajustaCorDeFundoDaImagem(node,selecionado) {
	var nodeUI=graphics.getNodeUI(node.id);
	var cor;
	if (selecionado==true) {
		cor = 'red';
	} else {
		cor= 'white';
		if (node.data.camada==0) {
			cor = 'orange';
		}		
	} //cor = (selecionado)?'red':'white';
	for (var c=0;c<nodeUI.children.length;c++) { 
		if ((nodeUI.children[c].tagName=='rect') && (nodeUI.children[c].getAttribute('tipo')=='fundo')) { 
			nodeUI.children[c].setAttribute('fill',cor);
			break; //muda a cor do primeiro retângulo, que é fundo. Existe outro retângulo que é a faixa 'falecido' ou informação relevante
			//nodeUI.children[c].setAttribute('stroke',cor);
		} 
	}	
}

var selecionaNoIdNaoUtilizada = function(nodeId, isSelect) { //esta função não é utilizada
	// just enumerate all realted nodes and update link color:
	graph.forEachLinkedNode(nodeId, function(node, link){
		// link.ui is a special property of each link
		// points to the link presentation object.
		link.data.selecionado = isSelect;
		graphics.getLinkUI(link.id).attr('stroke', isSelect ? 'red' : link.data.cor );
	});
};

function selecionaListaIdNos(listaNoIds) { //listaNos = lista de no.id's
	var tempNo;	
	//selecionaIdNo(null, false);
	resetaNosSelecionados();
	for (var i=0, tam=listaNoIds.length; i<tam; i++) {
		tempNo = graph.getNode(listaNoIds[i]);
		if (tempNo) {
			ajustaCorDeFundoDaImagem(tempNo, true);
			gIdNosSelecionados.push(tempNo.id); 
		};
	}
}

function selecionaIdNo(no, isSelect) { 
	var tempNo;
	//Se isSelect=true, selecionar o nó e adicioná-lo no vetor
	//Se isSelect=false, remover todos os nós do vetor e remover seleção.
	if (isSelect == true) {
		//nodeId não pode ser nulo, nem vazio
		//tempNo = graph.getnode(nodeId);
		//no.data.ref.children().attr('xlink:href',caminhoImagem + no.data.avatarSelecionado);
		ajustaCorDeFundoDaImagem(no,true);
		gIdNosSelecionados.push(no.id);
		graph.forEachLinkedNode(no.id, function(node, link){ //destaca links
			link.data.selecionado = true;
			graphics.getLinkUI(link.id).attr('stroke', 'red' );
		});
	} else {
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
	}
};
	
function excluirNo(node) {
	var resposta = confirm("Deseja realmente excluir o Nó "+node.data.label+" ?");
	if (resposta==true) {
		//graph.removeNode(node.id)
		removeIdNo(node.id);
	}
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

function ligarNos(node) {
	if(gNoArmazenado==null) {
		alerta("Não há nó armazenado!!!");
	} else {
		if(gNoArmazenado.id==node.id) {
			alerta("Os nós de origem e de destino são os mesmos.");
		} else {
			var resposta = confirm("Deseja realmente unir o Nó "+node.data.label+" ao Nó "+gNoArmazenado.data.label+" ?");
			if (resposta==true) {
				dadosLink.linkId = "000";
				dadosLink.id=contadorLink();
				/* //código original
				dadosLink.label = prompt('Digite o texto da ligação','');
				adicionaLink(node.id,gNoArmazenado.id,dadosLink,false);
				//graph.addLink(node.id, gNoArmazenado.id, dadosLink);
				renderizaPausaEmSegundos(2);
				*/
				/* usando funcao interna
				function aposPrompt(retorno) {
					dadosLink.label = retorno;
					adicionaLink(node.id,gNoArmazenado.id,dadosLink,false);
					//graph.addLink(node.id, gNoArmazenado.id, dadosLink);
					renderizaPausaEmSegundos(2);					
				
				};
				promptj('Digite o texto da ligação','','Sistema Macros',aposPrompt); */
				jPrompt('Digite o texto da ligação','','Sistema Macros',
					function(retorno) {
						dadosLink.label = retorno;
						adicionaLink(node.id,gNoArmazenado.id,dadosLink,false);
						renderizaPausaEmSegundos(2);					
					}
				);
			}
		}

	}
};

function fixarNo(node){
	layout.pinNode(node,!layout.isNodePinned(node));
};

function eliminaRelacionamento(dropdown) {
	//alert($("#selFiltro input").attr("value"));
	//valorTipo = $("#selFiltro input").attr("value"); //isso não funciona com dojo 1.9
	var valorTipo = dropdown.value;
	//valorTipo = dijit.byId('selFiltro').value; 
	if (valorTipo=='') { return; }
	//dijit.byId('selFiltro').set('value', ''); //retorna ao default do option
	dropdown.value = '';
	if (valorTipo=='ESC') { 
		excluiNosSoltos();
		return;
	} else if (valorTipo=='E1C') {
		excluiNosFolha();
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
	}

	var relacionamentosAExcluir = [];
	graph.forEachLink(function(link){
		tempLink = link; //apenas para debugar no navegador
		if (link.data.linkId == valorTipo) {
			relacionamento = {
				"origem": link.fromId,
				"destino": link.toId /*,
				"dados": {
					"label":link.data.label,
					"linkId":link.data.linkId,
					"cor":link.data.cor,
					"camada":link.data.camada								
				}*/
			};
			relacionamentosAExcluir.push(relacionamento);
		}
	});

	if (relacionamentosAExcluir.length==0) {
		alert ('Não foram encontradas ligações do tipo selecionado.');
		return;
	} else if (relacionamentosAExcluir.length==1) {
		if (!confirm('Deseja realmente remover a ligação? Não será possível reverter.')) {
			return;
		}
	} else {
		if (!confirm('Deseja realmente remover as ' + relacionamentosAExcluir.length + ' ligações? Não será possível reverter.')) {
			return;
		}
	}
	for (var c=0, cmax=relacionamentosAExcluir.length; c<cmax; c++)	{   
		relacionamento = relacionamentosAExcluir[c];
		removeLigacao(relacionamento.origem , relacionamento.destino );
	}
};

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
	}
	return true;
};

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

function ocultarCamada(camada,ocultar){
	graph.forEachNode(function(node) {
		if ((node.data.camada == camada) || ((camada==4) && (node.data.camada >= 4))) {
			if (ocultar == true) {
				graph.forEachLinkedNode(node.id, function(node, link) {
					link.data.ref.hide(); 
				});
				node.data.ref.hide();
			} else {
				graph.forEachLinkedNode(node.id, function(node, link) {
					link.data.ref.show();
				});
				node.data.ref.show();
			}
		}
	});
};	

var abreRelatorio = function (cpfcnpj){
	window.blur();		
	window.opener.Dossie.dossie(cpfcnpj);

	window.opener.focus();
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
	excluirIdNosDeLista(listaParaRemover);
};

function excluiNosFolha() {
	var temp =0;	
	var listaParaRemover = [];	
	graph.forEachNode(function(node) {
		if (node) {
			temp = 0 + graph.getLinks(node.id).length;
			if ((temp == 1) && (node.data.origem != true)) {
				//alert("excluir");
				//significa que o nó não tem ligação
				listaParaRemover.push(node.id);
				//removeIdNo(node.id);
			}
		}
	});
	excluirIdNosDeLista(listaParaRemover);
};

function excluirIdNosDeLista(lista) {
	if (lista.length==0) {
		alerta('Não há itens do tipo selecionado');
		return;
	}
	selecionaListaIdNos(lista);
	resp = confirm('Deseja remover ' + lista.length + ' itens? Não será possível reverter.')
	//resetaNosSelecionados();
	if (resp) {
		for (var i=0, tam=lista.length; i<tam; i++) {
			removeIdNo(lista[i]);
		}
	}
}

function excluiPFInativo() { 
	var listaParaRemover = [];
	graph.forEachNode(function(node) {
		if (node) {
			if ((node.data.tipo == 'PF') && (node.data.situacao != 0)) {
				listaParaRemover.push(node.id);
				//removeIdNo(node.id);
			}
		}
	});
	excluirIdNosDeLista(listaParaRemover);
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
	excluirIdNosDeLista(listaParaRemover);
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
	excluirIdNosDeLista(listaParaRemover);
};

function excluiNoTipo(tipo) { 
	var listaParaRemover = [];
	graph.forEachNode(function(node) {
		if (node) {
			if (node.data.tipo == tipo) {
				listaParaRemover.push(node.id);
			}
		}
	});
	excluirIdNosDeLista(listaParaRemover);
};

function inserirNo() {
	var noIn = prompt("Digite o CPF/CNPJ a inserir \n", "");
	var items = noIn.replace('|',';','g').split(';'); // | também é caractere separador
	//for (var c=0,tam=items.length;c<tam;c++) {
	for (item of items) {
		item = item.trim();
		if (item=='') { continue; };
		no = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(item,".",""),"-",""),",",""),"/",""),"\\","");
		//alert(no+"  "+no.length);
		if ((no.length == 11) || (no.length==14)) {
			//alert("no "+no);
			incluiLigacao('macro_grafo1','',no); //era incluiLigacao('macro_cnpj','',no);
			//alert("A consulta foi encaminhada");
		} else {
			if (no.length != 0) {
				alerta("CPF/CNPJ inválido:" + no);
			};
		}
	}
};

var marcarComoOrigem = function() {
	//procurar o no na lista de No inicial

	//setar origem como verdadeiro

	//substituir figura

	//mais fácil excluir, mudar o valor e incluir --> problema, será necessário reincluir todos os links...

};

var abreGoogle = function (node){
	var strUrl='';
	if (node.data.tipo == 'END') {
		//strUrl = 'https://www.google.com/?#q='+node.data.label;	
	} else if ((node.data.tipo=='PF') || (node.data.tipo='PJ')) {
		strUrl = 'https://www.google.com/?#q="'+node.data.label+'"';		
	}
	if (strUrl == '') { return; }
	var novaJanela=window.open(strUrl);
	novaJanela.focus();
	//window.open('https://www.google.com/?#q="paulo maluf"','_newtab');
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
		<!--"/macros/verfoto/{{dados.cnpj|cut:"-"|cut:"."|cut:"/"}}/principal"-->
	if (carregar == false)	{
		//$("#menu_foto").html("<img src=\"/macros/static/images/desconhecido-foto-grafo.jpg\"  style=\"width: 150px;\">");
		$("#menu_foto").html("");
		$("#menu_nome").html("");
		$("#menu_cpfcnpj").html("");
		///macros/verfoto/{{dados.cnpj|cut:"-"|cut:"."|cut:"/"}}/principal
	} else	{	
		if ((node.data.tipo == 'PF') || (node.data.tipo == 'PJ') || (node.data.tipo == 'ES')) {
			//$("#menu_foto").html("<img src=\"/macros/verfoto/"+node.id+"/principal\"  style=\"width: 150px;\" alt=\"Carregando foto...\">");
			$("#menu_nome").html("<b>Nome</b>: "+node.data.label.substr(0,50));
			$("#menu_foto").html("<img src=" +  caminhoImagem + node.data.avatar + " style=\"height: 150px;\" alt=\"Carregando foto...\">");
			if ((node.data.tipo == 'PF') || (node.data.tipo == 'PJ')) {
				$("#menu_cpfcnpj").html('<b>'+(node.id.length == 11 ? "CPF" : "CNPJ")+'</b>:' + '<a href="javascript:abreRelatorio(' + "'" + node.id + "'" + ');" title="Abre Relatório na Aba principal">' + formataCPFCNPJ(node.id) + '</a>');
				
			} else {
				$("#menu_cpfcnpj").html("<b>"+(node.id.length == 11 ? "CPF" : "CNPJ")+"</b>: "+formataCPFCNPJ(node.id));
			}
			if (grafoOnline()) {
				dojo.ready(function(){
					var xhrArgs = {
						url: "/macros/temfoto/" + node.id,
						handleAs: "json",
						load: function(data){
							var tam=0, cont;
							try {
								temFoto = data['temFoto'];
								if (temFoto) {
									$("#menu_foto").html("<img src=\"/macros/verfoto/"+node.id+"/principal\"  style=\"width: 150px;\" alt=\"Carregando foto...\">");
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
		///macros/verfoto/{{dados.cnpj|cut:"-"|cut:"."|cut:"/"}}/principal
	}

}

function postJsonStr() {
	var jsonstr = "";
	//var formato = dijit.byId('selFormatoDownload').get('value');
	var formato = document.getElementById("selFormatoDownload").value;
	if (formato=="svg")	{
		jsonstr = converteParaSVG();
		alerta("SVG (Scalable Vector Graphics) pode ser aberto no Internet Explorer.\nÉ um grafico vetorial, em que pode ser feito zoom sem perda de definição.\nPara gerar um svg com todo o gráfico,\nreduza primeiro a visualização com a roda do mouse.\nO arquivo resultante estará compactado. \nDescompacte antes de abrir no Internet Explorer.\nNo Internet Explorer o arquivo SVG poderá ser salvo como JPG ou PNG.");
		//alert(jsonstr);
	} else {
		jsonstr = converteParaJSON();
	}
	var ifr = document.getElementById('iframeDownload');
	ifr.onload = null;
	var ifrDoc = ifr.contentDocument || ifr.contentWindow.document;
	var form = ifrDoc.getElementById( 'formGrafoConversor' );
	form.jsonstr.value = jsonstr;
	form.action = "/macros/grafo/conversor/" + formato;
	form.submit();
	//dijit.byId('selFormatoDownload').set('value', '');
	document.getElementById("selFormatoDownload").value='';
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
	console.log(nosAIncluir);
	var listaLigacaoAdicional = [], listaNoAdicional = [];
	var contLigacoesNovas = 0;
	//alert(IsObject(data));
	var nosNovos=0;
	$("svg").css("cursor", "wait");
	xhrArgs = {
		url: "/macros/grafo/conversor/lista",
		sync: true, 
		//content: JSON.stringify({'no':nosAIncluir}),
		//content: {'no':nosAIncluir},
		content: {'no':nosAIncluir.join(',')},
		load: function(data){
			var tam=0, cont, nosEntrada;
			try {
				dados= JSON.parse(data);
				nosEntrada = dados['no'];	
				//console.log(JSON.stringify(nosEntrada));
				tam = nosEntrada.length;
			} catch(err) {
				alerta("Aconteceu um erro: " + err + '\nTalvez a sessão tenha se expirado.');				
				tam = -1
			}
			if (tam==-1) { 
				return;
			}
			if (tam==0){ 
				alerta("Os cpfs/cnpjs informados não foram localizados.");
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
						"avatar": retornAvatar(dadosNosTemp.tipo, dadosNosTemp.id, dadosNosTemp.sexo, dadosNosTemp.situacao),
						"tamanhoFonte": dadosNos.tamanhoFonte,								
						//"corFonte": corFonteCamadaAdicional, 
						//"camada":99,
						"corFonte": retornaCorFonteNaCamada(99), //retornaCorFonteNaCamada(camadaBase + dadosNosTemp.camada), //corFonteCamadaAdicional, 
						"camada": 99, //camadaBase + dadosNosTemp.camada, //99, 
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
		//if (existeIdNo(id_origem) && existeIdNo(id_destino)) {
			listaLigacaoAdicional.push(
				{"origem":id_origem, 
				"destino":id_destino, 
				"label":textoLigacao,
				"linkId":'000', //dadosLinkTemp.linkId,//dadosLinkTemp.tipo.join('_'),
				"cor":corCamadaAdicional, 
				"camada": 99, 
				"sentidoUnico": true // ehSentidoUnico(textoLigacao)
				//"sentidoUnico": data.ligacao['1'][cont].sentidoUnico
				});
		//}
		//alert("Adicionando "+data.ligacao['1'][cont].tipo+" "+data.ligacao['1'][cont].descricao);
	}
	adicionarNovosNosELigacoes(null, listaNoAdicional, listaLigacaoAdicional);
	$("svg").css("cursor", "default");
	renderizaPausaEmSegundos(10);	
}



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
				"avatar": node.data.avatar,
				//"avatarSelecionado": node.data.avatarSelecionado,
				"tamanhoFonte": node.data.tamanhoFonte,
				"corFonte": node.data.corFonte, 
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
				"m11": node.data.m11
			});						
		}
	);
	graph.forEachLink(function(link){
		ligacoesAux.push(
			{"origem":link.fromId,
			"destino":link.toId ,
			"label":link.data.label,
			"linkId":link.data.linkId,
			"cor":link.data.cor,
			"camada":link.data.camada,
			"sentidoUnico": ehSentidoUnico(link.data.label) }
		);
	});
	//return dojo.toJson({'no':nosAux, 'ligacao':ligacoesAux});
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

function converteParaSVG() {
	//ver http://d3export.housegordon.org/ exemplo para exportação svg		
	var svg_xml = (new XMLSerializer).serializeToString(document.getElementsByTagName('svg')[0]); 
	//var svg_xml = (new XMLSerializer).serializeToString(graphics.getSvgRoot()); 
	//svg_xml = replaceAll(svg_xml,'style="cursor: default;"',''); //isso é adicionado quando se coloca o cursor de espera		
	//svg_xml = replaceAll(svg_xml,'xlink:href="/macros/static/images/','xlink:href="icones/'); //ajusta caminho das imagens, para visualizar os ícones, deve haver uma pasta "icones" com os ícones desconhecido...
	svg_xml = replaceAll(svg_xml,'xmlns:xlink="http://www.w3.org/1999/xlink"',''); //esse link é acrescentado em campo de texto, causando erro no svg
	svg_xml = svg_xml.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" '); //define namespace para link
	return svg_xml;
	//return '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">'  + svg_xml + '</svg>'; 
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
	renderizaPausaEmSegundos(5);
}

function renderizaPausaEmSegundos(segundos) { // se segundos=0, usa tempo
	gTemporizadorLayout++;
	renderer.resume();
	setTimeout(
		function() { 
			gTemporizadorLayout--;
			if (gTemporizadorLayout==0) { //pausa somente se todos os pedidos de pausa terem expirado
				renderer.pause(); 
			}
		}, 
		segundos*1000
	);
}

function incluiLigacao(nome_macro, mensagem, idTemp) {
	//alert(gRightClickNo.data.tipo+" "+gRightClickNo.id);
	var strUrl = '';
	var noReferencia;
	var nome_rotina = nome_macro;
	var camadaBase = 99;
	var ligacaoEntrada, nosEntrada;
	if (nome_macro == 'macro_grafo') {
		var camadaConsulta = camadaLimite;
		camadaConsulta = prompt('Digite a camada do grafico a partir do nó selecionado:',camadaLimite);
		if (!camadaConsulta) { 
			return; 
		} else if (camadaConsulta==1) {
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
		camadaBase = 99;
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
			camadaBase = noTemp.data.camada;
			if ((nome_macro=='macro_endnormalizado') || (nome_macro=='macro_telefone') || (nome_macro=='macro_contacorrente')) {
				camadaBase = camadaBase + 2;
			}			
		}

	}
	if (nome_macro=='macro_grafo_lista') {
		//var camadaConsulta = camadaLimite;
		var numeroLista = 0;
		numeroLista = prompt("Digite o numero da lista.\n Observação: a lista deve ter a macro \n'Rede de Relacionamentos' e estar concluída.");
		if (! numeroLista) { return; }
		strUrl = "/macros/cs/macro_grafo/" + numeroLista + '/json/';
	} else if ((nome_macro=='macro_grafo') || nome_macro.startsWith('macro_grafo')) {
		strUrl = strUrl + '/json/';
	} else {
		strUrl = strUrl + '/ligacao/';
	}

	var listaLigacaoAdicional=[];
	var listaNoAdicional=[];

	$("svg").css("cursor", "wait"); //$("*").css("cursor", "wait");
	//alert("incluiLigacao"+strUrl);
	//-----------------------------------------------------------------------------------------------------
	dojo.ready(function(){
		//var targetNode = dojo.byId("licenseContainer");
		var xhrArgs = {
			//url: "/macros/{{tipo}}/{{mnemonico}}/{{cpfcnpj}}/",
			url: strUrl,
			handleAs: "json",
			preventCache: true,
			load: function(data){
				$("svg").css("cursor", "default");
				//salvar nós e ligações dos vetores da lista Adicional, antes de usá-los....
				//inserir novos nós e ligações
				var tam=0, cont;
				try {
					ligacaoEntrada = data['ligacao'];
					tam = ligacaoEntrada.length;
					nosEntrada = data['no'];	
					//tam = data.ligacao['1'].length;
				} catch(err) {
					tam = -1
					alerta("Aconteceu um erro: " + err + '\nTalvez a sessão tenha se expirado.');
					//alert("Não foram encontradas ligações");
					//return;
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
					//dadosLinha = myStringArray[i];
					dadosLinkTemp = ligacaoEntrada[cont];
				//for(cont=0;cont < tam;cont++)	{
					//alert("origem:"+data.ligacao['1'][cont].id_orig+" destino:"+data.ligacao['1'][cont].id_dest+" label:"+data.ligacao['1'][cont].descricao+" linkId:"+data.ligacao['1'][cont].tipo+" cor:"+corCamadaAdicional);							
					//if ((!graph.hasLink(dadosLinkTemp.origem,dadosLinkTemp.destino)) && (!graph.hasLink(dadosLinkTemp.destino,dadosLinkTemp.origem))) {
					if (!graph.hasLink(dadosLinkTemp.origem,dadosLinkTemp.destino)) {
						contLigacoesNovas = contLigacoesNovas + 1;
					}
					//poderia incluir apenas se não existisse o link, mas talvez haja ligações novas. 
					listaLigacaoAdicional.push(
						{"origem":dadosLinkTemp.origem, 
						"destino":dadosLinkTemp.destino, 
						"label":dadosLinkTemp.label,
						"linkId":dadosLinkTemp.linkId,//dadosLinkTemp.tipo.join('_'),
						"cor":corCamadaAdicional, 
						"camada": 99, 
						"sentidoUnico": ehSentidoUnico(dadosLinkTemp.label)
						//"sentidoUnico": data.ligacao['1'][cont].sentidoUnico
						});
				
					//alert("Adicionando "+data.ligacao['1'][cont].tipo+" "+data.ligacao['1'][cont].descricao);
				}
				
				//alert(IsObject(data));
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
							"avatar": retornAvatar(dadosNosTemp.tipo, dadosNosTemp.id, dadosNosTemp.sexo, dadosNosTemp.situacao),
							"tamanhoFonte": dadosNos.tamanhoFonte,								
							//"corFonte": corFonteCamadaAdicional, 
							//"camada":99,
							"corFonte": retornaCorFonteNaCamada(camadaBase + dadosNosTemp.camada), //corFonteCamadaAdicional, 
							"camada":camadaBase + dadosNosTemp.camada, //99, 
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
					tLigacao = ' e ' + contLigacoesNovas + ' novas ligacoes.';
				} else if ( contLigacoesNovas==1) {
					tLigacao = ' e 1 nova ligacão.';					
				} else {
					tLigacao = ' e não há nova ligação.'
				}
				if (tam > 10){
					resposta = confirm("Localizados " + tam + " novos elementos" + tLigacao + "Deseja realmente adicioná-los?");
					if (resposta==false) { return; }
				} else if (tam>1) {
					alerta('Localizados ' + tam +' novos elementos' + tLigacao);
				} else if (tam==1) {
					alerta('Localizado 1 novo elemento' + tLigacao );
				} else {
					alerta('Não há novo elemento' + tLigacao);
				}
				//if ((tam>0) || (contLigacoesNovas>0)) { 
				if ((tam>0) || (listaLigacaoAdicional.length != 0)) {
					adicionarNovosNosELigacoes(noReferencia, listaNoAdicional, listaLigacaoAdicional);
				}
			},
			error: function(err){
				alerta("Aconteceu um erro: " + err + '\nTalvez a sessão tenha se expirado.');	
				$("svg").css("cursor", "default");
			}
		}
		var deferred = dojo.xhrGet(xhrArgs);
	});	
}


function carregaNosLigacoesJSON(data) {
	//salvar nós e ligações dos vetores da lista Adicional, antes de usá-los....
	//inserir novos nós e ligações
	var listaLigacaoAdicional=[];
	var listaNoAdicional=[];
	var tam=0, cont;
	var erro;
	try {
		ligacaoEntrada = data['ligacao'];
		tam = ligacaoEntrada.length;
		//tam = data.ligacao['1'].length;
	} catch(err) {
		tam = -1
		alerta("Aconteceu um erro: " + err + '\nTalvez a sessão tenha se expirado.');	
		//alert("Não foram encontradas ligações");
		//return;
	}
	if (tam==-1) { 
		return;
	} else if (tam==0) { 
		alerta("Não foram encontradas ligações");
		return;
	}
	for (var cont = 0; cont < tam; cont++) {
		//dadosLinha = myStringArray[i];
		dadosLinkTemp = ligacaoEntrada[cont];
	//for(cont=0;cont < tam;cont++)	{
		//alert("origem:"+data.ligacao['1'][cont].id_orig+" destino:"+data.ligacao['1'][cont].id_dest+" label:"+data.ligacao['1'][cont].descricao+" linkId:"+data.ligacao['1'][cont].tipo+" cor:"+corCamadaAdicional);							
		listaLigacaoAdicional.push(
			{"origem":dadosLinkTemp.origem, 
			"destino":dadosLinkTemp.destino, 
			"label":dadosLinkTemp.label,
			"linkId":dadosLinkTemp.linkId,//dadosLinkTemp.tipo.join('_'),
			"cor":corCamadaAdicional, 
			"camada": 99, 
			"sentidoUnico": ehSentidoUnico(dadosLinkTemp.label)
			//"sentidoUnico": data.ligacao['1'][cont].sentidoUnico
			});
		//alert("Adicionando "+data.ligacao['1'][cont].tipo+" "+data.ligacao['1'][cont].descricao);
	}
	var tam, cont, chaves;
	//tam = data.no['0'].length;
	nosEntrada = data['no']
	tam = nosEntrada.length;
	//alert(IsObject(data));
	//alert(tam);
	//se o tamanho for maior que 10, perguntar se o usuário que realmente inserir os nós
	var resposta = true;
	var temp = 0;
	temp = 0 + tam;
	if (tam > 10){
		resposta = confirm("O nó está conectado em " + tam + " elementos.\nDeseja realmente adicioná-los?");
	} else {
		alerta('O nó está conectado em '+ tam +' elementos.');
	}
	if (resposta == true) {
		for(var cont=0;cont < tam;cont++)	{
			var dadosNosTemp = nosEntrada[cont];
			if (true) { //(dadosNosTemp.length > 7) {
				//alert("id:"+chaves[cont]+" tipo:"+retornaStrTipo(data.no['0'][chaves[cont]].tipo)+" label:"+data.no['0'][chaves[cont]].descricao+ " avatar:"+ retornAvatar(data.no['0'][chaves[cont]].tipo, false)+" avatarSelecionado:"+ retornAvatar(data.no['0'][chaves[cont]].tipo, true)+" corFonte:"+ corFonteCamadaAdicional);
				listaNoAdicional.push(
					{"id":dadosNosTemp.id,
					"tipo":dadosNosTemp.tipo, //retornaStrTipo(data.no['0'][chaves[cont]].tipo), 
					"sexo":dadosNosTemp.sexo, 
					"label": dadosNosTemp.label, 
					"avatar": retornAvatar(dadosNosTemp.tipo, dadosNosTemp.id, dadosNosTemp.sexo, dadosNosTemp.situacao),
					"corFonte": dadosNosTemp.corFonte, //corFonteCamadaAdicional, //retornaCorFonteNaCamada(camadaLimite + dadosNosTemp.camada), // 
					"camada": dadosNosTemp.camada, //99, //camadaLimite + dadosNosTemp.camada, //99, 
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
		//adicionarNovosNosELigacoes(noReferencia);
		adicionarNovosNosELigacoes(null, listaNoAdicional, listaLigacaoAdicional);
	}
}



function resetaNosSelecionados() {
	var tempNo;
	for (var c=0, elementos = gIdNosSelecionados.length; c < elementos ;c++) {
		//tempNo=gIdNosSelecionados.pop();
		//tempNo.data.ref.children().attr('xlink:href',caminhoImagem + tempNo.data.avatar); 
		tempNo = graph.getNode(gIdNosSelecionados[c]);
		if (tempNo) {
			ajustaCorDeFundoDaImagem(tempNo,false);
			graph.forEachLinkedNode(tempNo.id, function(node, link){
				if (link) {
					link.data.selecionado = false;
					graphics.getLinkUI(link.id).attr('stroke', link.data.cor );
					//graphics.getLinkUI(link.id).attr('stroke', link.data.cor );
				}
			});
		}

	}
	gIdNosSelecionados = [];
	//reseta informações no Menu Lateral
	carregaMenuLateral("",false);
}


function pesquisar() {
	//ids dos campos de busca: nome_a_pesquisar, id_a_pesquisar
	var campoNome, campoId;
	campoNome = $("#nome_a_pesquisar").attr("value").toUpperCase();
	campoId = $("#id_a_pesquisar").attr("value").toUpperCase();
	campoId = replaceAll(replaceAll(replaceAll(replaceAll(replaceAll(campoId,".",""),"-",""),",",""),"/",""),"\\","");
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
					//node.data.ref.children().attr('xlink:href',node.data.avatarSelecionado);
					//node.data.ref.children().setAttribute('xlink:href', caminhoImagem + node.data.avatarSelecionado); 
					ajustaCorDeFundoDaImagem(node,true);
					gIdNosSelecionados.push(node.id);
					graph.forEachLinkedNode(node.id, function(node, link){
						if (link) {
							link.data.selecionado = true;
							graphics.getLinkUI(link.id).attr('stroke', 'red' );
						}
					});
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
						//alert(gNomeNoProcurado+"  "+node.data.label+"  "+node.data.label.search(gNomeNoProcurado));
						if(node.data.label.search(nomeIt.toUpperCase())> -1){
							cont++;
							//é a primeira ocorrência do nome procurado
							//limpar vetor de nós selecionados
							if (cont == 1) {
								resetaNosSelecionados();
							}
							//agora, basta ir adicionando os nós que forem sendo encontrados
							//tempNo = graph.getnode(nodeId);
							//node.data.ref.children().attr('xlink:href',caminhoImagem + node.data.avatarSelecionado);
							ajustaCorDeFundoDaImagem(node,true);
							gIdNosSelecionados.push(node.id);
							if (! idCentralizou) { //centraliza no nó localizado
								var position = layout.getNodePosition(node.id);
								renderer.moveTo(position.x,position.y);
								idCentralizou = true;
							}
							graph.forEachLinkedNode(node.id, function(node, link){
								if (link) {
									link.data.selecionado = true;
									graphics.getLinkUI(link.id).attr('stroke', 'red' );
								}
							});
						} 
					});
				}
				if (cont == 0 ) {
					alerta(" O nome <"+campoNome+"> não foi encontrado!!!");
				} else {
					if (cont==1) {
						alerta(" Foi encontrada 1(uma) ocorrência contendo o nome <"+campoNome+">.\nO item será destacado com fundo vermelho na figura.");
					} else {
						alerta(" Foram encontradas "+cont+" ocorrências contendo o nome <"+campoNome+">.\nOs itens serão destacados com fundo vermelho nas figuras.");
					}
				}
			} else {	//busca por id
				var listaID = campoId.replace('|',';','g').split(';');
				for (identificadorIt of listaID) {
					identificadorIt = identificadorIt.trim();
					if (identificadorIt =='') { continue; };
					graph.forEachNode(function(node){
						//alert(gNomeNoProcurado+"  "+node.data.label+"  "+node.data.label.search(gNomeNoProcurado));
						if(node.id.search(identificadorIt.toUpperCase())> -1){
							cont++;
							//é a primeira ocorrência do nome procurado
							//limpar vetor de nós selecionados
							if (cont == 1) {
								resetaNosSelecionados();
							}
							//agora, basta ir adicionando os nós que forem sendo encontrados
							//tempNo = graph.getnode(nodeId);
							//node.data.ref.children().attr('xlink:href',caminhoImagem + node.data.avatarSelecionado);
							ajustaCorDeFundoDaImagem(node,true);
							gIdNosSelecionados.push(node.id);
							if (! idCentralizou) { //centraliza no nó localizado
								var position = layout.getNodePosition(node.id);
								renderer.moveTo(position.x,position.y);
								idCentralizou = true;
							}
							graph.forEachLinkedNode(node.id, function(node, link){
								if (link) {
									link.data.selecionado = true;
									graphics.getLinkUI(link.id).attr('stroke', 'red' );
								}
							});
						} 
					});
				}
				if (cont == 0 ) {
					alerta(" O Id <"+campoId+"> não foi encontrado!!!");
				} 
			}
		
		}					
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
		//if (linque.substring(0,'/macros/static/images/'.length)=='/macros/static/images/') {
		if (linque.startsWith('/macros/static/images/')) {
			linque=linque.replace('/macros/static/images/',caminhoImagem);
			node.setAttribute('xlink:href',linque);
		}
	}
	//console.log(node.img);
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

function mainGrafo() {
	if (navigator.userAgent.search('Firefox') == -1) {
		if (navigator.userAgent.search('Chrome') == -1) {
			alerta('O Gráfico de Relacionamentos não é compatível com este navegador. Utilize o FIREFOX!.');
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
		}			
	}
	
	//substituindo função do Vivagraph para centralizar o gráfico no início da execução (não funciona com vivagraph 0.7
	/*
	Viva.Graph.Utils.getDimension = function (container) {
		if (!container) {
			throw {
				message : 'Cannot get dimensions of undefined container'
			};
		}
		// TODO: Potential cross browser bug.
		var width = container.clientWidth;
		var height = container.clientHeight;
		//--------------------------Sistema Macros 
		// Solução provisória para problema de centralização do gráfico
		// Pensar em uma forma melhor de fazer isso.
		if (height == 0 ) {
			height = window.document.body.clientHeight;
			if ((width - 160) > 0) {
				width = width - 150;
			}
		}
		//------------------------------------------------------
		return {
			left : 0,
			top : 0,
			width : width,
			height : height
		};
	};
	*/
	
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
			
	configuraNos();		
	configuraLinks();	
	//mostraTextoDeLigacao(true);	
	carregaListasIniciais(noLigacao);	
	//carregarNosELigacoes();
	for (var i = 0; i < passosIniciais; i++) {
		layout.step();
	};
	renderer.run()
	//setTimeout(function() { renderer.pause();}, 60000);
	renderizaPausaEmSegundos(60);
	setTimeout(renderer.reset, 61); //centraliza	
	
};


