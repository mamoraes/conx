<script type="text/javascript">

// adaptado de http://jsfiddle.net/ibigd/z7ymfpmm/
var graph = Viva.Graph.graph();
var graphics = Viva.Graph.View.svgGraphics();

var gparam = {};
	gparam.inicio = {{parametros|tojson}};
	gparam.inserirDefault = gparam.inicio.inserirDefault;
	gparam.listaImagens = gparam.inicio.listaImagens;
	gparam.nodeSize = 20; //24
	gparam.tamanhoFonte = 10;
	gparam.corLigacaoLink = 'seagreen';
	gparam.bMostraLigacao = true;
	gparam.kligacoes = 0;
	gparam.btextoEmbaixoIcone = gparam.inicio.btextoEmbaixoIcone;
	//gparam.idLigacoes = {};
	gparam.idnoSelecionado = null;
	gparam.idNosSelecionados = new Set();
	gparam.listaIdNosInseridos = [];
	gparam.confirmaAntesDeInserirNNos = 100;
	gparam.renderer = null;
	gparam.layout = null;
	gparam.geom = null;
	gparam.ultimoToque = 0;
	gparam.inicioToque = 0;
	gparam.mobile = false;
	gparam.safari = false;
	gparam.eventclick = 'click'; //no safari ='touchend'
	gparam.numeroInsercoes = 0;
	//gparam.bRotulosCompletos = true;
	gparam.kTipoRotulo = 0; //rotulo completo,
	gparam.AreaSelecaoRetangular = {};
	gparam.springLength=150;
	gparam.bRenderAtivado = true;
	gparam.fScale = graphics.scale;

// variáveis globais
var base = '/rede/',
	gdebug = null,
	markerSeta = null,
	defs = null,
	menu = null;

/*
createMarker = function(id) {
	return Viva.Graph.svg('marker')
	.attr('id', id)
	.attr('viewBox', '0 0 10 10')
	.attr('refX', '10')
	.attr('refY', '5')
	.attr('markerUnits', 'strokeWidth')
	.attr('markerWidth', '10')
	.attr('markerHeight', '5')
	.attr('orient', 'auto')
	.attr('stroke', 'gray')
	.attr('fill', 'gray');
};*/

// cria a triangulo da seta.
markerSeta = Viva.Graph.svg('marker')
	.attr('id', 'Triangle')
	.attr('viewBox', '0 0 10 10')
	.attr('refX', '10')
	.attr('refY', '5')
	.attr('markerUnits', 'strokeWidth')
	.attr('markerWidth', '10')
	.attr('markerHeight', '5')
	.attr('orient', 'auto')
	.attr('stroke', 'gray')
	.attr('fill', 'gray');
markerSeta.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z');

graphics.getSvgRoot().id = 'principal_svg'; //seta id para ser reconhecido pelo drop_handler
defs = graphics.getSvgRoot().append('defs');
//insere filtro PB
defs.innerHTML = ' \
	<filter id="filtroPB"> \
	<feColorMatrix \
	  type="matrix" \
	  values="0 1 0 0 0 \
			  0 1 0 0 0 \
			  0 1 0 0 0 \
			  0 1 0 1 0 "/> \
	</filter>\
	<filter id="filtroNegativo"> \
	<feColorMatrix type="matrix" \
	values="-1  0  0 0 0  0 -1  0 0 0 0 0 -1 0 0 1 1 1 0 0"/>\
	</filter> \
	';
defs.append(markerSeta);

function labelsNo(node, tipoResumido) {
	//antes se passava node.data.label, mas era redundante com id e descricao
	var idno = node.data.id;
	var descricao = node.data.descricao;
	var nota = node.data.nota? node.data.nota: '';
	if (idno.startsWith('PF_')) {
		idno = idno.substr(3);
		idno = idno.split('-')[0];
	} else if (idno.startsWith('EN_')) {
		var partes = idno.substr(3).split('-');
		idno = partes[0];
		descricao = partes[1] + '/' + partes[2];
	} else if (idno.startsWith('LI_') || idno.startsWith('AR_')) {
		idno = idno.substr(3);
		if (idno.length>30) {
			idno = idno.substr(0,29) + '...';
			//descricao = idno.substr(-29);
		}
	} else if (idno.startsWith('ID_')) {
		idno = idno.substr(3);
		if (idno.includes('__')) {
			idno = idno.substr(idno.indexOf('__')+2);
		}
	} else {
		idno = idno.substr(3);
	}
	if (!tipoResumido) {
		return [idno, descricao, nota]
	} else if (tipoResumido==1) {
		return [descricao, '', nota]
	} else if (tipoResumido==2) {
		return [descricao.split(' ')[0],'', nota]
	} else {
		return ['', '', '']
	}
}//.function labelsNo

function textoTooltip(node, todoTexto){ // se todoTexto=false, exibe apenas dados dos marcadores
	var LF = String.fromCharCode(10);
	var texto = node.id;
	if (node.id.startsWith('PJ_')) {
		texto += LF + node.data.descricao + LF + sv(node.data.logradouro) + LF + junta(node.data.municipio, '/', node.data.uf); //sv(node.data.municipio) + '/' + sv(node.data.uf);
	} else if (node.id.startsWith('PF_')) {

	} else if (node.id.startsWith('LI_')) {
		texto = node.id.substr(3) + (node.data.descricao ? LF +  LF + node.data.descricao :  '')
		texto += LF + LF + 'Clique duplo para abrir o link';
	} else if (node.id.startsWith('AR_')) {
		texto = node.id.substr(3) + (node.data.descricao ? LF +  LF + node.data.descricao: '')
		if (window.location.href.startsWith('http://127.0.0.1')) {
			texto += LF +  LF + 'Clique duplo para abrir o documento.';
			if ((node.id.indexOf('\\')==-1) && (node.id.indexOf('/')==-1)) {
				texto += ' Para ser aberto, isso deve estar na pasta arquivos do projeto.';
			}
		} else { //execução não local
			if ((node.id.indexOf('\\')==-1) && (node.id.indexOf('/')==-1)) {
				texto += LF + + LF +'Para ser aberto, isso deve estar na pasta arquivos do projeto no servidor.';
			} else {
				texto +=  LF + LF + 'O arquivo não está disponível.';
			}
		}
	} else if (node.id.startsWith('ID_')) {
		if (node.id.includes('__')) {
			texto = node.id.split('__')[0] + '...' + LF + node.id.substr(node.id.indexOf('__')+2);
		}
		if (node.data.descricao) {
			texto += '\r' + node.data.descricao;
		}
	} else { //outros tipos
		if (node.data.descricao) {
			texto += '\r' + node.data.descricao;
		}
	}
	if (node.data.nota) {
		texto += '\r' + node.data.nota;
	}

	return texto;
}//.function textoTooltip

function iconeF(idno) {
	var tipo = idno.substr(0,3);
	var imagem = 'icone-grafo-id.png';
	if (tipo=='PF') {
		imagem = 'icone-grafo-desconhecido.png';
	//} else if (tipo=='PJ_') {
	//	imagem =
	} else if (tipo=='LI_') {
		imagem = 'link.png';
	} else if (tipo=='AR_') {
		imagem = 'external-link.png';
	} else if (idno.startsWith('ID_')) {
		var idnox = idno.substr(3);
		if (idnox.includes('__')) { //dois undercores depois da numeração de id
			imagem = 'binary.png';
			idnox = idnox.substr(idnox.indexOf('__')+2);
			var palavra = idnox.split(' ')[0];
			if (['def','class'].includes(palavra)) {
				imagem = 'python.png';
			} else if (['return','break','continue'].includes(palavra)) {
				imagem = 'reply.png';
			} else if (['if','else:','elif:','try:', 'except:','finally','with'].includes(palavra)) {
				imagem = 'random.png';
			} else if (['for','while'].includes(palavra)) {
				imagem = 'repeat.png';
			} else if (['@'].includes(palavra)) {
				imagem = 'at.png';
			} else if (palavra.startsWith('#') || palavra.startsWith('//')) {
				imagem = 'sticky-note-o.png';
			} else if (palavra == 'function') {
				imagem = 'code.png';
			}
		}
	}
	return imagem;
}//function iconeF

graphics.node(function(node) {
	// This time it's a group of elements: http://www.w3.org/TR/SVG/struct.html#Groups
	let ui = Viva.Graph.svg('g');
	let urlImagem = node.data.imagem ? node.data.imagem: 'icone-grafo-id.png';
	if (!urlImagem.includes(base)) {
		urlImagem = base + 'static/imagem/' + urlImagem;
	}
	let img = Viva.Graph.svg('image');
	//ui.posXRel = - gparam.nodeSize/2;
	//ui.posYRel = - gparam.nodeSize/2;
	img.attr('width', gparam.nodeSize)
		.attr('height', gparam.nodeSize)
		.link(urlImagem);
	//if (!node.data.situacao_ativa) {
	if (node.data.situacao_ativa==false) {
		img.attr('filter','url(#filtroPB)');
	};
	let corFundo = node.data.cor ? node.data.cor:'transparent';
	let	rectCor = Viva.Graph.svg('rect')
			//.attr('stroke', 'black')
			//.attr('stroke-width', 0)
			.attr('fill', corFundo) //corFundoImagemF(node))
			.attr('width', gparam.nodeSize)
			.attr('height', gparam.nodeSize)
			.attr('visibility', 'visible');  //hidden or visible

	let	rect = Viva.Graph.svg('rect') //destacar se está selecionado
			.attr('visibility', 'hidden') //hidden or visible
			.attr('stroke', 'black') //'crimson'
			.attr('stroke-width', 1.5)
			.attr('fill', 'transparent')
			.attr('width', gparam.nodeSize)
			.attr('height', gparam.nodeSize)
			.attr('stroke-dasharray', '6, 6');

	/*
	if (!urlImagem) {
		rectCor.attr('x', 0).attr('y', gparam.nodeSize);
		rect.attr('x', 0).attr('y', gparam.nodeSize);
	}
	*/
	//https://developer.mozilla.org/pt-BR/docs/Web/SVG/Element/animate
	/*
	var animateRect = Viva.Graph.svg('animate');
	animateRect.attr('attributeName','stroke-dashoffset').attr('values','0;180;0').attr('dur', '60s').attr('repeatCount','indefinite');
	rect.appendChild(animateRect);
	*/
	var [identificador, nome, nota] = labelsNo(node, gparam.kTipoRotulo); //node.data.label.split('\n');
	//var nota = node.data.nota? node.data.nota: '';
	node.data.nota = nota;

	if (gparam.btextoEmbaixoIcone) { //textp embaixo do ícone
		var svgText = Viva.Graph.svg('text')
			.attr('pointer-events', 'none') //o texto não é mais clicável
			.attr('y', gparam.tamanhoFonte*1.1 + gparam.nodeSize)
			.attr('x', gparam.nodeSize/2).attr('text-anchor','middle')
			.attr('font-size',gparam.tamanhoFonte+'px');
		var textspan = Viva.Graph.svg('tspan').attr('x', gparam.nodeSize/2).attr('dy', 0).text(identificador);
		var textspan2 = Viva.Graph.svg('tspan').attr('x', gparam.nodeSize/2).attr('dy', gparam.tamanhoFonte*1.1).text(nome);
		var textspan3 = Viva.Graph.svg('tspan').attr('x', gparam.nodeSize/2).attr('dy', gparam.tamanhoFonte*1.5)
			.attr('font-size',gparam.tamanhoFonte*1.5+'px').text(nota);
	} else { //texto à direita do ícone
		var svgText = Viva.Graph.svg('text')
			.attr('pointer-events', 'none')
			.attr('y',  gparam.nodeSize*0.5+gparam.tamanhoFonte*0.5)
			.attr('x', gparam.nodeSize).attr('text-anchor','left')
			.attr('font-size',gparam.tamanhoFonte+'px')
			.attr('style','font-family:Comic Sans MS;') ;
		var textspan = Viva.Graph.svg('tspan').attr('x', gparam.nodeSize*1.2).attr('dy', 0).text(identificador);
		var textspan2 = Viva.Graph.svg('tspan').attr('x', gparam.nodeSize*1.2).attr('dy', gparam.tamanhoFonte*1.1).text(nome);
		var textspan3 = Viva.Graph.svg('tspan').attr('x', gparam.nodeSize*1.2).attr('dy', gparam.tamanhoFonte*1.5)
			.attr('font-size',gparam.tamanhoFonte*1.5+'px').text(nota);
	}

	svgText.append(textspan);
	svgText.append(textspan2);
	svgText.append(textspan3);
	ui.insertAdjacentHTML('beforeEnd','<title>' + textoTooltip(node, true) + '</title>'); //title deve ser a primeira coisa apos g para funcionar no firefox 48
	ui.append(rectCor);
	ui.append(img);
	ui.append(rect);
	ui.append(svgText);
	//eventos com os nós:
	/*
	ui.onclick = function(event) {
		event.preventDefault();
		pausarLayout(300);
		return true;
	}; */

	ui.onmousedown = function(event) {  //estava onmouseup, assim dá pra congelar após click
		if (event.which == 1) {
			if (event.altKey) {
				event.preventDefault();
				menu_abrirNovaAba(node.id);
				return;
			}
			if (!event.ctrlKey) {
				event.preventDefault();
				selecionaNoid(node.id, event.shiftKey);
				//pinarNoTemp(1000);
				pausarLayout(500); //delay para facilitar duplo clique
			}
		} else if (event.which == 2) {
			//botão central abre edição de nota
			event.preventDefault();
			menu_editarNota(node.id);
		}
		return;
	};
	ui.ondblclick = function(event) {
		if (event.which == 1) {
			event.preventDefault();
			if (node.id.startsWith('AR_') || node.id.startsWith('LI_')) {
				menu_abrirNovaAba(node.id);
			} else if (node.id.startsWith('ID_') && (!gparam.inicio.bBaseLocal)) {
				//
			} else {
				selecionaNoid(node.id, false);
				menu_incluirCamada(node.id, 1);
			}
		};
		return;
	};
	ui.ontouchstart = function(event) {
		gparam.inicioToque = new Date().getTime();
	};
	ui.ontouchend = function(event) {
		//todo verificar posição
		var currentTime = new Date().getTime();
		var tempoToque = currentTime - gparam.ultimoToque;
		if ((tempoToque<500) && (tempoToque > 0)) {
			//double tab ondblclick
			selecionaNoid(node.id, false);
			menu_incluirCamada(node.id, 1);
			event.preventDefault();
		} else {
			var touchLength = currentTime - gparam.inicioToque;
			if ((touchLength>=500) && (gparam.inicioToque!=0)) {
				gparam.inicioToque=0;
				//return false;
				return true;
			}
			//single tap onclick
			selecionaNoid(node.id, event.shiftKey);
			event.preventDefault();
		}
		gparam.ultimoToque = currentTime;
		return false;
	};
	ui.onmouseover = function(event) {
		gparam.idNoOnHover = node.id;
		return;
	};
	ui.onmouseleave = function(event) {
		gparam.idNoOnHover = null;
		return;
	};
	return ui;
}).placeNode(function(nodeUI, pos) {
	// 'g' element doesn't have convenient (x,y) attributes, instead
	// we have to deal with transforms: http://www.w3.org/TR/SVG/coords.html#SVGGlobalTransformAttribute
	nodeUI.attr('transform', 'translate(' + (pos.x - gparam.nodeSize/2) + ',' + (pos.y - gparam.nodeSize/2) + ')');
}); //.graphics.node(function(node)

graphics.link(function(link){
	var label = Viva.Graph.svg('text')
		//.attr('title', String(link.data.label))
		.attr('id','link_label_'+link.data.id)
		.attr('font-size',gparam.tamanhoFonte+'px')
		.attr('fill',link.data.cor)
		.text(filtraTextoLigacao(String(link.data.label)));
	label.insertAdjacentHTML('beforeEnd','<title>' + String(link.data.label) + '</title>');
	//gparam.idLigacoes[link.data.origem + '\n' + link.data.destino] = link.data.id;
	graphics.getSvgRoot().childNodes[0].append(label);
	var vpath = Viva.Graph.svg('path')
		.attr('stroke', link.data.cor) // 'gray')
		.attr('marker-end', 'url(#Triangle)')
		.attr('id', link.data.id);
	//if ((link.data.origem.startsWith('ID_')) || (link.data.destino.startsWith('ID_')) || (link.data.destino.startsWith('EN_'))
	//	|| (link.data.destino.startsWith('EM_')) || (link.data.destino.startsWith('TE_')) || (link.data.tipoDescricao=='link')) {
	if (link.data.tipoDescricao=='link') {
		vpath.attr('stroke-dasharray', '5, 5');
	};
	return vpath
	}).placeLink(function(linkUI, fromPos, toPos) {
		var toNodeSize = gparam.nodeSize,
		fromNodeSize = gparam.nodeSize;

		var from = gparam.geom.intersectRect(
			fromPos.x - fromNodeSize / 2, // left
			fromPos.y - fromNodeSize / 2, // top
			fromPos.x + fromNodeSize / 2, // right
			fromPos.y + fromNodeSize / 2 + (gparam.btextoEmbaixoIcone? gparam.tamanhoFonte*2 : 0), // bottom
			fromPos.x, fromPos.y, toPos.x, toPos.y)
		|| fromPos;

		var to = gparam.geom.intersectRect(
			toPos.x - toNodeSize / 2, // left
			toPos.y - toNodeSize / 2, // top
			toPos.x + toNodeSize / 2, // right
			toPos.y + toNodeSize / 2 + (gparam.btextoEmbaixoIcone? gparam.tamanhoFonte*2 : 0), // bottom
			// segment:
			toPos.x, toPos.y, fromPos.x, fromPos.y)
			|| toPos;

		var data = 'M' + from.x + ',' + from.y + 'L' + to.x + ',' + to.y;
		linkUI.attr("d", data);
		var elemento = document.getElementById('link_label_'+linkUI.attr('id'));
		elemento.attr("x", (from.x + to.x) / 2).attr("y", (from.y + to.y) / 2)
			.attr('visibility', gparam.bMostraLigacao? 'visible' : 'hidden');;
		// se for grande, deixa o texto do link na horizontal, se for menor alinha com a ligacao.
		if  (elemento.textContent.length <= 2*20) { //20 caracteres, length é contado em dobro por causa do <title>
			// calcula o angulo para exibir o rótulo inclinado
			var angulo = 180.0/Math.PI* Math.atan2(toPos.y-fromPos.y,toPos.x - fromPos.x);
			var baseline = '-1';
			if (angulo>90) {
				angulo = -(180.0 - angulo);
				baseline = '-1';
			} else if (angulo<-90) {
				angulo = 180.0 + angulo;
				baseline = '-2';
			}
			elemento.attr("transform","rotate(" + parseFloat(angulo) + " " + parseInt((from.x + to.x) / 2) + ","
				+ parseInt((from.y + to.y) / 2) + ") translate(0," + baseline + ")")
				.attr('text-anchor','middle')
				.attr('visibility', gparam.bMostraLigacao? 'visible' : 'hidden');
		}
})//.graphics.link(function(link)

function filtraTextoLigacao(texto) {
	//remove texto do link para o gráfico ficar mais limpo
	var palavras = [];
	for (let k of texto.split(';')){
		var pedaco = (k.search(':')!=-1) ? k.split(':')[0] : k
		//if (['endereço','telefone','end','tel','email','link'].includes(pedaco.trim())) {
		if (['endereço','telefone','end','tel','email'].includes(pedaco.trim())) {
			continue;
		}
		if (pedaco=='link') {
			palavras.push(k.replaceAll('link:',''));
		} else {
			palavras.push(k);
		}
	}
	return palavras.join('; ');
}//.filtraTextoLigacao

function ajustaRetanguloAnimado(nodeid, bSeleciona) {
	//ajusta posicao do retangulo para envolver o texto
	let nodeUI = graphics.getNodeUI(nodeid)
	let uirect = nodeUI.getElementsByTagName('rect')[1];
	if (bSeleciona) {

		//console.log(textBox);

		/* //criar o retangulo depois faz com que o item não aceite duplo clique
		var	uirect = Viva.Graph.svg('rect') //destacar se está selecionado
		//.attr('visibility', 'hidden') //hidden or visible
		.attr('stroke', 'black') //'crimson'
		.attr('stroke-width', 1.5)
		.attr('fill', 'transparent')
		.attr('width', gparam.nodeSize)
		.attr('height', gparam.nodeSize)
		.attr('stroke-dasharray', '6, 6')
		.attr('visibility', 'visible');
		if (false) {
			let textBox = nodeUI.getElementsByTagName('text')[0].getBBox();
			//altera retangulo da seleção para envolver o texto
			uirect.attr('x', textBox.x).attr('y', textBox.y).attr('width', textBox.width).attr('height', textBox.height);
		}
		*/
		uirect.setAttribute('visibility', 'visible');
		var animateRect = Viva.Graph.svg('animate');
		animateRect.attr('attributeName','stroke-dashoffset').attr('values','0;180;0').attr('dur', '60s').attr('repeatCount','indefinite');
		uirect.appendChild(animateRect);

		//uirect.setAttribute('class', 'disabled');
		//var uitexto = nodeUI.getElementsByTagName('text')[0];
		//nodeUI.appendBefore(uirect, uitexto);
		//nodeUI.append(uirect);
		//nodeUI.getElementsByTagName('rect')[1].setAttribute('visibility', 'visible');
	} else {
		uirect.setAttribute('visibility', 'hidden');
		var animateRectList = uirect.getElementsByTagName('animate');
		//gparam.debug = uirect;
		if (animateRectList.length) {
			uirect.removeChild(animateRectList[0]);
		}
		//var uirect = nodeUI.getElementsByTagName('rect')[1];
		//nodeUI.removeChild(uirect);
	}
}//.function ajustaRetanguloAnimado

function selecionaNoid(nodeid, shift_pressionado, selecionaRetangular) {
	// ativa retângulo em torno do ícone do nó.
	// se o shift está pressionado, pode ter mais de um nó. Se o nó já estiver selecionado, shift_pressionado inverte estado da seleção para nodeid
	// quando node=null e shift_pressionado=false, remove todos os nós da seleção.
	//selecionaRetangular=true, seleciona, não inverte
	var nodeEstavaSelecionado = false;
	if (nodeid) {
		nodeEstavaSelecionado = gparam.idNosSelecionados.has(nodeid);
		if (nodeEstavaSelecionado) {
			if (selecionaRetangular) { //se o nó já estava selecionado e com selecao retangular, não há o que fazer.
				return;
				//nodeEstavaSelecionado=false; //fazer isso pode ignorar que o objeto animação já exista e criar outro.
			}
		}
	} else {
		for (let n of gparam.idNosSelecionados) {
			ajustaRetanguloAnimado(n, false);
			//graphics.getNodeUI(n).getElementsByTagName('rect')[1].setAttribute('visibility', 'hidden');  //hidden or visible)
		}
		gparam.idNosSelecionados = new Set();
		gparam.idnoSelecionado = null;
		return;
	}
	if (shift_pressionado) {
		if (nodeEstavaSelecionado) {
			gparam.idnoSelecionado = null;
			gparam.idNosSelecionados.delete(nodeid);
			ajustaRetanguloAnimado(nodeid, false);
			//graphics.getNodeUI(nodeid).getElementsByTagName('rect')[1].setAttribute('visibility', 'hidden');
		} else {
			gparam.idnoSelecionado = nodeid;
			gparam.idNosSelecionados.add(nodeid);
			ajustaRetanguloAnimado(nodeid, true);
			//graphics.getNodeUI(nodeid).getElementsByTagName('rect')[1].setAttribute('visibility', 'visible');
		}
	} else {
		for (let n of gparam.idNosSelecionados) {
			ajustaRetanguloAnimado(n, false);
			//graphics.getNodeUI(n).getElementsByTagName('rect')[1].setAttribute('visibility', 'hidden');  //hidden or visible)
		}
		gparam.idNosSelecionados = new Set();
		gparam.idnoSelecionado = nodeid;
		if (nodeid) {
			ajustaRetanguloAnimado(nodeid, true);
			//graphics.getNodeUI(nodeid).getElementsByTagName('rect')[1].setAttribute('visibility', 'visible');  //hidden or visible)
			gparam.idNosSelecionados.add(nodeid);
			gparam.idnoSelecionado = nodeid;
		}
	}
	//ajusta menu contextual
	//ajustaMenuContextual(nodeid);
	return;
}//.function selecionaNoid

//gparam.AreaSelecaoRetangular
gparam.AreaSelecaoRetangular = {
	Setup:function() {
		/*seleção retangular */
		var multiSelectOverlay;
		document.addEventListener('keydown', function(e) {
			if (e.which === 17 && !multiSelectOverlay) { // ctrl key
				multiSelectOverlay = gparam.AreaSelecaoRetangular.startMultiSelect(graph, gparam.renderer, gparam.layout);
			}
			if (e.which != 17 && multiSelectOverlay) { // pressionou outro botão (corrige problema quando se pressiona CTRL+botão para outro comando, que o tipo de cursor não mudava para o padrão
				multiSelectOverlay.destroy();
				multiSelectOverlay = null;
			}

		});
		document.addEventListener('keyup', function(e) {
			if (e.which === 17 && multiSelectOverlay) {
				multiSelectOverlay.destroy();
				multiSelectOverlay = null;
			}
		});
	}, startMultiSelect: function(graph, renderer, layout) {
		var graphics = renderer.getGraphics();
		var domOverlay = document.querySelector('.graph-overlay');
		var overlay = gparam.AreaSelecaoRetangular.createOverlay(domOverlay);
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
				selecionaNoid(node.id, true, true);
			}
		}

		function isInside(nodeId, topLeft, bottomRight) {
			var nodePos = layout.getNodePosition(nodeId);
			return ((topLeft.x < nodePos.x) && (nodePos.x < bottomRight.x) &&
				(topLeft.y < nodePos.y) && (nodePos.y < bottomRight.y));
		}
	  }
	}, createOverlay: function(overlayDom) {
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
}//gparam.AreaSelecaoRetangular

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
//.gparam.AreaSelecaoRetangular

// outra alteração no vivagraph.js: para renderizar os links atrás dos nós: (parece que não funciona)
/*    function createSvgRoot() {
        var svgRoot = svg("svg");
		//https://github.com/gg4u/VivaGraphJS/commit/0547568448ea7e17e6558798fadbaa054ca4f104#diff-2ee351279fcef17bd76b6d9d4eef748e1a133b3fa07bd336c64778e64b9f61e7
		//readability in svg : group nodes and links
        svgContainer = svg("g")
              //.attr("buffered-rendering", "dynamic");
              .attr("buffered-rendering", "dynamic").attr("id", "scene");

        // group nodes and links for readability of elements
        svgNodes = svg("g").attr("id", "nodes");
        svgEdges = svg("g").attr("id", "edges");

        svgContainer.appendChild(svgEdges);
        svgContainer.appendChild(svgNodes);
		//.readability in svg : group nodes and links
        svgRoot.appendChild(svgContainer);

        return svgRoot;
    }
*/

function localizaNo(texto, bFiltroNosSelecionados) { //retorna n. de nos localizados
	//bFiltroNosSelecionados, só procura em idNosSelecionados, senão procura em todos os itens
	var textoU = texto.toUpperCase();
	var idNosLocalizados= new Set();
	var primeiroNoid = null;
	texto = texto.replace(/\n/g,';').replace(/\t/g,';');
	graph.forEachNode(function(node){
		for (let taux of texto.toUpperCase().split(';')) { //usa ; como separador para busca de mais de um termo
			let t = taux.trim();
			if ((node.id.toUpperCase().search(t)!= -1) || (node.data.descricao.toUpperCase().search(t)!=-1)
				|| (node.data.nota.toUpperCase().search(t)!= -1)) {
				if ((!bFiltroNosSelecionados) || ((bFiltroNosSelecionados) && (gparam.idNosSelecionados.has(node.id)))) {
					idNosLocalizados.add(node.id);
					if (!primeiroNoid) {
						primeiroNoid = node.id;
					}
				}
			}
		}
	});
	return selecionaSet(idNosLocalizados, primeiroNoid);
}//.function localizaNo

function selecionaSet(sidNos, primeiroNoid) {
	//seleciona um set de ids, se primeiroNoid for informado, centraliza nesse id
	if (sidNos.size) {
		selecionaNoid(null, false); //apaga seleção primeiro
		for (let n of sidNos) {
			selecionaNoid(n, true);
		}
		if (primeiroNoid) {
			if (gparam.idNosSelecionados.has(primeiroNoid)) {
				gparam.idnoSelecionado = primeiroNoid;
				//ajustaMenuContextual(gparam.idnoSelecionado);
				//var position = gparam.renderer.getLayout().getNodePosition(gparam.idnoSelecionado);
				var position = gparam.layout.getNodePosition(gparam.idnoSelecionado);
				gparam.renderer.moveTo(position.x, position.y);
			} else {
				alertify.error('erro na funcao selecionaSet');
			}
		}
		return gparam.idNosSelecionados.size;
	} else {
		return 0;
	}
}//.function selecionaSet

function menu_localiza(bFiltroNosSelecionados) {
	//bFiltroNosSelecionados, só procura em idNosSelecionados, senão procura em todos os itens
	ativaAtalhos(false);
	var brenderer = menu_rendererAtivarParar(false, false);
	var tmensagem = bFiltroNosSelecionados? 'Filtrar nos itens selecionados':'Localizar item na tela';
	alertify.prompt( tmensagem, 'Digite partes do Nome, CNPJ ou CPF. Utilize ponto e vírgula (;) como separador para buscar mais de um termo.', ''
	   , function(evt, texto) {
			if (texto) {
				contagem = localizaNo(texto, bFiltroNosSelecionados);
				if (contagem) {
					alertify.success('Localizou '+ contagem + ' ocorrencias(s) de ' + texto);
				} else {
					alertify.error('Não localizou ' + texto);
				};
			}
			menu_rendererAtivarParar(brenderer, false);
			ativaAtalhos(true);
		}, function() {
			ativaAtalhos(true);
			menu_rendererAtivarParar(brenderer, false);
		});
}//.function menu_localiza

function menu_localizaPorCampo(bFiltroNosSelecionados) {
	//bFiltroNosSelecionados, só procura em idNosSelecionados, senão procura em todos os itens
	function localizaNoPorCampo(texto, bFiltroNosSelecionados) { //retorna n. de nos localizados
		//bFiltroNosSelecionados, só procura em idNosSelecionados, senão procura em todos os itens
		var idNosLocalizados= new Set();
		var primeiroNoid = null;
		var comparacoes = texto.split(';');
		graph.forEachNode(function(node){
			var data = node.data;
			var campo, valor, valorDif;
			for (let comp of comparacoes) {
				var [campo, valorDif] = comp.split('<>');
				if (!valorDif) {
					var [campo, valor] = comp.split('=');
				}
				valor = replaceAll(replaceAll(valor, '"', ''), "'", "");
				if (data[campo]) {
					if ( (Boolean(valor) && (data[campo]==valor)) ||
						(Boolean(valorDif) && (data[campo]!=valorDif))) {
						idNosLocalizados.add(node.id);
						if (!primeiroNoid) {
							primeiroNoid = node.id;
						}
					}
				}
			}
		});
		return selecionaSet(idNosLocalizados, primeiroNoid);
	}//.function localizaNoPorCampo
	ativaAtalhos(false);
	var brenderer = menu_rendererAtivarParar(false, false);
	var tmensagem = bFiltroNosSelecionados? 'Filtrar nos itens selecionados':'Localizar item na tela por campo';
	alertify.prompt( tmensagem, 'Digite o nome do parâmetro do campo, por exemplo, cor="red"', ''
	   , function(evt, texto) {
			if (texto) {
				contagem = localizaNoPorCampo(texto, bFiltroNosSelecionados);
				if (contagem) {
					alertify.success('Localizou '+ contagem + ' ocorrencias(s) de ' + texto);
				} else {
					alertify.error('Não localizou ' + texto);
				};
			}
			menu_rendererAtivarParar(brenderer, false);
			ativaAtalhos(true);
		}, function() {
			ativaAtalhos(true);
			menu_rendererAtivarParar(brenderer, false);
		});
}//.function menu_localizaPorCampo

function menu_localiza_adjacentes(bFiltroNosSelecionados) {
	//bFiltroNosSelecionados, só procura em idNosSelecionados, senão procura em todos os itens
	//ativaAtalhos(false);
	var brenderer = menu_rendererAtivarParar(false, false);
	var idNosLocalizados = new Set();
	for (let noId of gparam.idNosSelecionados) {
		graph.forEachLinkedNode(noId, function(nodeaux, link){
			idNosLocalizados.add(nodeaux.id);
		});
	}
	menu_rendererAtivarParar(brenderer, false);
	if (idNosLocalizados.size) {
		//selecionaNoid(null, false); //apaga seleção primeiro
		for (let n of idNosLocalizados) {
			//graphics.getNodeUI(n).getElementsByTagName('rect')[1].setAttribute('visibility', 'visible');
			//gparam.idNosSelecionados.add(n);
			selecionaNoid(n, true, true);
		}
		alertify.success('Localizou '+ idNosLocalizados.size + ' adjacentes');
		return idNosLocalizados.size;
	} else {
		return 0;
	}
}//.function menu_localiza_adjacentes

function menu_localiza_componente() {
	var brenderer = menu_rendererAtivarParar(false, false);
	var idNosLocalizados = new Set(gparam.idNosSelecionados);
	var tamanhoAnterior = -1;
	while (true) {
		var idNosLocalizadosFor = new Set(idNosLocalizados);
		//var idNosLocalizados = new Set();
		for (let noId of idNosLocalizadosFor) {
			graph.forEachLinkedNode(noId, function(nodeaux, link){
				idNosLocalizados.add(nodeaux.id);
			});
		}
		if (tamanhoAnterior==idNosLocalizados.size) {
			break;
		}
		tamanhoAnterior = idNosLocalizados.size;
	}
	menu_rendererAtivarParar(brenderer, false);
	if (idNosLocalizados.size) {
		//selecionaNoid(null, false); //apaga seleção primeiro
		for (let n of idNosLocalizados) {
			//graphics.getNodeUI(n).getElementsByTagName('rect')[1].setAttribute('visibility', 'visible');
			//gparam.idNosSelecionados.add(n);
			selecionaNoid(n, true, true);
		}
		if (gparam.idNosSelecionados.size == graph.getNodesCount()) {
			alertify.success('Todo o gráfico foi selecionado, com '+ idNosLocalizados.size + ' itens');
		} else {
			alertify.success('Localizou '+ idNosLocalizados.size + ' adjacentes');
		}
		return idNosLocalizados.size;
	} else {
		return 0;
	}

}//.function menu_localiza_componente

function menu_localiza_itensComMaisLigacoes() {
	var dcontagem = {};
	var bMudou = false;
	graph.forEachLink(function(link){
		dcontagem[link.fromId] = dcontagem[link.fromId] ? dcontagem[link.fromId]+1 : 1;
		dcontagem[link.toId] = dcontagem[link.toId] ? dcontagem[link.toId]+1 : 1;
	});
	listaESeleciona(dcontagem, 'Itens com mais ligações');
}//.function menu_localiza_itensComMaisLigacoes

function listaESeleciona(dcontagem, texto) {
	/*
	var listaIdContagem = [];
	for (const [k,v] of Object.entries(dcontagem)) {
		listaIdContagem.push([k, v]);
	}
	listaIdContagem.sort(function(a, b) {
		return b[1] - a[1];
	}); */
	const listaIdContagem = Object.entries(dcontagem).sort(([,a],[,b]) => b-a);
	var tmaiores = texto + '\n\nN - ID: CONTAGEM\n\n';
	var k=0;
	var listaIds = [];
	for (const element of listaIdContagem) {
		k += 1;
		if (k<=15) {
			tmaiores += '' + k + ' - ' + element[0] + ': ' + element[1] + '\n';
		}
		listaIds.push(element[0]);
		if (k>=100) break;
	}
	tmaiores += '\n\nDeseja selecionar quantos itens?';
	var nids = prompt(tmaiores, Math.min(k,15));
	nids = parseInt(nids);
	if (!nids) return;
	selecionaSet(new Set(listaIds.slice(0,nids))); //, listaIds[0]);
	alertify.success('Os itens ' + listaIds.slice(0,nids) + ' foram selecionados');
}//.listaESeleciona

function menu_localiza_itensLigadosAColoridos() {
	var dcontagem = {};
	var bMudou = false;
	graph.forEachLink(function(link){
		var corFrom = graph.getNode(link.fromId).data.cor ? 1: 0;
		var corTo = graph.getNode(link.toId).data.cor? 1:0 ;
		dcontagem[link.fromId] = dcontagem[link.fromId] ? dcontagem[link.fromId]+corTo : corTo;
		dcontagem[link.toId] = dcontagem[link.toId] ? dcontagem[link.toId]+corFrom : corFrom;
	});
	listaESeleciona(dcontagem, 'Ligados a itens marcados');
}//.function menu_localiza_itensLigadosAColoridos

function menu_rendererAtivarParar(bAtivar, bMostraMensagem) {
	var estadoAnterior = gparam.bRenderAtivado;
	if (!bAtivar) {
		gparam.renderer.pause();
		if (bMostraMensagem && gparam.bRenderAtivado) {
			alertify.success('O leiaute foi pausado. Para ativar, pressione a Barra de Espaço.');
		}
	} else {
		gparam.renderer.resume();
		if (bMostraMensagem && !gparam.bRenderAtivado) {
			alertify.success('O leiaute foi reiniciado. Para parar, pressione a Barra de Espaço.');
		}
	}
	gparam.bRenderAtivado = bAtivar;
	return estadoAnterior;
}//.function menu_rendererAtivarParar

function pausarLayout(milissegundos) {
	gparam.renderer.pause();
	setTimeout(
		function() {
			if (gparam.bRenderAtivado) {
				gparam.renderer.resume();
			};
		}, milissegundos
	);
}//.function pausarLayout

function removeIdNo(noId) {
	//remover o nó da lista de nós
	//remover ligações que partem do nó e que chegam ao nó
	//procura label do link para remover
	graph.forEachLinkedNode(noId, function(nodeaux, link){
		var linkUIaux=null;
		try {
			linkUIaux = graphics.getLinkUI(link.id);
			element=document.getElementById('link_label_'+linkUIaux.attr('id'));
			element.parentNode.removeChild(element);
		} catch (e){; };
	});
	graph.removeNode(noId);
	//remove no da lista de selecionados
	gparam.idNosSelecionados.delete(noId);
	if (gparam.idnoSelecionado==noId) {
		gparam.idnoSelecionado=null;
	}
}//.function removeIdNo

function menu_excluirNosSelecionados(bSemConfirmar) {
	if (!gparam.idNosSelecionados.size) {
		if (!bSemConfirmar) {
			alertify.alert('Exclusão', 'Não há itens selecionados para exclusão. Selecione e tente novamente.', function(){ ; });
		}
		return;
	}
	var tmensagem = (gparam.idNosSelecionados.size==1) ? 'Excluir 1 nó.' : ('Excluir '+ gparam.idNosSelecionados.size + ' nós selecionados.');
	var tsucesso = (gparam.idNosSelecionados.size==1) ? '1 nó foi excluído.' : (gparam.idNosSelecionados.size + ' nós foram excluídos.');
	var fExcluir = function(){
		for (let n of gparam.idNosSelecionados) {
			removeIdNo(n);
		}
		gparam.idnoSelecionado=null;
		alertify.success(tsucesso);
	};
	if (bSemConfirmar) {
		fExcluir();
		return;
	}
	alertify.confirm(tmensagem, 'Deseja prosseguir? Não será possível reverter a exclusão.',
			fExcluir
            , function(){ ;}
	);
}//.function menu_excluirNosSelecionados

function menu_excluirTudo() {
	var setNos = new Set();
	graph.forEachNode( function(node) {
		setNos.add(node.id);
	});
	alertify.confirm('Excluir todos os '+ setNos.size +  ' nós.', 'Deseja prosseguir? Não será possível reverter a exclusão.',
			function(){
				for (let n of setNos) {
					removeIdNo(n);
				}
				alertify.success(setNos.size + ' nós foram excluídos.')
			}
            , function(){ ;}
	);
}//.function menu_excluirTudo

function excluirNoMantendoLinks() {
	if (gparam.idNosSelecionados.size!=3) {
		alertify.error('Para usar esta rotina, deve haver três itens selecionados.');
		return;
	}
	var listaNos = [...gparam.idNosSelecionados];
	resp = confirm('Deseja remover o item ' + listaNos[1] + '?');
	if (!resp) {
		return;
	}
	removeIdNo(listaNos[1]);
	selecionaSet(new Set([listaNos[0], listaNos[2]]));
	menu_ligar_selecionados(false, '', true);
}//.function excluirNoMantendoLinks

function menu_inserirDesfazer() {
	var idNosInseridos = gparam.listaIdNosInseridos.pop();
	if (!idNosInseridos) return;
	var tam = idNosInseridos.size;
	for (let n of idNosInseridos) {
		removeIdNo(n);
	}
	var tmensagem = (tam==1 ? 'Foi removido um nó.' : ('Foram removidos ' + tam + ' nós.'))
	alertify.success(tmensagem);
}//.menu_inserirDesfazer

function dadosEmHtmlPJ(d, noData) {
	//for (var i of Object.entries(gparam.json)) {
	//	texto += '<b>' + i[0] + ':<b> ' + i[1] + '<br> '; }
	var ht = '';
	ht += "<b>CNPJ:</b> " + d['cnpj'] + " - " + d['matriz_filial'] + "<br>";
	ht += "<b>Razão Social:</b> "+d['razao_social'] +  "<br>";
	ht += "<b>Nome Fantasia:</b> "+d['nome_fantasia'] + "<br>";
	ht += "<b>Data início atividades:</b> "+d['data_inicio_atividades']+"<br>";
	ht += "<b>Situação:</b> "+d['situacao_cadastral']+" <b>Data Situação:</b> "+d['data_situacao_cadastral']+"<br>";
	ht += "<b>Motivo situação:</b> "+d['motivo_situacao_cadastral'] +"<br>";
	ht += "<b>Natureza jurídica:</b> "+d['natureza_juridica'] +"<br>";
	ht += "<b>CNAE:</b> "+d['cnae_fiscal'] +"<br>";
	ht += "<b>Porte empresa:</b> "+d['porte_empresa'] +"<br>";
	ht += "<b>Opção MEI:</b> "+d['opcao_mei'] +"<br>";
	ht += "<b>Endereço:</b> "+d['endereco'] +"<br>";
	ht += "<b>Municipio:</b> "+d['municipio']+"/"+d['uf'] + " - <b>CEP:</b>" + d['cep'] +"<br>";
	if (d['nm_cidade_exterior'] || d['nome_pais']) {
		ht += "<b>Endereço Exterior:</b> "+d['nm_cidade_exterior'] +" <b>País:</b> "+d['nome_pais']+"<br>";
	}
	ht += "<b>Telefone:</b> "+d['ddd1']+" "+ d['telefone1']+"  "+d['ddd2']+" "+d['telefone2'] +"<br>";
	ht += "<b>Fax:</b> "+d['ddd_fax']+" "+d['fax'] +"<br>";
	ht += "<b>Email:</b> "+d['correio_eletronico'] +"<br>";
	ht += "<b>Capital Social:</b> R$ "+d['capital_social'] +"<br>";
	if (noData.nota) {
		ht += "<br><b>Nota:</b> "+ noData.nota + "<br>";
	}
	camposPJ = ['cnpj', 'matriz_filial', 'razao_social', 'nome_fantasia', 'data_inicio_atividades', 'situacao_cadastral',
				'data_situacao_cadastral', 'motivo_situacao_cadastral', 'natureza_juridica', 'cnae_fiscal', 'porte_empresa', 'opcao_mei',
				'endereco', 'municipio', 'uf', 'cep', 'nm_cidade_exterior', 'nome_pais', 'nm_cidade_exterior', 'nome_pais',
				'ddd1', 'telefone1', 'ddd2', 'telefone2', 'ddd_fax', 'fax', 'correio_eletronico', 'capital_social'
				];
	for (let k of camposPJ) {
		d[k] = '';
	}
	return ht;
}//.dadosEmHtmlPJ

function menu_dados(bNovaJanela, idNo) {
	var idin = gparam.idnoSelecionado;
	if (idNo) {
		idin = idNo;
	}
	if (!idin) return;
	function mostraResultado(idin, ht) {
		if (bNovaJanela) {
				var win = window.open('', idin,'resizable,scrollbars,status,menubar=no, toolbar=no, personalbar=no, location=no, titlebar=0, height=500, width=400');
				win.document.body.innerHTML = "<!DOCTYPE html><html><head><title>" + idin + "</title></head><body  >" + ht + "</body></html>";
		} else {
			alertify.alert("Dados de "+idin, ht, function(){});
		}
	}
	var noData = graph.getNode(idin).data;
	var ht = '';
	if (!idin.startsWith('PJ_')) {
		if (idin.startsWith('PF_')) {
			ht += "<b>ID: </b> " + idin + "<br>";
			if (noData.descricao) {
				ht += "<b>Descrição: </b> "+ noData.descricao + "<br>";
			}
			if (noData.nota) {
				ht += "<b>Nota: </b> "+ noData.nota + "<br>";
			}
		} else {
			for (const [key, value] of Object.entries(noData)) {
				if (!['camada', 'situacao_ativa', 'posicao', 'pinado'].includes(key)) {
					if (value) {
						ht += "<b>" + key + ": </b> "+ value+ "<br>";
					}
				}
			}
		}
		if (!gparam.inicio.bBaseLocal) {
			mostraResultado(idin, ht);
			return;
		}
	}

	var url = base + 'dadosjson/' + idin ;
	fetch(url, {method: 'get', cache: "no-store"}) //, mode: 'cors',})
	  .then(
		function(response) {
		  if (response.status !== 200) {
			console.log('Looks like there was a problem. Status Code: ' +  response.status);
			alertify.error('Aconteceu um erro 2 (' +  response.status + ')');
			return;
		  }
		  response.json().then(function(data) {
			var texto = "";
			gparam.json = data;

			if (data) {
				if (idin.startsWith('PJ_')) {
					ht = dadosEmHtmlPJ(data, noData)
				} // else {
					//ht += noData;
				htadicional = ''
				for (const [key, value] of Object.entries(data)) {
					if (['id'].includes(key)) {
						continue;
					}
					if (value) {
						htadicional += "<b>" + key + ": </b> "+ value+ "<br>";
					}
				}
				if (htadicional) {
					ht +=  "<b>--------------</b> "+ "<br>" + htadicional;
				}
				//}
			}
			mostraResultado(idin, ht);
		  });
		}
	  )
	  .catch(function(err) {
		console.log('Fetch Error :-S', err);
		alertify.error('Aconteceu um erro 3 (Fetch error ' + err + ')');
	  });
}//.function menu_dados

function menu_listaSelecao(bNovaJanela) {
	if (!gparam.idNosSelecionados) {
		return;
	}
	var ht = '';
	for (let n of gparam.idNosSelecionados) {
		var noData = graph.getNode(n).data;
		ht += "<b>ID: </b> " + noData.id;
		if (noData.descricao && (!noData.id.includes(noData.descricao))) {
			ht += " ("+ noData.descricao + ")<br>";
			ht += " ("+ noData.descricao + ")<br>";
		} else {
			ht += "<br>";
		}
		if (noData.nota) {
			ht += "<b>Nota: </b> "+ noData.nota + "<br>";
		}
	}
	if (ht) {
		//document.getElementById("corpo").disabled = true;
		if (bNovaJanela) {
			var win = window.open('', gparam.idnoSelecionado,'resizable,scrollbars,status,menubar=no, toolbar=no, personalbar=no, location=no, titlebar=0, height=500, width=400');
			win.document.body.innerHTML = "<!DOCTYPE html><html><head><title>Itens Selecionados</title></head><body  >" + ht + "</body></html>";
		} else {
			alertify.alert("Itens selecionados: \n" + ht, function(){});
		}
	}
}//.function menu_lista_selecao


function menu_importarJsonArquivo(evt, tipo) {
	menuOnClick();
	if (tipo=='drop') {
		var files = evt.dataTransfer.files;
	} else {
		var files = evt.target.files; // FileList object
	}
	for (var i = 0; i < files.length; i++) {
		//console.log(files[i].name);
		var f=files[i];
		var reader = new FileReader();
		reader.onload = (function(f) {
			return function(e) {
				var contents = e.target.result;
				//alert( "Got the file.n"  +"name: " + f.name + "n"  +"type: " + f.type + "n"  +"size: " + f.size + " bytesn"  + "starts with: " + contents.substr(1, contents.indexOf("n")));
				if (f.name.endsWith('.csv')) {
					inserir_lista(contents);
					console.log(contents);
				} else if (f.name.endsWith('.json')){
					//importaJSON(contents);
					try {
						var content_parse = JSON.parse(contents);
						gparam.debug = contents;
						inserirJson(content_parse, 'Leitura de arquivo. ');
					} catch (e) {
						alertify.error('Aconteceu um erro 4 ' + e);
					}
				} else if (f.name.endsWith('.py')){
					//importaJSON(contents);
					inserir_lista('_>p\n' + contents);
				} else if (f.name.endsWith('.js')){
					//importaJSON(contents);
					inserir_lista('_>j\n' + contents);
				} else {
					var idNovo = 'AR_' + f.name;
					menu_ligar_novo(idNovo,'');
					/*
					var descricao = prompt('Digite uma descrição para o arquivo ' + f.name, '');
					if (graph.hasNode(idNovo)) {
						alert('Já existe um arquivo com o nome ' + f.name);

					} else {
						var no = {'id': idNovo,
						   'descricao': descricao,
						   'camada': 0,
						   'situacao_ativa': true,
						   'imagem': iconeF(idNovo), //'icone-grafo-id.png',
						   'cor': 'yellow'};
						};
						graph.addNode(idNovo, JSON.parse(JSON.stringify(no)));
					}
					*/
				}
			};
		})(f);
		reader.readAsText(f);
	}
}//.function menu_importarJsonArquivo

function menu_exportaJSONServidorParaBaseLocal(bSoSelecionados, comentario, acaoAlternativa ) {
	//bExportaParaArquivoJson true, o arquivo será salvo no servidor como json, se false vai para o banco de dados local
	var jsonDados = getRedeNosLigacoes(bSoSelecionados);
	var url;
	if (acaoAlternativa) {
		url = base + 'envia_json/' + acaoAlternativa;
	} else {
		if (!comentario) {
			comentario =  prompt('Digite um comentário para os dados inseridos na base local:', 'rede');
		}
		if (!comentario) {
			return;
		}
		url = base + 'json_para_base/' + encodeURIComponent(comentario);
	}

	fazFetch(url, jsonDados);
	function fazFetch(url) {
		document.body.style.cursor = 'wait';
		fetch(url, {method: 'post', body:JSON.stringify(jsonDados), headers: {"Content-type": "application/json"}, cache: "no-store"}) // mode: 'cors',
		    .then(
			function(response) {
				if (response.status !== 200) {
				document.body.style.cursor = 'default';
				console.log('Looks like there was a problem. Status Code: ' +  response.status);
				alertify.error('Aconteceu um erro 5 (' +  response.status + ')');
				return;
				}
				// Examine the text in the response
				response.json().then(function(data) {
					document.body.style.cursor = 'default';
					if (data.retorno) {
						if (acaoAlternativa) {
							//alertify.success('Dados enviados.');
							var textoMensagem = 'Dados enviados.';
						} else {
							//alert('Os dados foram inseridos na base local.');
							var textoMensagem = 'Os dados foram inseridos na base local.';
						}
						exibe_mensagem(textoMensagem, data.mensagem);
					} else {
						alertify.error('Aconteceu um erro. 6 ' + data.mensagem.popup);
					}
			    });
			}
		)
		  .catch(function(err) {
			document.body.style.cursor = 'default';
			console.log('Fetch Error :-S', err);
			alertify.error('Aconteceu um erro 7 (Fetch error ' + err + ')');
		  });
	}
}//.function menu_exportaJSONServidorParaBaseLocal

function menu_exportaJSONServidor(bSoSelecionados, bMostraAlerta, idArquivoServidor, setNos, nomeNovaAba) {
	//abre nova aba exportando dados para o servidor
	//bExportaParaArquivoJson true, o arquivo será salvo no servidor como json, se false vai para o banco de dados local
	//se setNos especificado, usa esses itens para exportar
	//se setNos = null, usa todos os itens do gráfico se bSoSelecionados=false ou só selecionados se bSoSelecionados=true
	var jsonDados;
	var novaJanela;
	if (setNos) {
		jsonDados = getRedeNosLigacoes(null, setNos);
	} else {
		jsonDados = getRedeNosLigacoes(bSoSelecionados);
	}
	if (bMostraAlerta) {
		if (!idArquivoServidor) {
			idArquivoServidor =  prompt('Digite um comentário para os dados inseridos na base local:', 'rede');
		}
	}
	if (!idArquivoServidor) {
		return;
	}
	var url = base + 'arquivos_json_upload/' + encodeURIComponent(idArquivoServidor);

	fazFetch(url, jsonDados, nomeNovaAba);
	function fazFetch(url, idArquivoServidor) {
		document.body.style.cursor = 'wait';
		fetch(url, {method: 'post', body:JSON.stringify(jsonDados), headers: {"Content-type": "application/json"}, cache: "no-store"}) // mode: 'cors',
		  .then(
			function(response) {
			  if (response.status !== 200) {
				document.body.style.cursor = 'default';
				console.log('Looks like there was a problem. Status Code: ' +  response.status);
				alertify.error('Aconteceu um erro 8 (' +  response.status + ')');
				return;
			  }
			  // Examine the text in the response
			  response.json().then(function(data) {
				//console.log(data);
				document.body.style.cursor = 'default';
				if (data.nomeArquivoServidor) {
					if (bMostraAlerta) {
						alert('O arquivo foi carregado no servidor com o nome: ' + data.nomeArquivoServidor + '\n' + 'Será aberto uma janela com o link, que poderá ser compartilhado.');
					};
					var novaJanela=window.open(base + "grafico_no_servidor/" + data.nomeArquivoServidor);
					if (nomeNovaAba) {
						//novaJanela.document.title = nomeAbaNova; //isto causa erro
						setTimeout(function(){ novaJanela.document.title = nomeNovaAba; }, 3000); //se o gráfico for muito grande, o tempo pode não ser suficiente
					}
				} else {
					alertify.error('Aconteceu um erro. 9 ' + data.mensagem.popup);
				}
			  });
			}
		  )
		  .catch(function(err) {
			document.body.style.cursor = 'default';
			console.log('Fetch Error :-S', err);
			alertify.error('Aconteceu um erro 10 (Fetch error ' + err + ')');
		  });
	}
	//return novaJanela; novaJanela só retorna null
}//.function menu_exportaJSONServidor

function menu_importaJSONServidor(idArquivoServidor, bNaoConfirma) {
	if (!idArquivoServidor) {
		idArquivoServidor =  prompt('Digite o nome do arquivo no JSON no servidor:');
	}
	if (!idArquivoServidor) {
		return;
	}
	var url = base + 'arquivos_json/' + idArquivoServidor;
	//se idArquivoServidor=temporario, o arquivo será apagado do servidor após de ser servido
	alertify.error('base: '+base+'   url: '+url)
	fazFetch(url, idArquivoServidor);
	function fazFetch(url, idArquivoServidor) {
		document.body.style.cursor = 'wait';
		//fetch(url, {method: 'get'}) // mode: 'cors',
		fetch(url, {method: 'get', headers: {"Content-type": "application/json"}, cache: "no-store"}) // mode: 'cors',
		  .then(
			function(response) {
			  if (response.status !== 200) {
				document.body.style.cursor = 'default';
				console.log('Looks like there was a problem. Status Code: ' +  response.status);
				alertify.error('Não conseguiu carregar o arquivo ' + idArquivoServidor + '. Aconteceu um erro 11 (' +  response.status + ')'+url);
				return;
			  }
			  // Examine the text in the response
			  response.json().then(function(data) {
				//console.log(data);
				document.body.style.cursor = 'default';
				inserirJson(data, ' Arquivo do Servidor: ' + idArquivoServidor, bNaoConfirma);
			  });
			}
		  )
		  .catch(function(err) {
			document.body.style.cursor = 'default';
			console.log('Fetch Error :-S', err);
			alertify.error('Aconteceu um erro 12 (Fetch error ' + err + ')');
		  });
	}
}//.function menu_importaJSONServidor

function inserirJson(jsonIn, texto, bNaoConfirma) {
	var no = jsonIn.no;
	var ligacao = jsonIn.ligacao;
	gparam.json = JSON.parse(JSON.stringify(jsonIn));
	var kn=0, kl=0;
	var idNosInseridos = new Set();
	var idNosCamadaZero = new Set();
	var kNosAInserir = 0;
	/* isto dá um valor muito maior que o real (há nós duplicados no json??)
	for (let noaux of Object.values(no)) { //verifica quantos nós serão inseridos
		if (!graph.hasNode(noaux.id)) {
			kNosAInserir += 1;
		}
	}*/
	var sNosInserir = new Set();
	for (let noaux of Object.values(no)) { //verifica quantos nós serão inseridos
		if (!graph.hasNode(noaux.id)) {
			sNosInserir.add(noaux.id);
		}
	}
	kNosAInserir = sNosInserir.size;
	if (!bNaoConfirma) {
		if (kNosAInserir > gparam.confirmaAntesDeInserirNNos) {
			let mensagem = 'Deseja inserir ' + kNosAInserir + ' itens?';
			if (kNosAInserir>1000) mensagem += '\nObs: Com muitos itens a execução ficará muito lenta ou o browser poderá travar.\nApós carregar o gráfico, utilize a rotina no menu "Visualização>Quebrar o gráfico em partes"';
			var resp = confirm(mensagem);
			if (!resp) {
				return;
			}
			gparam.confirmaAntesDeInserirNNos = kNosAInserir;
		}
	}
	if (kNosAInserir>100) {
		pinarNoTemp(Math.sqrt(kNosAInserir)*200); //fixa temporariamente o nó selecionado
	}
	for (let noaux of Object.values(no)) {
		if (!graph.hasNode(noaux.id)) {
			graph.addNode(noaux.id, JSON.parse(JSON.stringify(noaux)));
			if (noaux.posicao) {
				if ((noaux.posicao.x) && (noaux.posicao.y)) {
				gparam.layout.setNodePosition(noaux.id, noaux.posicao.x, noaux.posicao.y);
				//refreshPosicoes = true;
				}
			} else if (gparam.idnoSelecionado) { //insere novos em torno do nó selecionado.
				let posicaoReferencia = gparam.layout.getNodePosition(gparam.idnoSelecionado);
				gparam.layout.setNodePosition(noaux.id, posicaoReferencia.x + Math.random()*gparam.springLength-gparam.springLength/2, posicaoReferencia.y + Math.random()*gparam.springLength-gparam.springLength/2);
			}
			gparam.layout.pinNode(noaux, noaux.pinado);
			kn += 1;
			idNosInseridos.add(noaux.id);
			if (!noaux.camada) {
				idNosCamadaZero.add(noaux.id);
			}
		} else { //nó já existe TODO: verificar se precisa atualizar .data

		}
	}
	if (idNosInseridos.size) {
		gparam.listaIdNosInseridos.push(idNosInseridos);
	}
	for (let ligaux of Object.values(ligacao)) {
		var nosExistem = ((graph.hasNode(ligaux.origem)) && (graph.hasNode(ligaux.destino)));
		if (!nosExistem) {
			console.log('erro. Um dados de um dos nós da ligação não foi definido');
			console.log('ligacao '+ ligaux.origem + ' para ' + ligaux.destino);
			alertify.error('Erro na ligacao '+ ligaux.origem + ' para ' + ligaux.destino);
			continue;
		}
		var ligExistente = graph.hasLink(ligaux.origem, ligaux.destino);
		if (!ligExistente) {
			ligExistente = graph.hasLink(ligaux.destino, ligaux.origem);
		}
		if (ligExistente) {
			labelLigacao = ligExistente.data.label ? ligExistente.data.label : '';
			var conjLabel = new Set(labelLigacao.split(';')); //; é separador dos tipos de ligação
			//var conjNovo = new Set(ligaux.label.split(';')); //bug, quando a ligacao.label é null
			var conjNovo = new Set(ligaux.label ?  ligaux.label.split(';') : ''.split(';'));
			let uniao = new Set([...conjLabel, ...conjNovo]);
			uniao.delete('');
			ligExistente.data.label = [...uniao].join(';')
			document.getElementById('link_label_'+ligExistente.data.id).text(filtraTextoLigacao(ligExistente.data.label));
		} else { //if (!graph.hasLink(ligaux.origem, ligaux.destino)) {
			ligaux.id = gparam.kligacoes;
			if (1) { //((graph.hasNode(ligaux.origem)) && (graph.hasNode(ligaux.destino))) {
				try { //dava erro com a rede de teste
					graph.addLink(ligaux.origem, ligaux.destino, JSON.parse(JSON.stringify(ligaux)));
					kl += 1;
					gparam.kligacoes += 1;
				} catch (e) {
					console.log('erro na ligacao ' + texto);
					console.log('ligacao '+ ligaux.origem + ' para ' + ligaux.destino);
					alertify.error('Erro json na ligacao '+ ligaux.origem + ' para ' + ligaux.destino);
					//console.log(e);
					//console.log(JSON.parse(JSON.stringify(ligaux)));
				}
			} else {
				console.log('faltando um dos nós da ligação.');
				console.log('ligacao '+ ligaux.origem + ' para ' + ligaux.origem);
			}
		}
	}
	if (idNosCamadaZero.size) {
		selecionaNoid(null, false); //desseleciona tudo
		for (let n of idNosCamadaZero) {
			selecionaNoid(n, true);
		}
	}
	var textoMensagem = texto;
	if (kn)	textoMensagem += ' Foram inseridos ' + kn + ' itens';
	if (kl) {
		if (kn) {
			textoMensagem += ' e ' + kn + ' ligações.';
		} else {
			textoMensagem += ' Foram inseridos ' + kl + ' ligações.'
		}
	}
	if ((!kn) && (!kl)) textoMensagem += 'Não encontrou novos itens';
	exibe_mensagem(textoMensagem, jsonIn.mensagem);
	/*
	if (!jsonIn.mensagem) {
		jsonIn.mensagem = {'lateral': '', 'popup': '', 'confirmar': ''};
	}
	if (jsonIn.mensagem.popup) {
		alertify.alert('Alerta!', jsonIn.mensagem.popup, function(){ alertify.success(textoMensagem); });
	} else {
		alertify.success(textoMensagem);
	}
	if (jsonIn.mensagem.lateral) {
		alertify.success(jsonIn.mensagem.lateral);
	}
	*/
	if (kn  && !gparam.bRenderAtivado) { //ativa leiaute por 1 segundo para exibir novos itens
		gparam.renderer.resume();
		setTimeout(
			function() {
				if (!gparam.bRenderAtivado) {
					gparam.renderer.pause();
				};
			}, 500
		);
	}
}//.function inserirJson

function exibe_mensagem(textoMensagem, mensagem) {
	if (!mensagem) {
		mensagem = {'lateral': '', 'popup': '', 'confirmar': ''};
	}
	if (mensagem.popup) {
		alertify.alert('Alerta!', mensagem.popup, function(){ alertify.success(textoMensagem); });
	} else {
		alertify.success(textoMensagem);
	}
	if (mensagem.lateral) {
		alertify.success(mensagem.lateral);
	}
}//.exibe_mensagem

function menu_incluirCamada(idin, camada, tipo, bNaoConfirma) {
	//if idin='', manda dados dos nós selecionados
	var url = "";
	idin = idin.replace(/\//g, '');
	if ((!idin) && (!gparam.idnoSelecionado)) return; //se idin vazio, manda lista de ids selecionados

	if (tipo=='links') {
		dialogoParametrosLink();
	} else {
		url = base + 'grafojson/cnpj/' + camada + '/';
		fazFetch(url, idin);
	}
	return;
	function fazFetch(url, idin) {
		document.body.style.cursor = 'wait';
		//fetch(url, {method: 'get'}) // mode: 'cors',
		let bodyjson = idin ?  JSON.stringify([]) :  JSON.stringify([...gparam.idNosSelecionados]);
		url += idin ? idin : gparam.idnoSelecionado;
		fetch(url, {method: 'post', body:  bodyjson, headers: {"Content-type": "application/json"}, cache: "no-store"}) // mode: 'cors',
		  .then(
			function(response) {
			  if (response.status !== 200) {
				document.body.style.cursor = 'default';
				console.log('Looks like there was a problem. Status Code: ' +  response.status);
				alertify.error('Aconteceu um erro 13 (' +  response.status + ') '+ url);
				return;
			  }
			  // Examine the text in the response
			  response.json().then(function(data) {
				//console.log(data);
				document.body.style.cursor = 'default';
				if (data.no.length) {
					inserirJson(data, idin + ' em camada ' + camada +'. ', bNaoConfirma);
				} else {
					if (isNumeric(idin.replace(/[\.\-\//]/g, '').trim()) || idin.includes('*')) {
						alertify.error('Não encontrou ' + idin + ' na base.');
					} else {
						alertify.error('Não encontrou ' + idin + ' na base. Utilize o caractere curinga, por exemplo, ' + idin + '*');
					}
				}
			  });
			}
		  )
		  .catch(function(err) {
			document.body.style.cursor = 'default';
			console.log('Fetch Error :-S', err);
			alertify.error('Aconteceu um erro 14 (Fetch error ' + err + ')');
		  });
	}
	function dialogoParametrosLink() {
		//https://stackoverflow.com/questions/30712759/multiple-input-boxes-in-alertifyjs-prompt-dialog
		/* This is important : strip the HTML of dlgContent to ensure no conflict of IDs for input boxes arrises" */
		/* Now instead of making a prompt Dialog , use a Confrm Dialog */
		//var dlgLink = document.getElementById('dlgLink');
		var dlgLinkOriginal = document.getElementById('dlgLink');
		var dlgLink = document.getElementById('dlgLink').cloneNode(true); //clone para não mexer no original, soluciona problema de instabilidade (parava de funcionar depois de misturar tipos de consulta, cnpj e link)
		//document.getElementById('dlgLink_camadas').value = camada;
		//var dlLinkhtml = dlgLink.outerHTML;
		//var dlLinkhtml = dlgLink.outerHTML;
		dlgLinkOriginal.parentNode.appendChild(dlgLink);
		dlgLink.outerHTML = ''; //isso funciona no firefox mas no chrome dá erro no chrome sem a linha de cima
		/*
		try {
			dlgLink.outerHTML = ''; //isso funciona no firefox mas no chrome dá erro.
		} catch (e) {
			console.log(e);
		}*/
		ativaAtalhos(false);
		alertify.confirm(dlgLink).set('onok', function(closeevent, value) {
			/*
			var valorMinimo = parseFloat(dlgLink.getElementById('dlgLink_valorMinimo').value).toString();
			var valorMaximo = parseFloat(dlgLink.getElementById('dlgLink_valorMaximo').value).toString();
			var numeroItens = parseInt(dlgLink.getElementById('dlgLink_numeroItens').value).toString();
			var camada = parseInt(dlgLink.getElementById('dlgLink_camadas').value).toString();*/
			var listaInput = dlgLink.getElementsByTagName('input');
			var valorMinimo = parseFloat(listaInput.dlgLink_valorMinimo.value).toString();
			var valorMaximo = parseFloat(listaInput.dlgLink_valorMaximo.value).toString();
			var numeroItens = parseInt(listaInput.dlgLink_numeroItens.value).toString();
			var camada = parseInt(listaInput.dlgLink_camadas.value).toString();
			//copia parametros para formulário original
			var listaInputOriginal = dlgLinkOriginal.getElementsByTagName('input');
			listaInputOriginal.dlgLink_valorMinimo.value = listaInput.dlgLink_valorMinimo.value;
			listaInputOriginal.dlgLink_valorMaximo.value = listaInput.dlgLink_valorMaximo.value;
			listaInputOriginal.dlgLink_numeroItens.value = listaInput.dlgLink_numeroItens.value;
			listaInputOriginal.dlgLink_camadas.value = listaInput.dlgLink_camadas.value;
			/* Insert your code to work with the two values */
			// await new Promise(r => setTimeout(r, 1000)); //delay de 1 segundo
			valorMinimo = (valorMinimo!='NaN')?valorMinimo:'0';
			valorMaximo = (valorMaximo!='NaN')?valorMaximo:'0';
			numeroItens = (numeroItens!='NaN')?numeroItens:'0';
			camada = (camada!='NaN')?camada:'0';
			ativaAtalhos(true);
			url = base + 'grafojson/links/'  + camada +  '/' + numeroItens + '/' + valorMinimo + '/' + valorMaximo  + '/' ;
			fazFetch(url, idin);
			//dlgLink.outerHTML = dlLinkhtml;
			ativaAtalhos(true);
		}, function() {
			ativaAtalhos(true); }
		).set('oncancel', function() { ativaAtalhos(true);  })
		.set('title',"Inserir Ligacoes");
		//dlgLink.outerHTML = dlLinkhtml; //não sei se isso tem que ficar dentro dos callbacks
		document.getElementById('dlgLink_camadas').value = camada; //estranho, mas tem que por isso pra ajustar o campo com o valor
	}
}//.function menu_incluirCamada

function menu_inserir(textoDefault, teclaShift, teclaCtrl) {
	if (teclaCtrl) {
		return;
	}
	if (teclaShift) {
		return menu_ligar_novo();
	}
	if (!gparam.inicio.bBaseReceita) {
		return menu_ligar_novo();
	}
	var camada = 0;
	ativaAtalhos(false);
	var itensDefault = gparam.inserirDefault;
	if (textoDefault) {
		itensDefault = textoDefault;
	}
	var textoPrompt = 'Digite CNPJ, radical do CNPJ, Razão Social Completa, Nome Completo do Sócio ou vários CNPJs separados por ponto e virgula (;). ';
	if (gparam.inicio.bBaseFullTextSearch) {
		textoPrompt += ' Para realizar busca por parte do nome, utilize * (curinga de palavra), ? ( 1 caractere) ou aspas (mesma sequência de palavras). Por ex: FULANO DE *, *DE TAL, F?LANO DE TAL , "FULANO DE"*, EMPRESA* BRASILEIRA.';
	} else {
		textoPrompt += ' Não foi implementada busca parcial.';
	}
	textoPrompt += ' A busca por nome está limitada por padrão a 10 registros. Se desejar mais registros, coloque o nome seguido de @ e número, por exemplo, FULANO@20 para 20 registros. Para exibir Matriz e 10 filiais, digite apenas o Radical do CNPJ seguido de @10. Digite TESTE para visualizar um CNPJ aleatório.';
	alertify.prompt( 'Inserir item no gráfico', textoPrompt , itensDefault
               , function(evt, cnpjs) {
					gparam.inserirDefault = cnpjs;
					var cn = cnpjs.trim().toUpperCase();
					if (cn) {
						if (cn=='T') {
							cn='TESTE';
						}
						if (cn=='TESTE') {
							if (gparam.numeroInsercoes==0) { //se for primeira insercao de teste, já coloca camada 2
								camada = 1;
							}
						}
						if (camada==0) {
							camada = prompt('Quantidade de Camadas (ou Níveis da consulta)', 1);
						}
						if (camada) {
							menu_incluirCamada(cn, camada);
							gparam.numeroInsercoes += 1;
						}
					}
					ativaAtalhos(true);
				}, function() { ativaAtalhos(true);}
	);
}//.function menu_inserir

function menu_buscaEmSite(siteUrl){
	var parametro = replaceAll(graph.getNode(gparam.idnoSelecionado).data.descricao,'&', ' ');
	if (!parametro) {
		parametro = graph.getNode(gparam.idnoSelecionado).data.id.substr(3);
	}
	var strUrl = siteUrl + '"' + parametro + '"';
	window.open(strUrl).focus();
} //.function menu_buscaEmSite

function menu_GoogleMaps() {
	var data = graph.getNode(gparam.idnoSelecionado).data;
	if (data.logradouro) {
		var strUrl = 'https://www.google.com.br/maps/place/' + data.logradouro + ',' + data.municipio + '/' + data.uf;
		var novaJanela=window.open(strUrl);
		novaJanela.focus();
	} else {
		alertify.error('Não há endereço cadastrado.');
	}
}//.function menu_GoogleMaps

function menu_abrirNovaAba(idno, bNosSelecionados) {
	var novaJanela=null;
	if ((!idno)&&(!bNosSelecionados)) {
		novaJanela=window.open(base + '?pula_mensagem=sim');
		novaJanela.focus();
		return;
	}
	if ((!idno)&&bNosSelecionados) { //abre numa nova aba os nós selecionados
		menu_exportaJSONServidor(true, false, 'temporario', null, document.title + '-parcial')
		return;
	}
	if (idno.startsWith('LI_')) {
		novaJanela=window.open(idno.substr(3));
		novaJanela.focus();
		return;
	} else if (idno.startsWith('AR_')) {
		var url = base + 'abrir_arquivo/' ; //+ idno.substr(3);
		//novaJanela=window.open(strUrl);
		if (!window.location.href.startsWith('http://127.0.0.1')) {
			if (idno.includes('/') || idno.includes('\\') ) {
				alert('Essa rotina somente abre arquivos se a execução do projeto for local.');
				return;
			}
		}
		let bodyjson = JSON.stringify([idno.substr(3)]); //JSON.stringify([...gparam.idNosSelecionados]);
		fetch(url, {method: 'post', body: bodyjson, headers: {"Content-type": "application/json"}, cache: "no-store"}) // mode: 'cors',
			.then(
			function(response) {
			  if (response.status !== 200) {
				console.log('Looks like there was a problem. Status Code: ' +  response.status);
				alertify.error('Aconteceu um erro 15 (' +  response.status + ')');
				return;
			  }
			  // Examine the text in the response
			  response.json().then(function(data) {
				if (data['retorno']) {
					alertify.success('O arquivo ' + idno.substr(3) + ' foi aberto.');
				} else {
					alertify.error('O arquivo ' + idno.substr(3) + ' não foi aberto. ' + data['mensagem']);
				}
			  });
			}
			)
			.catch(function(err) {
				alertify.error('Aconteceu um erro 16 (Fetch error ' + err + ')');
			});

		return;
	}
	/*
	ativaAtalhos(false);
	alertify.prompt( 'Abrir ' + idno+  ' em nova aba', 'Selecione camadas', '1',
		function(evt, cam) {
			ativaAtalhos(true);
			var strUrl = base + 'grafico/' + cam + '/' + idno;
			novaJanela=window.open(strUrl);
			novaJanela.focus();} ,
		function() { ativaAtalhos(true);}
	) ;
	*/
}//.function menu_abrirNovaAba

function menu_nomeAba() {
	var nome = prompt('Digite o nome para esta aba');
	if (nome) {
		document.title = nome;
	}
}//.menu_nomeAba

function menu_selecionarTudo() {
	graph.forEachNode(
		function(node) {
			//var nodeUI = graphics.getNodeUI(node.id);
			selecionaNoid(node.id, true, true);
		}
	);
	alertify.success('Foram selecionados ' + graph.getNodesCount() + ' itens.');
}//.function menu_selecionarTudo

function menu_selecionarInverte() {
	//inverte a seleção
	var snos = new Set(gparam.idNosSelecionados);
	selecionaNoid(null, false); //apaga seleção
	graph.forEachNode(
		function(node) {
			if (!snos.has(node.id)) {
				//var nodeUI = graphics.getNodeUI(node.id);
				selecionaNoid(node.id, true, true);
			}
		}
	);
	alertify.success('Foram selecionados ' + gparam.idNosSelecionados.size+ ' itens.');
}//.function menu_selecionarInverte

function menu_pinarNo(bfixar){
	var layout = gparam.layout;
	for (let n of gparam.idNosSelecionados) {
		let no = graph.getNode(n);
		if (bfixar===null) { //inverte
			layout.pinNode(no, !layout.isNodePinned(no));
		} else if (bfixar==1) {
			layout.pinNode(no, true);
		} else if (bfixar==0) {
			layout.pinNode(no, false);
		}
	}
//	var no = graph.getNode(gparam.idnoSelecionado);
//	layout.pinNode(no, !layout.isNodePinned(no));
}//.function menu_pinarNo

function menu_pinarDesfazerTudo(){
	var layout = gparam.layout;
	graph.forEachNode(
		function(node) {
			gparam.layout.pinNode(node, false);
		}
	);
	alertify.success('Todos os nós foram desafixados.');
}//.function menu_pinarDesfazerTudo

function menu_pinarUmNoEmCadaGrupo(bfixar){
	var listaGrupos = separaGrupos(0); //lista de sets
	var sfixados = new Set();
	for (let sgrupo of listaGrupos) {
		let nid = [...sgrupo][0];
		let no = graph.getNode(nid);
		gparam.layout.pinNode(no, true);
		sfixados.add(nid);
	}
	selecionaSet(sfixados);
	alertify.success('Cada grupo teve um nó fixado.');
}//.function menu_pinarUmNoEmCadaGrupo

function pinarNoTemp(milissegundos) {
	var layout = gparam.layout;
	if (!gparam.idnoSelecionado) {
		return;
	}
	var no = graph.getNode(gparam.idnoSelecionado);
	if (layout.isNodePinned(no)) {
		return;
	}
	layout.pinNode(no, true);
	//gparam.scale = graphics.scale;
	//desabilita scale temporariamente (se tiver muitos nós, mexer na escala pode travar o browser
	gparam.mensagem_alerta_zoom_desativado = 'O zoom foi temporariamente desativado. Aguarde alguns segundos.';
	graphics.scale = function(a,b) {
		//alertify.error('O zoom foi temporariamente desativado. Aguarde alguns segundos.');
		if (gparam.mensagem_alerta_zoom_desativado) { alertify.error(gparam.mensagem_alerta_zoom_desativado); };
		gparam.mensagem_alerta_zoom_desativado = ''; //exibe mensagem só uma vez
		return gparam.renderer.getTransform().scale;
	};
	setTimeout(
		function() {
			layout.pinNode(no, false);
			graphics.scale = gparam.fScale;
		}, milissegundos
	);
}//.function pinarNoTemp

function menu_rotulosCompletos(bTipo) {
	if (bTipo===null) {
		gparam.kTipoRotulo = (gparam.kTipoRotulo + 1) % 4;
	} else if (bTipo) {
		gparam.kTipoRotulo=0;
	} else {
		gparam.kTipoRotulo=2;
	}
	graph.forEachNode( function(node) {
		var ui=graphics.getNodeUI(node.id);
		var [identificador, nome, nota] = labelsNo(node, gparam.kTipoRotulo); //node.data.label.split('\n');
		ui.getElementsByTagName('tspan')[0].text(identificador);
		ui.getElementsByTagName('tspan')[1].text(nome);
		ui.getElementsByTagName('tspan')[2].text(nota);
	});
}//.function menu_rotulosCompletos

function menu_ligacoesExibe(bTipo) {
	if (bTipo===null) {
		gparam.bMostraLigacao = !gparam.bMostraLigacao;
	} else if (bTipo) {
		gparam.bMostraLigacao= true;
	} else {
		gparam.bMostraLigacao= false;
	}
	//zoom in e out para dar um refresh na tela
	gparam.renderer.zoomIn();
	gparam.renderer.zoomOut();
}//.function menu_ligacoesExibe

function menu_rotulosPosicao(bTipo) {
	if (bTipo===null) {

	} else if (bTipo) {
		gparam.btextoEmbaixoIcone=true;
	} else {
		gparam.btextoEmbaixoIcone=false;
	}
}//.function menu_rotulosPosicao

function menu_colorir(corEscolhida) {
	function colorir(n, cor) {
		var node = graphics.getNodeUI(n);
		try {
			node.getElementsByTagName('rect')[0].setAttribute('fill',cor);
		} catch (e){; };
		var no = graph.getNode(n);
		if (no) {
			no.data.cor = cor;
		}

	}
	if (!gparam.idNosSelecionados.size) {
		alertify.alert('Colorir', 'Não há itens selecionados para colorir. Selecione e tente novamente.', function(){ ; });
		return;
	}
	var cor = document.querySelector("#palheta").value;
	if (corEscolhida) {
		cor = corEscolhida;
	}
	var tmensagem = (gparam.idNosSelecionados.size==1) ? 'Colorir 1 nó.' : ('Colorir '+ gparam.idNosSelecionados.size + ' nós selecionados.');
	var tsucesso = (gparam.idNosSelecionados.size==1) ? '1 nó foi colorido.' : (gparam.idNosSelecionados.size + ' nós foram coloridos.');
	for (let n of gparam.idNosSelecionados) {
		colorir(n, cor);
	}
	alertify.success(tsucesso);
}//.function menu_colorir

function menu_ligar_selecionados(bEstrela, nomeLigacao, bSemMensagem) {
	// se bEstrela, liga o primeiro selecionado com todos os outros
	// se !bEstrela, tipo fila, liga linearmente do primeiro ao segundo, segundo ao terceiro e sucessivamente.
	if (gparam.idNosSelecionados.size<2) {
		if (!bSemMensagem) {
			alertify.alert('Ligar nós selecionados', 'Não há itens selecionados. Selecione e tente novamente.', function(){ ; });
		}
		return;
	}
	let label = nomeLigacao?nomeLigacao:'';
	let primeiroNo = [...gparam.idNosSelecionados][0];

	if (!bSemMensagem) {
		var mensagem = bEstrela ? 'Deseja ligar o item ' +  primeiroNo + ' aos itens ' + (gparam.idNosSelecionados.size-1) + ' selecionados?' : 'Deseja ligar os ' + gparam.idNosSelecionados.size + ' itens selecionados?';
		mensagem += '\nDigite o texto da ligaçao (opcional):';
		if (!nomeLigacao) {
			if (nomeLigacao==='') {
				if (!confirm(mensagem)) {
					label = null;
				}
			} else {
				label = prompt(mensagem, '');
			}
		}
		if (label===null) {
			return;
		}
	}
	var ligacoes = [];
	var anterior = null;
	var destino = null;
	var inicial = null
	for (let n of gparam.idNosSelecionados) {
		if (!inicial) {
			anterior = n;
			inicial = n;
		} else {
			destino = n;
			ligacoes.push({'origem': anterior,
						   'destino': destino,
						   'cor': gparam.corLigacaoLink, //'green',
						   'camada': 1,
						   'tipoDescricao': '', //'link',
						   'label': label});
			if (!bEstrela) {
				anterior = destino;
			}
		}
	}
	/*
	if (!bEstrela) { //isso fecha o círculo
		anterior = destino;
		ligacoes.push({'origem': anterior,
								   'destino': inicial,
								   'cor': gparam.corLigacaoLink, //'green',
								   'camada': 1,
								   'tipoDescricao': '', //'link',
								   'label': label});
	} */
	var noLigacoes = {'no':[], 'ligacao':ligacoes, 'mensagem':{'lateral': '', 'popup': '', 'confirmar': ''}};
	inserirJson(noLigacoes,' Ligações. ');
	return true;
}//.function menu_ligar_selecionados

function menu_desligar_selecionados(bRemoverTodasLigacoes) {
	//se bRemoverTodasLigacoes=false, só remove se a ligação for entre DOIS itens selecionados
	var resp;
	if (!gparam.idNosSelecionados.size) {
		alertify.alert('Remover ligação', 'Não há itens selecionados. Selecione e tente novamente.', function(){ ; });
		return;
	}
	if (bRemoverTodasLigacoes) {
		resp = confirm('Deseja remover TODAS as ligações dos itens selecionados? Não será possível reverter.');
		if (!resp) return;
	}
	/*
	for (let n1 of gparam.idNosSelecionados) {
		graph.forEachLinkedNode(n1, function(n2, link){
			//console.log(n1 + '->' + n2.id);
			if (bRemoverTodasLigacoes || gparam.idNosSelecionados.has(n2.id) ) { //
				var linkUIaux=null;
				try {
					linkUIaux = graphics.getLinkUI(link.id);
					element=document.getElementById('link_label_'+linkUIaux.attr('id'));
					element.parentNode.removeChild(element);
					graph.removeLink(link); //remover dentro do loop pode causar alguma inconsistência?
				} catch (e){; };
			}
		});
	} */
	var slinkIds = new Set();
	while (true) { //loop, primeiro tenta apagar link ENTRE os selecionados, se não achar ligação, tenta apagar todas as ligações dos selecionados
		graph.forEachLink(function(link){
			if (link) {
				if ( (gparam.idNosSelecionados.has(link.fromId) && gparam.idNosSelecionados.has(link.toId)) ||
					 ( bRemoverTodasLigacoes && (gparam.idNosSelecionados.has(link.fromId) || gparam.idNosSelecionados.has(link.toId)) ) ) {
						slinkIds.add(link);
				}
			}
		});
		if (slinkIds.size) {
			break;
		}
		if (bRemoverTodasLigacoes) {
			if (!slinkIds.size) {
				alertify.success('Não há ligações a remover.');
				return;
			}
			break;
		} else {
			if (!slinkIds.size) {
				resp = confirm('Não há ligações ENTRE os itens selecionados. Deseja remover TODAS as ligações dos itens selecionados?');
				if (!resp) {
					return;
				}
				bRemoverTodasLigacoes = true;
			}
		}
	}
	for (let link of slinkIds) {
		var linkUIaux=null;
		try {
			linkUIaux = graphics.getLinkUI(link.id);
			element=document.getElementById('link_label_'+linkUIaux.attr('id'));
			element.parentNode.removeChild(element);
			graph.removeLink(link);
		} catch (e){; };
	}
}//menu_desligar_selecionados

function sv(texto) {
	return texto? texto:'';
}

function junta(a, separador, b) {
	if (a && b) {
		return ''+ a + separador + b;
	} else if (a) {
		return ''+a;
	} else if (b) {
		return ''+b;
	}
	return ''
}

function removeGalhos(bExibeMensagem) {
	var quantidadeLigacoes;
	var sNosRemover;
	var contagem=0;
	if (!confirm('Deseja simplificar o gráfico, mantendo apenas os itens com mais de uma ligação ou que tenha alguma anotação ou cor? Não será possível reverter!!')) {
		return;
	}
	while (true) {
		sNosRemover = new Set();
		graph.forEachNode(function(node) {
			if (node) {
				quantidadeLigacoes = 0 + graph.getLinks(node.id).length;
				if ((quantidadeLigacoes <= 1) && (node.data.camada != 0) && (!node.data.cor) && (!node.data.nota)) {
					sNosRemover.add(node.id);
				}
			}
		});
		contagem += sNosRemover.size;
		if (sNosRemover.size==0) {
			break;
		}
		sNosRemover.forEach(removeIdNo);
	}
	if (bExibeMensagem) {
		if (contagem>0) {
			alertify.success('Foram removidos ' + contagem + ' items.');
		} else {
			alertify.success('Não foram localizados itens para remover.');
		}
	}
} //.function removeGalhos

function menu_quebraGraficoEmPartes(){
	var ngrupos = prompt('Deseja quebrar este gráfico em outras abas em partes menores? Especifique a quantidade aproximada de novas abas (máximo de 10)', 4);
	ngrupos = parseInt(ngrupos);
	if (!ngrupos) {
		return;
	}
	if (ngrupos>10) {
		alertify.error('Escolha uma quantidade menor de novas abas.');
		return;
	}
	var tamanho = Math.floor(graph.getNodesCount()/ngrupos)+1;
	//console.log(tamanho);
	var conjuntos = separaGrupos(tamanho);
	if (conjuntos.length==1) {
		alert('O gráfico não pode ser separado.');
		return;
	}
	var k = 0;
	for (let conj of conjuntos) {
		var sconj = new Set(conj);
		//este alert serve para criar um delay entre as requisições... Se não houver pausa o servidor tenta criar arquivos json com nome repetido o que vai dar erro depois.
		resp = confirm('Deseja criar uma nova aba com ' + sconj.size + ' elementos?');
		if (resp) {
			k += 1;
			menu_exportaJSONServidor(null, null, 'temporario', sconj, document.title + '-' + k);
		} else {
			resp = confirm('Deseja abrir outras abas?');
			if (!resp) {
				break;
			}
		}
	}
	alertify.success('Foram inseridas ' + k + ' novas abas');
}//function menu_quebraGraficoEmPartes

function separaGrupos(tamanhoGrupo) {
	//pega os nos do gráfico e separa em grupos até tamanhoGrupo, mantendo os itens conectados juntos
	//se tamanhoGrupo=0, retorna os subcomponentes (árvores, regiões conectadas) do grafico, listaGrupos = lista de sets = [set(componente1), set(componente2)...]
	//se tamanhoGrupo<>0, retorna lista de conjuntos = [[conjunto1], [conjunto2],..]
	var di = {};
	var bMudou = false;
	var contagemAnterior = -1;
	//inicializa di com id, o loop while irá fazer que di[elemento] seja o menor para os que estão ligados
	graph.forEachLink(function(link){
		di[link.fromId] = link.fromId;
		di[link.toId] = link.toId;
	});
	graph.forEachNode(function(node){
		di[node.id] = node.id;
	});
	var sgrupos = null;
	while (1) {
		bMudou = false;
		graph.forEachLink(function(link){
			var menor = (di[link.fromId]<=di[link.toId]) ? di[link.fromId] : di[link.toId] ;
			if (di[link.fromId] != di[link.toId]) {
				bMudou = true;
			}
			di[link.fromId] = menor;
			di[link.toId] = menor;
		});

		sgrupos = new Set(Object.values(di));
		if ((sgrupos.size==contagemAnterior)&&(!bMudou)) {
			break;
		}
		contagemAnterior = sgrupos.size;
		//console.log(sgrupos.size);
		//break;
	}
	//dgrupo associa o menor valor do grupo com um set com os elementos do grupo
	var dgrupo = {};
	for (const [k, v] of Object.entries(di)) {
		var value = dgrupo[v];
		if (value == null) {
			dgrupo[v] = new Set();
		}
		dgrupo[v].add(k);
	}

	//cada elemento de listaGrupos é set com itens conectados
	var listaGrupos = [];
	for (const v of Object.values(dgrupo)) {
		listaGrupos.push(v);
	}

	listaGrupos.sort(function(a,b){
	  return b.size - a.size; //ordem decrescente, size porque os elementos são sets
	});
	if (!tamanhoGrupo) {
		return listaGrupos; //[ set1, set2,...]
	}
	//conjuntos, tenta separar os conjuntos com no máximo tamanhoGrupo, preservando as ligações
	//se o grupo conexo já for maior que tamanhoGrupo, coloca sem quebrá-lo

	var conjuntos = [];
	var tamanhoAux = 0;
	var caux = []; //new Set();
	for (const v of listaGrupos) {
		if ((caux.length==0)||((v.size+caux.length)<tamanhoGrupo)) {
			Array.prototype.push.apply(caux, Array.from(v));
		} else {
			conjuntos.push(JSON.parse(JSON.stringify(caux)));
			caux = Array.from(v);
		}
		if (caux.length>=tamanhoGrupo) {
			conjuntos.push(JSON.parse(JSON.stringify(caux)));
			caux = []; //new Set();
		}
	}
	if (caux.length) {
		conjuntos.push(JSON.parse(JSON.stringify(caux)));
	}
	return conjuntos; //[ lista1, lista2,..]
} //separaGrupos

function menu_selecionaGruposComDuasCores(){
	//seleciona os grupos com duas cores (entradas e alvos)
	var conjuntos = separaGrupos(0);
	var k = 1;
	if (conjuntos.length==1) {
		alert('O gráfico só tem um grupo conexo.');
		return;
	}
	var lista = [];
	for (let sconj of conjuntos) {
		var cores = new Set();
		for (let idin of sconj) {
			var noData = graph.getNode(idin).data;
			if (noData && noData.cor) {
				cores.add(noData.cor);
			}
		}
		if (cores.size>=2) {
			Array.prototype.push.apply(lista, Array.from(sconj));
		}
	}
	selecionaSet(new Set(lista));
	if (lista.length) {
		alertify.success('Os grupos com cores diferentes foram selecionados, no total de '+lista.length+' elementos');
	} else {
		alertify.error('Não há grupos com cores diferentes');
	}
}//function menu_selecionaGruposComDuasCores

function removeIsolados(bExibeMensagem) {
	var quantidadeLigacoes;
	var sNosRemover;
	var contagem=0;
	if (!confirm('Deseja remover os itens sem ligação? Não será possível reverter!!')) {
		return;
	}
	sNosRemover = new Set();
	graph.forEachNode(function(node) {
		if (node) {

			quantidadeLigacoes = 0 ;
			getlinks = graph.getLinks(node.id);
			if (getlinks) {
				quantidadeLigacoes += getlinks.length;
			}
			if (quantidadeLigacoes == 0) {
				sNosRemover.add(node.id);
			}
		}
	});
	contagem = sNosRemover.size;
	if (sNosRemover.size) {
		sNosRemover.forEach(removeIdNo);
	}
	if (bExibeMensagem) {
		if (contagem>0) {
			alertify.success('Foram removidos ' + contagem + ' items.');
		} else {
			alertify.success('Não foram localizados itens isolados para remover.');
		}
	}
} //.function removeIsolados

function criarNovoNo(idNovo, descricaoNovo, nota, nomeLigacao, dados) {
	/*
	var no = {'id': idNovo,
			   'descricao': descricaoNovo,
			   'camada': 0,
			   'situacao_ativa': true,
			   'imagem': iconeF(idNovo), //'icone-grafo-id.png',
			   'cor': 'yellow',
			   'nota': nota}; */
	var nodados = {};
	if (dados) {
		nodados = JSON.parse(JSON.stringify(dados))
	}
	nodados.id = idNovo;
	nodados.descricao = descricaoNovo;
	nodados.nota = nota;
	nodados.camada = nodados.camada ? nodados.camada : 0;
	//nodados.situacao_ativa = nodados.situacao_ativa ? nodados.situacao_ativa : true;
	nodados.imagem = nodados.imagem ? nodados.imagem : iconeF(idNovo);
	nodados.cor = nodados.cor ? nodados.cor : 'yellow';

	graph.addNode(idNovo, JSON.parse(JSON.stringify(nodados)));
	if (gparam.idnoSelecionado) {
		var position = gparam.layout.getNodePosition(gparam.idnoSelecionado);
		position.x = position.x + Math.random()*gparam.springLength-gparam.springLength/2;
		position.y = position.y + Math.random()*gparam.springLength-gparam.springLength/2;
		gparam.layout.setNodePosition(idNovo, position.x, position.y);
	}
	selecionaNoid(idNovo, true, true);
	//trocar ordem da seleção para as setas ficarem saindo do novo item
	let ids = [...gparam.idNosSelecionados];
	ids.unshift(idNovo);
	gparam.idNosSelecionados = new Set(ids);
	gparam.idnoSelecionado = idNovo;
	gparam.listaIdNosInseridos.push(new Set([idNovo]));
	if (gparam.idNosSelecionados.size==1) {
		return;
	}
	if (!menu_ligar_selecionados(true, nomeLigacao)) {
		gparam.renderer.moveTo(position.x, position.y);
		gparam.layout.pinNode(graph.getNode(idNovo),true);
		menu_rendererAtivarParar(true, false);
	}
	selecionaNoid(idNovo, false, false);
}//.function criarNovoNo

function menu_ligar_novo(idNovo, descricaoNovo) {
	//cria novo item (não PJ) e liga com nós selecionados.
	idNovo = idNovo ? idNovo: ''; //idNovo = idNovo ?? ''
	descricaoNovo = descricaoNovo ? descricaoNovo: '';
	var dlgItemOriginal = document.getElementById('dlgItem');
	var dlgItem = document.getElementById('dlgItem').cloneNode(true); //clone para não mexer no original, soluciona problema de instabilidade (parava de funcionar depois de misturar tipos de consulta, cnpj e link)
	var camposTexto = dlgItem.getElementsByClassName('ajs-input');
	camposTexto[0].value= idNovo;
	camposTexto[1].value= descricaoNovo;
	camposTexto[2].value= '';
	camposTexto[3].value= '';
	dlgItemOriginal.parentNode.appendChild(dlgItem); // para dlgItem.outerHTML = '' funcionar no chrome
	dlgItem.outerHTML = ''; //receita de bolo. sem isso  a linha de cima dava erro no chrome
	ativaAtalhos(false);
	alertify.confirm(dlgItem).set('onok', function(closeevent, value) {
		ativaAtalhos(true);
		var camposTexto = dlgItem.getElementsByClassName('ajs-input');
		//idNovo = camposTexto[0].value.toUpperCase().trim();
		idNovo = camposTexto[0].value.trim();
		descricaoNovo = camposTexto[1].value;
		var tnota = camposTexto[2].value;
		var tligacao = camposTexto[3].value;
		if (!idNovo) {
			alert('O Identificador não pode ser nulo. Tente novamente.');
			return;
		}
		if (idNovo.startsWith('https://') || idNovo.startsWith('http://')) {
			idNovo = 'LI_' + idNovo;
		} else if (idNovo.startsWith('"') && idNovo.endsWith('"')) { //aspas quando se copia o caminho completo pelo menu contextual no windows. não sei como fica em outros sistemas
			idNovo = 'AR_' + idNovo.slice(1,-1);
		} else if (idNovo.startsWith('C:\\') || idNovo.startsWith('D:\\') || (idNovo.substr(1,2)==':\\')) { //isso só vai funcionar no windows
			idNovo = 'AR_' + idNovo;
		} else if (idNovo.startsWith('LI_') || idNovo.startsWith('AR_')) { //não por em maiuscula, senão link para url não funciona
			//não faz nada
		} else {
			idNovo = idNovo.toUpperCase();
		}
		idNovo = tipoPresumido(idNovo);
		if (graph.hasNode(idNovo)) {
			alert('Item novo:\n\nO identificador ' + idNovo + ' já existe no gráfico.\nTente novamente com identificador diferente.');
			return;
		}
		/*
		if (idNovo.startsWith('PJ_')) {
			alert('Para inserir um PJ, use a opção Inserir CNPJ ou CPF (I)');
			ativaAtalhos(true);
			return;
		}*/
		descricaoNovo = idNovo.startsWith('PF_')?idNovo.substr(15):descricaoNovo;
		criarNovoNo(idNovo, descricaoNovo, tnota, tligacao, {});
	}, function() {
		ativaAtalhos(true); }
	).set('oncancel', function() { ativaAtalhos(true);  })
	.set('title',"Novo Item");
}//.function menu_ligar_novo

function menu_editar_no(noid) {
	//edita dados item, se o usuário alterar o id, cria novo item.
	if (!noid) {
		noid = gparam.idnoSelecionado;
	}
	var idNovo =  noid;
	var node = graph.getNode(noid);
	if (!node) {
		alert(noid + ' não foi encontrado.')
		return;
	}
	var ui=graphics.getNodeUI(noid);
	var dlgItemOriginal = document.getElementById('dlgItemEditar');
	var dlgItem = document.getElementById('dlgItemEditar').cloneNode(true); //clone para não mexer no original, soluciona problema de instabilidade (parava de funcionar depois de misturar tipos de consulta, cnpj e link)
	var camposTexto = dlgItem.getElementsByClassName('ajs-input');
	camposTexto[0].value= noid;
	camposTexto[1].value= node.data.descricao;
	camposTexto[2].value= node.data.nota;
	camposTexto[2].value= '';
	dlgItemOriginal.parentNode.appendChild(dlgItem); // para dlgItem.outerHTML = '' funcionar no chrome
	dlgItem.outerHTML = ''; //receita de bolo para usar o alertify.confirm. sem isso  a linha de cima dava erro no chrome
	ativaAtalhos(false);
	alertify.confirm(dlgItem).set('onok', function(closeevent, value) {
		ativaAtalhos(true);
		var camposTexto = dlgItem.getElementsByClassName('ajs-input');
		//idNovo = camposTexto[0].value;
		var idNovo = camposTexto[0].value;
		var tligacao = camposTexto[3].value;
		if (!idNovo) {
			alert('O Identificador não pode ser nulo.');
			return;
		}
		if (idNovo.startsWith('https://') || idNovo.startsWith('http://')) {
			idNovo = 'LI_' + idNovo;
		} else if (idNovo.startsWith('"') && idNovo.endsWith('"')) {
			idNovo = 'AR_' + idNovo.slice(1,-1);
		} else if (idNovo.startsWith('C:\\') || idNovo.startsWith('D:\\') || (idNovo.substr(1,2)==':\\')) {
			idNovo = 'AR_' + idNovo;
		}
		idNovo = tipoPresumido(idNovo);
		if (noid==idNovo) {
			node.data.descricao = camposTexto[1].value;
			node.data.nota = camposTexto[2].value;
			ui.getElementsByTagName('tspan')[1].text(node.data.descricao);
			ui.getElementsByTagName('tspan')[2].text(node.data.nota);

		} else {
			if (graph.hasNode(idNovo)) {
				alert('Item novo:\n\nO identificador ' + idNovo + ' já existe no gráfico.\nTente novamente com identificador diferente.');
				return;
			} else {
				criarNovoNo(idNovo, node.data.descricao, node.data.nota, tligacao, node.data);
			}
		}
	}, function() {
		ativaAtalhos(true); }
	).set('oncancel', function() { ativaAtalhos(true);  })
	.set('title',"Editar Item");
}//.function menu_editar_no

function soDigitos(id) {
//usar com cautela, só deixar digitos para verificar cpf/cnpj pode dar resultado incorreto, p. ex: XX12345678901 seria considerado cpf
	return id.replace(/\D+/g, '');
}//.function soDigitos

function isNumeric(str) {
  var er = /^[0-9]+$/;
  return (er.test(str));
}//.function isNumeric

function tipoPresumido(id) {
	// supõe se tiver undercores na terceira posicao, já começa com tipo EN_, PF_ , PJ_, etc
	if (!id) {
		return '';
	}
	if ((id.length>3) && (id.substr(2,1) == '_') && (id.substr(0,2)==id.substr(0,2).toUpperCase()) && (!isNumeric(id.substr(0,2)))) {
		return id.trim();
	}
	//var digitos = soDigitos(id); //problema em usar soDigitos, pode ter letra + 14 ou 11 numeros
	var idlimpo = id.replace(/[\.\-\//]/g, '').trim();
	if (isNumeric(idlimpo) && (idlimpo.length==14)) {
		return 'PJ_' + idlimpo;
	} else if (isNumeric(idlimpo) && (idlimpo.length==11)) { //falta adicionar nome
		return 'PF_' + idlimpo;
	} else {
		return 'ID_' + id.trim();
	}
}//.function tipoPresumido

function alterarItens(dadosNos) {//altera dados do item a partir de lista de dados de nos, corrige elemento visível (nota, cor ou imagem)
	for (let no of dadosNos) {
		var noid = no['id'];
		var node = graph.getNode(noid);
		var ui=graphics.getNodeUI(noid);
		for (const [chave, valor] of Object.entries(no)) {
			if (chave=='id') {
				continue;
			}
			var valorAux = valor.trim();
			if ((chave=='nota') && (valorAux.startsWith('+'))) { //se começar com +, adiciona a nota existente
				valorAux = node.data['nota'] + ' ' + valorAux.substr(1);
			}
			node.data[chave] = valorAux;
			if (chave=='nota') {
				ui.getElementsByTagName('tspan')[2].text(valorAux);
				if (ui.children[0].tagName=='title') {
					ui.children[0].textContent = textoTooltip(node, true);
				}
			} else if (chave=='cor') {
				try {
					ui.getElementsByTagName('rect')[0].setAttribute('fill',valor);
				} catch (e){console.log(e); };
			} else if (chave=='imagem') {
				try {
					ui.getElementsByTagName('image')[0].setAttribute('xlink:href', base + 'static/imagem/' + valor);
				} catch (e){console.log(e); };
			}
		}
	}
}//.function alterarItens

function entrada_hierarquico_pyjs(entrada) {
	var entradaTabs = [];
	var kl = 0;
	var cab = entrada.split('\n')[0];
	//var identadorTabs = true; //trim remove espaços ou tabulação
	var kidentadores = 1;
	var insereNumeroNoId = false; //por default, insere número no id se for código python ou javascript
	var mostraNumero = false;

	if (!cab.startsWith('_>')) {
		console.log('erro.')
		return;
	}
	 //TODO ver se hierarquico vai adicionar nome da coluna

	insereNumeroNoId =  cab.includes('n') || cab.includes('N');
	mostraNumero = cab.includes('n');
	if (cab.includes('j')) {
		//identadorTabs = true;
		insereNumeroNoId = true;
	}
	if (cab.includes('p')) { //python, tabulação com 4 espaços
		//identadorTabs = false;
		kidentadores = 4;
		insereNumeroNoId = true;
	}
	/*
	if (cab.includes('e')) {
		identadorTabs = false;
	}*/
	if (cab.includes('n')) {
		mostraNumero = true;
	}
	if (cab.search(/\d/g)!=-1) {
		kidentadores = parseInt(cab.match(/\d/g)[0]);
		kidentadores = kidentadores ? kidentadores : 1;
	}

	for (let linha of entrada.split('\n')) {
		if (!entradaTabs.length) {
			entradaTabs.push('_>'); //tabela hierarquica
		} else if (linha.trim()) {
			/*
			if (identadorTabs) {
				//linha = replaceAll(linha, '\t', '    ');
				var recuo = linha.length - linha.trimStart().length;
				var linhax = '\t'.repeat(recuo);
			} else {
				var recuo = Math.floor((linha.length - linha.trimStart().length)/kidentadores); //supõe PEP, quatro espaços de tabulação
				var linhax = '\t'.repeat(recuo);
			} */
			var recuo = Math.floor((linha.length - linha.trimStart().length)/kidentadores); //supõe PEP, quatro espaços de tabulação
			var linhax = '\t'.repeat(recuo);

			if (insereNumeroNoId) {
				linhax += kl.toString().padStart(4,0);
				if (mostraNumero) {
					linhax += ' ';
				} else {
					linhax += '__';
				}
				linhax += linha.trim();
			} else {
				linhax = linha.trimEnd();
			}
			entradaTabs.push(linhax);
		}
		kl += 1;
	}
	return  entradaTabs.join('\n');
}

function inserir_lista(entrada, bNaoConfirma) {
	//inserir três tipos de lista, dependendo se a primeira célula tiver um ou dois underscores ou sem underscore.
	//sem underscore na primeira célula, colunas A,B,C,D,E, cria ligacoes A->B com descrição de ligação C. D e E são descrições dos identificadores A e B
	//sem underscore, só uma coluna, insere identificadores, pfs ou pjs, só busca dados de cnpj, não adiciona camadas
	//1 underscore na primeira célula, por dupla de colunas (fila). Colunas A,B,C,D, gera ligações A->B, B->C, C->D, considera a primeira linha nome das colunas
	//2 underscores na primeira célula, por dupla de colunas (estrela). Colunas A,B,C,D, gera ligações A->B, A->C, C->D, considere a primeira linha como nome das colunas
	//1 undercore + sharp (_#). Coluna _#A, B, C, altera parametro B ou C do id A

	//var itens = entrada.replace(/\n/g,';');
	var max = 0;
	var lista = [];
	var dadosExtras = [];
	var elems = null;
	entrada = entrada.replaceAll('\r\n', '\n');
	var primeiraLinhaEntrada = entrada.split('\n')[0];
	if (primeiraLinhaEntrada.startsWith('_~') || primeiraLinhaEntrada.startsWith('_>')) { //tipo python, troca espaços por tabs para tipoLista hierarquica
		entrada = entrada_hierarquico_pyjs(entrada);
	}
	for (let linha of entrada.split('\n')){
		elems = linha.split('\t');
		max = Math.max(max, elems.length);
	}

	//var kLinhas = 0;
	var bPrimeiraLinha = true;
	var tipoLista = 'ligacao';
	var itensLinhaAnterior = [];
	var linhaHierarquica = new Array(max);
	var itensLinha = [];
	var cabecalhos;

	for (let linha of entrada.split('\n')){
		elems = linha.split('\t');
		elems.map(s => s.trim()); //trim elementos
		if ((elems.join('').trim()=='') || (!linha.trim()) ){
			bPrimeiraLinha=true;
			itensLinhaAnterior = [];
			itensLinha = new Array(elems.length).fill(''); //iniciado só para copiar em itensLInhaAnterior
			linhaHierarquica = new Array(elems.length).fill('');
			continue
		}
		if (bPrimeiraLinha) {
			cabecalhos = JSON.parse(JSON.stringify(elems));
			if (max > cabecalhos.length) {
				var aux = Array(max - cabecalhos.length).fill('');
				cabecalhos = cabecalhos.concat(aux);
			}
			if (cabecalhos[0].startsWith('_+')) {
				tipoLista = 'fila';
			} else if (cabecalhos[0].startsWith('_*')) {
				tipoLista = 'estrela';
			} else if (cabecalhos[0].startsWith('_>')) {
				tipoLista = 'hierarquica';
			} else if (cabecalhos[0].startsWith('_#')) {
				tipoLista = 'alteraDados';
			} else {
				tipoLista = 'ligacao';
				cabecalhos=[];
				bPrimeiraLinha=false;
			}
		}

		if ((tipoLista!='ligacao') && (bPrimeiraLinha)){
			cabecalhos[0] = cabecalhos[0].substr(2);
			bPrimeiraLinha = false;
			continue;
		}
		bPrimeiraLinha = false;
		var dadosExtrasNo = {};
		if (tipoLista == 'ligacao') {
			//colunas A,B,C,D,E, cria ligacoes A->B com descrição de ligação C. D e E são descrições dos identificadores A e B
			switch(elems.length) {
				case 0:
					break;
				case 1:
					lista.push([tipoPresumido(elems[0]), '', '', '', '']);
					break;
				case 2:
					lista.push([tipoPresumido(elems[0]), tipoPresumido(elems[1]), '', '', '']);
					break;
				case 3:
					lista.push([tipoPresumido(elems[0]), tipoPresumido(elems[1]), elems[2], '', '']);
					break;
			    case 4:
					lista.push([tipoPresumido(elems[0]), tipoPresumido(elems[1]), elems[2], elems[3], '']);
					break;
				default:
					lista.push([tipoPresumido(elems[0]), tipoPresumido(elems[1]), elems[2], elems[3], elems[4]]);
			}
		} else if (tipoLista == 'alteraDados') {
			//colunas _#A,B,C,D,E, altera parametros definidos pelos rótulos B,C,D,E nos elementos da coluna A
			var idPre = tipoPresumido(elems[0]);
			idPre = tipoPresumido(cabecalhos[0]? cabecalhos[0] + ' ' + elems[0] : elems[0]);
			dadosExtrasNo['id'] = idPre;
			for (let k=1; k<=elems.length; k++) {
				if (cabecalhos[k]) {
					dadosExtrasNo[cabecalhos[k]] = elems[k];
					lista.push([idPre, '', '', '', '']);
				}
			}
			dadosExtras.push( JSON.parse(JSON.stringify(dadosExtrasNo)) );
		} else {
			//console.log(itensLinha);
			itensLinhaAnterior = JSON.parse(JSON.stringify(itensLinha)); //usado em hierarquica e |

			itensLinha = [];

			for (let k=0; k<elems.length; k++) {
				if (cabecalhos[k].startsWith('_-') || !elems[k])  { //ignora essa coluna
					itensLinha.push('');
					continue;
				}
				var cabecalhok = cabecalhos[k];
				if (cabecalhok.startsWith('|')) { //vinculo vertical
					cabecalhok = cabecalhok.substr(1);
					bLigacaoVertical = true;
				} else {
					bLigacaoVertical = false;
				}
				if (cabecalhok.startsWith('$')) { //se $ no nome da coluna, coloca o texto também na ligação
					cabecalhok = cabecalhok.substr(1);
					//nomeLigacao = cabecalhok;
				}

				var idPre = tipoPresumido(elems[k]);
				if (idPre.startsWith('ID_')) {
					idPre = tipoPresumido(cabecalhok? cabecalhok + ' ' + elems[k]:elems[k]);
				}
				itensLinha.push(idPre);
				if (bLigacaoVertical && itensLinhaAnterior[k]) {
					if (itensLinhaAnterior[k]) {
						lista.push([itensLinhaAnterior[k], idPre, '', '', '']);
					}
				}
			}
			//itensLinhaAnterior = JSON.parse(JSON.stringify(itensLinha)); //usado em hierarquica e |

			if (tipoLista == 'estrela') { // _* undercore + estrela
				//converte tabela para ligacões, por dupla de colunas (estrela). Colunas A,B,C,D, gera ligações A->B, A->C, C->D
				//se algum rotulo começar com 1 underscores, adiciona o texto como ligacao, senão adiciona nos elementos
				for (let k=1; k<itensLinha.length; k++) {
					var idPre1 = itensLinha[0];
					var idPre2 = itensLinha[k];
					if (!idPre1 ||  !idPre2) {
						continue;
					}
					var cabecalhok = cabecalhos[k];
					var nomeLigacao = '';
					if (cabecalhok.startsWith('|')) { //vinculo vertical
						cabecalhok = cabecalhok.substr(1);
					}
					if (cabecalhok.startsWith('$')) { //se $ no nome da coluna, coloca o texto também na ligação
						cabecalhok = cabecalhok.substr(1);
						nomeLigacao = cabecalhok
					}
					lista.push([idPre1, idPre2, nomeLigacao, '', '']);

				}
			} else if (tipoLista == 'fila')  { //um underscore + _+
				//converte tabela para ligacões, por dupla de colunas (fila). Colunas A,B,C,D, gera ligações A->B, B->C, C->D
				//se algum rotulo começar com 1 underscores, adiciona o texto como ligacao, senão adiciona nos elementos
				for (let k=0; (k+1)<elems.length; k++) {
					var idPre1 = itensLinha[k];
					var idPre2 = itensLinha[k+1];
					if (!idPre1 ||  !idPre2) {
						if (idPre1) {
							lista.push([idPre1, '', '', '', '']);
						}
						if (idPre2) {
							lista.push([idPre2, '', '', '', '']);
						}
						continue;
					}
					var cabecalhok1 = cabecalhos[k+1];
					var nomeLigacao = '';
					if (cabecalhok1.startsWith('|')) { //vinculo vertical
						cabecalhok1 = cabecalhok1.substr(1);
					}
					if (cabecalhok1.startsWith('$')) { //se $ no nome da coluna, coloca o texto também na ligação
						cabecalhok1 = cabecalhok1.substr(1);
						nomeLigacao = cabecalhok1;
					}
					lista.push([idPre1, idPre2, nomeLigacao, '', '']);
				}
			} else if (tipoLista == 'hierarquica')  { //um underscore >  (_/)

				for (let k=0; k<itensLinha.length; k++) {
					if (!itensLinha[k]) {
						continue;
					}
					if (k==0) {
						if (linhaHierarquica[0]) {
							lista.push([linhaHierarquica[0], itensLinha[0] , '', '', '']);
						} else if (itensLinhaAnterior[0]) {
							lista.push([itensLinhaAnterior[0], itensLinha[0] , '', '', '']);
						} else {
							lista.push([itensLinha[0],'' , '', '', '']);
						}
						linhaHierarquica = new Array(max).fill('');
						linhaHierarquica[0] = itensLinha[0];
						/*
						if (itensLinha.length>1) {
							if (itensLinha[k+1]) {
								lista.push([itensLinha[k], itensLinha[k+1], '>>>', '', '']);
								linhaHierarquica[k+1] = itensLinha[k+1];
							}
						}*/
					} else if (itensLinha[k-1]) {
						lista.push([itensLinha[k-1], itensLinha[k], '<<>>', '', '']);
						for (let m=k; m<linhaHierarquica.length; m++) {
							linhaHierarquica[m] = '';
						}
						linhaHierarquica[k] = itensLinha[k];
					} else if (!itensLinha[k-1]) {
						if (itensLinhaAnterior[k]) {
							lista.push([itensLinhaAnterior[k], itensLinha[k], '', '', '']);
							linhaHierarquica[k] = itensLinha[k];
						} else if (itensLinhaAnterior[k-1]) {
							lista.push([itensLinhaAnterior[k-1], itensLinha[k], '<<>>', '', '']);
							linhaHierarquica[k] = itensLinha[k];
						}
						else if (linhaHierarquica[k]) {
							lista.push([linhaHierarquica[k], itensLinha[k], '', '', '']);
							linhaHierarquica[k] = itensLinha[k];
						} else {
							console.log('Algo errado - hierarquica');


						}
					} else {
						alertify.error('Algo errado...');
						console.log('erro:' + itensLinha);
					}
					if (false) {
						for (let m=k+1; m<linhaHierarquica.length; m++) {
								linhaHierarquica[m] = '';
						}
					}


					/*
					if (itensLinha[k]) {
						linhaHierarquica[k] = itensLinha[k];
					}*/
				}
			} else {
				console.log('erro...');
			}
		}

	}

	if (!lista.length) {
		alertify.error('Formato não reconhecido.');
		return;
	}
	var tamanhoGrupo=0;
	if (tipoLista != 'hierarquica') {
		if (ajustarArvore(lista, true, 10)>0){
			tamanhoGrupo = prompt('A lista tem identificadores que não são PJ ou PF repetidos diversas vezes.\nPara facilitar a visualização, pode-se dividir esses identificadores em ramos.\nDigite uma quantidade de itens por ramos ou Cancele para inserir sem ramos.', 10);
		}
		if (tamanhoGrupo) {
			lista = ajustarArvore(lista, false, tamanhoGrupo);
		}
	}
	var nos = [];
	var ligacoes = [];
	var nosid = new Set();
	var cnpjsids = new Set();
	var cnpjDescricao = {};
    for (let linha of lista) {
		var id1 = linha[0];
		var id2 = linha[1];
		//var id1limpo = id1.replace(/[\.\-\//]/g, '');
		//var id2limpo = id2.replace(/[\.\-\//]/g, '');
		//TODO verificar se sem pontos e virgulas tem 14 dígitos
		if ((!id1) && (!id2)) {
			continue;
		}
		if (id1.startsWith('PJ_')) {
			cnpjsids.add(id1);
			cnpjDescricao[id1] = linha[3];
		} else if (id1) {
			let descricaoaux = id1.startsWith('PF_')?id1.substr(15):linha[3];
			if (!nosid.has(id1)) {
				nosid.add(id1);
				nos.push({'id': id1,
			   'descricao': descricaoaux, //linha[3],
			   'camada': 0,
			   //'situacao_ativa': true,
			   'imagem': iconeF(id1), //'icone-grafo-id.png',
			   'cor': 'yellow'});
			}
		}
		if (id2.startsWith('PJ_')) {
			cnpjsids.add(id2);
			cnpjDescricao[id2] = linha[4];
		} else if (id2) {
			let descricaoaux = id2.startsWith('PF_')?id2.substr(15):linha[4];
			if (!nosid.has(id2)) {
				nosid.add(id2);
				nos.push({'id': id2,
			   'descricao': descricaoaux, //linha[4],
			   'camada': 0,
			   //'situacao_ativa': true,
			   'imagem': iconeF(id2), //'icone-grafo-id.png',
			   'cor': 'yellow'});
			}
		}
	    if ((id1) && (id2)) {
		   ligacoes.push({'origem': id1,
			   'destino': id2,
			   'cor': gparam.corLigacaoLink, //'green',
			   'camada': 1,
			   'tipoDescricao': '', //'link',
			   'label': linha[2]});
		}
	}
	if (cnpjsids.size) {
		fazFetchCnpjs(cnpjsids, nos, ligacoes);
	} else {
		var noLigacoes = {'no':nos, 'ligacao':ligacoes, 'mensagem':{'lateral': '', 'popup': '', 'confirmar': ''}};
		inserirJson(noLigacoes,' drop lista ', bNaoConfirma);
		alterarItens(dadosExtras);
	}
	return;
	/*
    var entradaExemplo = [['ID_a1','ID_a2','l1','nome 1','nome 2'],
					['ID_a1','ID_a3','l2', 'nome 1', 'nome 3'],
					['ID_a3','ID_a4','l3', 'nome 3', 'nome 4'] ]; */
	function ajustarArvore(lista, bSoConta, kGrupo) {
		//se um ID tiver mais de kGrupo ligacoes, vai quebrando em subarvores de no máximo kGrupo elementos.
		//const kGrupo=10;
		if (!kGrupo) {
			kGrupo=10;
		}
		var contagemIds = {}; //itens que não são cpf/cnpj ou EN_
		//conta elementos ID_ para abrir arvore
		for (let linha of lista) {
			var id1 = linha[0];
			if (id1.substr(0,3)=='ID_') {
				if (! contagemIds[id1]) {
					contagemIds[id1] = 0;
				}
				contagemIds[id1] += 1;
			}
		}
		//verifica quais itens tem muita repetição
		var idsArvore = new Set();
		for (let k of Object.keys(contagemIds)) {
			if (contagemIds[k]>kGrupo) {
				idsArvore.add(k);
			}
		}
		if (bSoConta) {
			return idsArvore.size;
		}
		contagemIds = {}; //contagem para loop da lista
		var listaAdicional = [];
		var listaSaida = [];
		for (let linha of lista) {
			let linhaSaida = [...linha];
			var id1 = linha[0];
			if (idsArvore.has(id1)) {
				if (!contagemIds[id1]) {
					contagemIds[id1]=0;
				}
				contagemIds[id1] += 1;
				idgrupo = id1 + '(' + String(Math.floor(contagemIds[id1]/kGrupo)+1) + ')';
				if (contagemIds[id1]%kGrupo==1) {
					listaSaida.push([id1, idgrupo,'','','']);
				}
				linhaSaida[0] = idgrupo;
			}
			listaSaida.push(JSON.parse(JSON.stringify(linhaSaida)));
		}
		return listaSaida;
	}//.function ajustarArvore

	function fazFetchCnpjs(cnpjsids, nos, ligacoes) {
		//var idin = [...cnpjsids].join(';');
		var idinlista = [...cnpjsids];
		document.body.style.cursor = 'wait';
		let bodyjson = JSON.stringify(idinlista);
		var url =  base + 'grafojson/cnpj/0/' + idinlista[0];
		//fetch(url, {method: 'get'}) // mode: 'cors',pos
		fetch(url, {method: 'post', body:  bodyjson, headers: {"Content-type": "application/json"}, cache: "no-store"}) // mode: 'cors',
		  .then(
			function(response) {
			  if (response.status !== 200) {
				document.body.style.cursor = 'default'
				console.log('Looks like there was a problem. Status Code: ' +  response.status);
				alertify.error('Aconteceu um erro 17(' +  response.status + ')');
				return;
			  }
			  // Examine the text in the response
			  response.json().then(function(data) {
				//console.log(data);
				document.body.style.cursor = 'default';
				for (let n of data['no']) {
					nos.push(JSON.parse(JSON.stringify(n)));
					//todo verificar se todos os cnpjs supostos apareceram
				}
				for (let li of data['ligacao']) {
					ligacoes.push(JSON.parse(JSON.stringify(li)));
				}
				var noLigacoes = {'no':nos, 'ligacao':ligacoes, 'mensagem':{'lateral': '', 'popup': '', 'confirmar': ''}};
				inserirJson(noLigacoes,' drop lista ', bNaoConfirma);
				alterarItens(dadosExtras);
			  });
			}
		  )
		  .catch(function(err) {
			document.body.style.cursor = 'default';
			console.log('Fetch Error :-S', err);
			alertify.error('Aconteceu um erro 18 (Fetch error ' + err + ')');
		  });
	}//.function fazFetchCnpjs
}//.function inserir_lista

function menu_editarNota(noid){
	var ui=graphics.getNodeUI(noid);
	var nota = graph.getNode(noid).data.nota;
	nota = nota? nota: '';
	ativaAtalhos(false);
	var brenderer = menu_rendererAtivarParar(false, false);
	alertify.prompt( 'Editar Nota', 'Digite texto de anotação:', nota
	   , function(evt, texto) {
			if (texto) {
				ui.getElementsByTagName('tspan')[2].text(texto);
				graph.getNode(noid).data.nota = texto;
				try {
					ui.children[0].textContent = textoTooltip(graph.getNode(noid), true);
				} catch (e){; };
			}
			menu_rendererAtivarParar(brenderer, false);
			ativaAtalhos(true);
		}, function() {
			ativaAtalhos(true);
			menu_rendererAtivarParar(brenderer, false);
	});
}//.function menu_editarNota

function menu_alterarIcone(bparam) {
	var menuIconeOptions = document.getElementById('menu_selecao_icone_options');
	if (bparam) {
		var nomeIcone = menuIconeOptions.value;
		for (let noid of gparam.idNosSelecionados) {
			let no = graph.getNode(noid);
			no.data.imagem = nomeIcone;
			var node = graphics.getNodeUI(noid);
			try {
				node.getElementsByTagName('image')[0].setAttribute('xlink:href', base + 'static/imagem/' + nomeIcone);
			} catch (e){; };
		}
	}
	menuIconeOptions.value=0;
}//.function menu_alterarIcone

function saveTextAsFile(textToSave, nomeArquivo, mime) {   //salva arquivo texto sem precisar mandar para o servidor.
	var textToSaveAsBlob = new Blob([textToSave], mime); //{type:"text/plain"});
	var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);
	var fileNameToSaveAs = nomeArquivo;
	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "Download File";
	downloadLink.href = textToSaveAsURL;
	downloadLink.onclick = function (event) {document.body.removeChild(event.target);} ;
	downloadLink.style.display = "none";
	document.body.appendChild(downloadLink);
	downloadLink.click();
}//.function saveTextAsFile

/*
function destroyClickedElement(event){
	document.body.removeChild(event.target);
}//.function destroyClickedElement
*/

function exportaIdsParaDownloadExcel() {
	//var dadosJSON = JSON.stringify({'no':['1','2'], 'ligacao':[]});;
	var iframeAuxiliar = document.getElementById('iframeAuxiliarDownload');
	/*
	var idArray = [];
	if (iframeAuxiliar.exportaSoSelecionados) {
		idArray = [...gparam.idNosSelecionados];
	} else {
		graph.forEachNode( function(node) {
				idArray.push(node.id);
			}
		);
	} */
	var idArray = getRedeNosLigacoes();
	var dadosJSON = JSON.stringify(idArray); //não aceita stringify de set
	var mime={type:"application/json"};
	var formato = 'xlsx';
	//mime = {type:"application/octet-stream"};
	iframeAuxiliar.onload = null;
	var iframeDocumento = iframeAuxiliar.contentDocument || iframeAuxiliar.contentWindow.document;
	var form = iframeDocumento.getElementById('formDownload');
	form.dadosJSON.value = dadosJSON;
	form.action = base + 'dadosemarquivo/xlsx' ;
	form.submit();
}//.function exportaIdsParaDownloadExcel

function menu_exportaExcel(bSoSelecionados) {
	var formato='xlsx';
	var iframeAuxiliar = document.getElementById('iframeAuxiliarDownload');
	iframeAuxiliar.onload = exportaIdsParaDownloadExcel;
	iframeAuxiliar.src = base + 'formdownload.html';
	//iframeAuxiliar.exportaSoSelecionados = bSoSelecionados;
}//.function menu_exportaExcel

function getRedeNosLigacoes(bSoSelecionados, setNos) {
	//se setNos=null, pega todos os itens do gráfico ou apenas ou selecionados
	//se setNos for especificado, pega esses da lista
	//return dojo.toJson({'no':listaNoInicial, 'ligacao':listaLigacaoInicial});
	//return JSON.stringify({'no':listaNoInicial, 'ligacao':listaLigacaoInicial}, filtroDeMembros);
	var nosAux=[], ligacoesAux=[];
	//pega dados apartir do vivagraph, assim não é preciso fazer ajustes em listaLigacaoInicial ou listaNoInicial
	var setAux = setNos ? setNos : gparam.idNosSelecionados;

	if (!setNos && !bSoSelecionados) { // || setNos) {
		graph.forEachNode(
			function(node) {
				var nodedata = JSON.parse(JSON.stringify(node.data));
				nodedata['posicao'] = gparam.layout.getNodePosition(node.id);
				nodedata['pinado'] = gparam.layout.isNodePinned(node);
				if (setNos) {
					if (setNos.has(node.id)) {
						nosAux.push(nodedata);
					}
				} else {
					if ((!bSoSelecionados) || gparam.idNosSelecionados.has(node.id)) {
						nosAux.push(nodedata);
					}
				}
			}
		);
	} else { //!bSoSelecionados
		for (let noid of setAux) {
			var node = graph.getNode(noid);
			if (node) {
				var nodedata = JSON.parse(JSON.stringify(node.data));
				nodedata['posicao'] = gparam.layout.getNodePosition(node.id);
				nodedata['pinado'] = gparam.layout.isNodePinned(node);
				nosAux.push(nodedata);
			}
		}
	}
	graph.forEachLink(function(link){
		/* ligacoesAux.push(
			{"origem":link.fromId,
			"destino":link.toId ,
			"cor":link.data.cor,
			"camada":link.data.camada,
			"tipoDescricao": link.data.tipoDescricao,
			"label": link.data.label
			}
		); */
		if (setNos) {
			if (setNos.has(link.fromId) && setNos.has(link.toId)) {
				ligacoesAux.push(link.data);
			}
		} else {
			if ((!bSoSelecionados) || (gparam.idNosSelecionados.has(link.fromId) && gparam.idNosSelecionados.has(link.toId))) {
				ligacoesAux.push(JSON.parse(JSON.stringify(link.data)));
			}
		}
	});
	return {'no':nosAux, 'ligacao':ligacoesAux};
}//.function getRedeNosLigacoes

function menu_exportaJsonArquivo(bSoSelecionados) {
	var rede = getRedeNosLigacoes(bSoSelecionados);
	saveTextAsFile(JSON.stringify(rede), 'rede.json', {type:"application/json"});
}//.function menu_exportaJsonArquivo

function replaceAll(texto, textoAProcurar, textoASubstituir) {
	//return texto.split(textoAProcurar).join(textoASubstituir);
	if (texto) {
		return texto.replace(new RegExp(textoAProcurar,'g'), textoASubstituir);
	} else {
		return '';
	}
}//.function replaceAll

function getXMLdeSVG() {
	var svg_xml = (new XMLSerializer).serializeToString(document.getElementsByTagName('svg')[0]);
	svg_xml = replaceAll(svg_xml,'xmlns:xlink="http://www.w3.org/1999/xlink"',''); //esse link é acrescentado em campo de texto, causando erro no svg
	svg_xml = svg_xml.replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" '); //define namespace para link
	/*
	var listaImagens= [
			'icone-grafo-masculino.png',
			'icone-grafo-feminino.png',
			'icone-grafo-desconhecido.png',
			'icone-grafo-endereco.png',
			'icone-grafo-telefone.png',
			'icone-grafo-email.png',
			'icone-grafo-empresa-publica.png',
			'icone-grafo-empresa-individual.png',
			'icone-grafo-empresa.png',
			'icone-grafo-empresa-fundacao.png',
			'icone-grafo-empresa-estrangeira.png',
			'icone-grafo-id.png' ]; */
	var sImagens = new Set(); //gparam.listaImagens;
	//verifica quais imagens estão sendo usadas.
	var pedacos = svg_xml.split('xlink:href="' + base + 'static/imagem/');
	for (let p of pedacos) {
		if (p.indexOf('.png') != -1) {
			var nome = p.split('.png')[0];
			if (nome) {
				sImagens.add(nome+'.png');
			}
		}
	}
	var listaImagens = [...sImagens];
	function converteImagens2Base64() {
		var dicionarioBase64 = {};
		var c = document.createElement('canvas');
		for (let nomeImagem of listaImagens) {
			var img = new Image();
			img.src = base + 'static/imagem/' + nomeImagem;

			img_home.appendChild(img);
			if (1) {
				c.height = img.naturalHeight;
				c.width = img.naturalWidth;
				var ctx = c.getContext('2d');
				ctx.drawImage(img, 0, 0, c.width, c.height, 0, 0, c.width, c.height);
				var base64String = c.toDataURL();
				dicionarioBase64[nomeImagem] = base64String;
			}
		}
		return dicionarioBase64;
	} //.function converteImagens2Base64()
	//ver http://d3export.housegordon.org/ exemplo para exportação svg
	var dicionario = converteImagens2Base64();
	for (let key of listaImagens) {
		var baseStr=dicionario[key];
		var strProcurar = 'xlink:href="' + base + 'static/imagem/' + key + '"';
		var strSubstituicao = 'xlink:href="'+baseStr + '"';
		svg_xml = replaceAll(svg_xml, strProcurar, strSubstituicao);
	}
	return svg_xml;
}//.function getXMLdeSVG()

function menu_exportaSVG() {
	var mime={type:"image/svg"};
	alertify.success("SVG (Scalable Vector Graphics)");
	saveTextAsFile(getXMLdeSVG(), 'rede.svg', mime);
}//.function menu_exportaSVG

function menu_zoomin(teclaShift, teclaCtrl) {
	menuOnClick(); //firefox no android, não está fechando o menu
	if (teclaCtrl) {
		return;
	}
	if (teclaShift) {
		return menu_configurar_springLength(1);
	}
	var vezes = gparam.mobile?6:3;
	var escalamax = gparam.mobile?8:2;
	if (gparam.renderer.getTransform().scale>escalamax) {
		return;
	}
	for(var k=0; k<vezes; k++) {
		var escala = gparam.renderer.zoomIn();
		if (escala>escalamax) {
			break;
		}
	}
}//.function menu_zoomin

function menu_zoomout(teclaShift, teclaCtrl) {
	menuOnClick(); //firefox no android, não está fechando o menu
	if (teclaCtrl) {
		return;
	}
	if (teclaShift) {
		return menu_configurar_springLength(-1);
	}
	var vezes = gparam.mobile?6:2;
	for(var k=0; k<vezes; k++) {
		var escala = gparam.renderer.zoomOut();
	}
}//.function menu_zoomout

//teclas Up, down, left e right servem somente para navegar árvore hierárquica
function menu_teclaUp(bSemMensagem) { //segue direção da seta
	var proximoNo = null;
	if (gparam.idNosSelecionados.size>1) {
		proximoNo = [...gparam.idNosSelecionados][0];
		selecionaNoid(proximoNo, false, false);
		return;
	}

	graph.forEachLinkedNode(gparam.idnoSelecionado, function(nodeaux, link){
		if (link.toId==gparam.idnoSelecionado) {
			proximoNo = link.fromId;
			return;
		}
	});

	if (proximoNo) {
		selecionaNoid(proximoNo, false, false);
	} else if (!bSemMensagem) {
			alertify.error('Não encontrou item anterior');
	}
}

function menu_teclaRight(bSemMensagem) { //segue direção contrária da seta?
	var proximoNo = null;
	if (gparam.idNosSelecionados.size>1) {
		//var setIter = gparam.idNosSelecionados.values();
		//proximoNo = setIter.next().value;
		proximoNo = [...gparam.idNosSelecionados][0];
		selecionaNoid(proximoNo, false, false);
		return;
	}
	var k = 0;

	graph.forEachLinkedNode(gparam.idnoSelecionado, function(nodeaux, link){
		if (!proximoNo) {
			if (link.fromId==gparam.idnoSelecionado) {
				proximoNo = link.toId;
				k += 1;
				if (k>1) {
					return;
				}
			}
		}
	});

	if (proximoNo) {
		selecionaNoid(proximoNo, false, false);
	} else if (!bSemMensagem) {
		alertify.error('Não encontrou item.');
	}
}//function menu_teclaRight

function menu_teclaLeft(bSemMensagem) { //segue direção da seta
	var proximoNo = null;
	if (gparam.idNosSelecionados.size>1) {
		proximoNo = [...gparam.idNosSelecionados][0];
		selecionaNoid(proximoNo, false, false);
		return;
	}

	graph.forEachLinkedNode(gparam.idnoSelecionado, function(nodeaux, link){
		if (link.fromId==gparam.idnoSelecionado) {
			proximoNo = link.toId;
			return;
		}
	});

	if (proximoNo) {
		selecionaNoid(proximoNo, false, false);
	} else if (!bSemMensagem) {
		alertify.error('Não encontrou item.');
	}
}//menu_teclaLeft

function menu_teclaDown(bSemMensagem) { //segue direção da seta, se chega no final do ramo, volta e entra no ramo pela esquerda
	if (gparam.idNosSelecionados.size>1) {
		const lastValue = Array.from(gparam.idNosSelecionados).pop();
		selecionaNoid(lastValue, false, false);
		return;
	}
	var noInicial = gparam.idnoSelecionado;
	var noid = gparam.idnoSelecionado;
	menu_teclaRight(true);
	if (noid != gparam.idnoSelecionado) {
		return;
	}
	var nosCaminho = new Set(noid);
	var passos = 0;
	while (true) {
		//console.log(gparam.idnoSelecionado);
		passos += 1;
		if (passos>graph.getNodesCount()*10) { //para evitar loop infinito
			selecionaNoid(noInicial, false, false);
			if (!bSemMensagem)  {
				alertify.error('Não encontrou item seguinte.');
			}
		}
		nosCaminho.add(noid);
		//console.log('up');
		menu_teclaUp(true);
		if (noid == gparam.idnoSelecionado) { //não saiu do lugar, sair da rotina
			selecionaNoid(noInicial, false, false);
			if (!bSemMensagem)  {
				alertify.error('Não encontrou item seguinte.');
			}
				break;
		}
		var knos = 0;
		var proximoNo = null;
		graph.forEachLinkedNode(gparam.idnoSelecionado, function(nodeaux, link){
			if (link.fromId==gparam.idnoSelecionado) {
				knos += 1;
				if (knos==2) {
					proximoNo = link.toId;
					return;
				}
			}
		});
		if (knos>1) {
			selecionaNoid(proximoNo, false, false);
			if (!nosCaminho.has(gparam.idnoSelecionado)) {
				//console.log('saiu x1');
				break;
			} else {
				menu_teclaUp(true);
			}
		}
		noid =  gparam.idnoSelecionado;
	}
}//function menu_teclaDown

function menu_configurar_nodeSize() {
	var parametro = prompt('Digite o tamanho do ícone.', gparam.nodeSize);
	if (!parametro) {
		return;
	}
	gparam.nodeSize = parseInt(parametro);
	//pra funcionar corretamente, é necessário mudar todos os elementos visuais que usam nodeSize, como rect, etc...
	graph.forEachNode( function(node) {
		var ui=graphics.getNodeUI(node.id);
		if (gparam.btextoEmbaixoIcone) { //se houver items criados com um estado ou outro, pode ficar inconsistente e isso não resolve.
			ui.getElementsByTagName('text')[0].attr('x', gparam.nodeSize/2).attr('y', String(gparam.tamanhoFonte*1.1 + gparam.nodeSize) + 'px');;
			ui.getElementsByTagName('tspan')[0].attr('x', gparam.nodeSize/2);
			ui.getElementsByTagName('tspan')[1].attr('x', gparam.nodeSize/2);
			ui.getElementsByTagName('tspan')[2].attr('x', gparam.nodeSize/2);
			ui.getElementsByTagName('image')[0].attr('width', gparam.nodeSize).attr('height', gparam.nodeSize);
			ui.getElementsByTagName('rect')[0].attr('width', gparam.nodeSize).attr('height', gparam.nodeSize);
			ui.getElementsByTagName('rect')[1].attr('width', gparam.nodeSize).attr('height', gparam.nodeSize);
		} else {
			ui.getElementsByTagName('text')[0].attr('x', gparam.nodeSize).attr('y', gparam.nodeSize*0.5+gparam.tamanhoFonte*0.5);;
			ui.getElementsByTagName('tspan')[0].attr('x', gparam.nodeSize*1.2);
			ui.getElementsByTagName('tspan')[1].attr('x', gparam.nodeSize*1.2);
			ui.getElementsByTagName('tspan')[2].attr('x', gparam.nodeSize*1.2);
			ui.getElementsByTagName('image')[0].attr('width', gparam.nodeSize).attr('height', gparam.nodeSize);
			ui.getElementsByTagName('rect')[0].attr('width', gparam.nodeSize).attr('height', gparam.nodeSize);
			ui.getElementsByTagName('rect')[1].attr('width', gparam.nodeSize).attr('height', gparam.nodeSize);
		}
	});
}//.function menu_configurar_nodeSize

function menu_configurar_springLength(zoomInOut) {
	var tamanho = gparam.layout.simulator.springLength();
	if (zoomInOut==-1) {
		gparam.layout.simulator.springLength(tamanho*0.9);
		gparam.springLength = tamanho*0.9;
	} else if (zoomInOut==1) {
		gparam.layout.simulator.springLength(tamanho*1.1);
		gparam.springLength = tamanho*1.1;
	} else {
		var parametro = prompt('Digite o comprimento da ligação (valor padrão ' + gparam.springLength + ')', tamanho);
		if (parametro) {
			gparam.layout.simulator.springLength(parametro);
			gparam.springLength = parametro;
		}
	}
	menu_rendererAtivarParar(true, false); //para atualizar tela
}//.function menu_configurar_springLength

function balanca() {
//deslocamento para o renderizador atualizar tela, não adianta se renderer estiver parado.
	if (!gparam.idnoSelecionado) {
		return;
	}
	var position = gparam.layout.getNodePosition(gparam.idnoSelecionado);
	gparam.layout.setNodePosition(noaux.id, position.x+10, position.y+10);
}//.function balanca

function menu_configurar_springCoeff() {
	var parametro = prompt('Digite o coeficiente da "mola" da ligação (valor padrão 0.0002)', gparam.layout.simulator.springCoeff());
	if (parametro) {
		gparam.layout.simulator.springCoeff(parametro);
	}
}//.function menu_configurar_springCoeff

function menu_configurar_gravity() {
	var parametro = prompt('Digite o valor da gravidade (valor padrão -1.2)', gparam.layout.simulator.gravity());
	if (parametro) {
		gparam.layout.simulator.gravity(parametro);
	}
}//.function menu_configurar_gravity

function menu_configurar_dragCoeff() {
	var parametro = prompt('Digite o coeficiente de arrasto (valor padrão 0.02)', gparam.layout.simulator.dragCoeff());
	if (parametro) {
		gparam.layout.simulator.dragCoeff(parametro);
	}
}//.function menu_configurar_dragCoeff

function menu_configurar_theta() {
	var parametro = prompt('Digite do coeficiente theta (valor padrão 0.8)', gparam.layout.simulator.theta());
	if (parametro) {
		gparam.layout.simulator.theta(parametro);
	}
}//.function menu_configurar_theta(

//menu contextual
function showMenu(x, y){
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.add('show-menu');
}//.function showMenu

function hideMenu(){
	//menu.classList.contains('show-menu') //para verificar
    menu.classList.remove('show-menu');
}//.function hideMenu

function onContextMenu(e){
	e.preventDefault();
    showMenu(e.pageX, e.pageY);
    document.addEventListener(gparam.eventclick, menuOnClick, false);
}//.function onContextMenu

function menuOnClick(e){
	//devido a inconsistência no firefox e chrome no android, foi colocado menuOnClick(); antes de todos os comandos do menu
    hideMenu();
    document.removeEventListener(gparam.eventclick, menuOnClick);
}//.function menuOnClick

function menu_botao(event) {
	event.preventDefault();
	// menu funciona no chrome do android mas não no firefox (não fecha o menu)
	showMenu(10,25);
	setTimeout(function(){
        document.addEventListener(gparam.eventclick, menuOnClick, false);
	},1000);
	event.preventDefault();
	return false;
}//.function menu_botao
//.menu contextual

//resposta a evento drop no div do menu, para abrir opção de inserção. Por exemplo, arrastar do word ou excel uma lista de cnpjs.
function dragover_handler(ev) {
	ev.preventDefault();
	// Define o dropEffect para ser do tipo move
	ev.dataTransfer.dropEffect = "copy"
}//.function dragover_handler

function drop_handler(ev) {
	ev.preventDefault();
	// Pega o id do alvo e adiciona o elemento que foi movido para o DOM do alvo
	var tipos = ev.dataTransfer.types;
	//window.focus(); //não funciona, o focus with no aplicativo de origem da dragagem
	if (tipos.includes("text/x-moz-url")) { //funciona no firefox, mas no chrome não aparece esse flavor
		//var data = ev.dataTransfer.getData("text");
		var lista = ev.dataTransfer.getData("text/x-moz-url").split('\n'); //url separado do titulo por linha
		menu_ligar_novo('LI_' + lista[0], lista[1]);
	} else if (tipos.includes( "text/uri-list")) { //no chrome
		var item = ev.dataTransfer.getData("text/uri-list"); //aqui só tem url, não tem título da página como no firefox
		menu_ligar_novo('LI_' + item, '');
	} else if (tipos.includes("text/plain")) {
		var data = ev.dataTransfer.getData("text");
		inserir_lista(data);
	} else if (tipos.includes("Files")) {
		menu_importarJsonArquivo(ev, 'drop');
	} else {
		alertify.error('Drop. Tipo não reconhecido');
		console.log(tipos);
	}

}//.function drop_handler

function ajustaRegiaoDrop() {
	//var dropzoneId = "drop_area"; //"div_botoes"; //só esta região vai aceitar drop
	var dropzones = ['drop_area', 'principal_svg'];
	window.addEventListener("dragenter", function(e) {
		//console.log(e.target.id);
		//if (e.target.id != dropzoneId) {
		if (!dropzones.includes(e.target.id)) {
			e.preventDefault();
			e.dataTransfer.effectAllowed = "none";
			e.dataTransfer.dropEffect = "none";
		}
	}, false);

	window.addEventListener("dragover", function(e) {
		//if (e.target.id != dropzoneId) {
		if (!dropzones.includes(e.target.id)) {
			e.preventDefault();
			e.dataTransfer.effectAllowed = "none";
			e.dataTransfer.dropEffect = "none";
		}
	});

	window.addEventListener("drop", function(e) {
		//if (e.target.id != dropzoneId) {
		if (!dropzones.includes(e.target.id)) {
			e.preventDefault();
			e.dataTransfer.effectAllowed = "none";
			e.dataTransfer.dropEffect = "none";
		}
	});
}//.function ajustaRegiaoDrop

function ativaAtalhos(bcaptura) {
	// é preciso desativar antes de usar o alertify.prompt
	if (gparam.mobile) {
		return;
	}
	if (bcaptura) {
		document.onkeydown = evento_teclasDown;
	} else {
		document.onkeydown = null;
	}
}//.function ativaAtalhos

function evento_teclasDown(e) {
	function testa(keyIn, pressShift, pressCtrl) {
		//não dá para usar alt key, porque isso abre o menu do navegador
		if (keyIn!=e.code) {
			return false;
		} else if (pressShift!=e.shiftKey) {
			return false;
		} else if (pressCtrl!=e.ctrlKey) {
			return false;
		}
		return true;
	}

	if (e.code.startsWith('Digit') && (e.code.length==6)) {
		if (gparam.idnoSelecionado) {
			if (([ 'LI_', 'AR_'].includes(gparam.idnoSelecionado.substr(0,3))) || ((gparam.idnoSelecionado.substr(0,3)=='ID_') && !gparam.inicio.bBaseLocal))  {
				menu_abrirNovaAba(gparam.idnoSelecionado);
				return;
			}
		}
		var ns = e.code.substr(-1);
		var tipo = 'cnpj';
		if (e.shiftKey) {
			tipo = 'links';
		}
		if (('0' <= ns) && (ns <='9')) {
			if (ns=='0') {
				menu_incluirCamada('', 10, tipo);
			} else {
				menu_incluirCamada('', parseInt(ns), tipo);
			}
			e.preventDefault();
			return;
		}
	} else if (testa('KeyZ', false, true)) {
		menu_inserirDesfazer();
	} else if (testa('KeyF', false, false)) {
		menu_localiza();
	} else if (testa('KeyJ', false, false)) {
		menu_localiza_adjacentes();
	} else if (testa('KeyJ', true, false)) {
		menu_localiza_componente();
	} else if (testa('KeyJ', false, true)) {
		menu_localiza_itensComMaisLigacoes();
	} else if (testa('KeyI', false, false)) {
		menu_inserir();
	} else if (testa('KeyU', false, false)) {
		menu_ligar_novo();
	} else if (testa('KeyD', false, false)) {
		menu_dados(false, gparam.idNoOnHover);
	} else if (testa('KeyD', true, false)) {
		menu_dados(true, gparam.idNoOnHover);
	} else if (testa('KeyD', false, true)) {
		menu_listaSelecao(true);
	} else if (testa('KeyA', false, false)) {
		menu_abrirNovaAba(null, true);
	} else if (testa('KeyA', true, false)) {
		menu_abrirNovaAba(null);
	} else if (testa('KeyA', false, true)) {
		menu_selecionarTudo();
	} else if (testa('KeyA', true, true)) {
		menu_selecionarInverte();
	} else if (testa('KeyQ', false, false)) {
		menu_quebraGraficoEmPartes();
	} else if (testa('KeyE', false, false)) {
		menu_editar_no();
	} else if (testa('KeyG', false, false)) {
		menu_buscaEmSite('https://www.google.com/search?q=');;
	} else if (testa('KeyG', true, false)) {
		menu_GoogleMaps();;
	} else if (testa('KeyN', false, false)) {
		menu_rotulosCompletos(null);
	} else if (testa('KeyN', true, false)) {
		menu_ligacoesExibe(null);
	} else if (testa('KeyF', false, false)) {
		menu_localiza();
	} else if (testa('KeyF', true, false)) {
		menu_localiza(true);
	} else if (testa('KeyF', false, true)) {
		menu_localizaPorCampo(false);
	} else if (testa('KeyL', false, false)) {
		menu_ligar_selecionados(true);
	} else if (testa('KeyL', true, false)) {
		menu_desligar_selecionados(false);
	} else if (testa('KeyK', false, false)) {
		menu_ligar_selecionados(false);
	} else if (testa('Delete', false, false)) {
		menu_excluirNosSelecionados();
	} else if (testa('Delete', true, false)) {
		menu_excluirTudo();
	} else if (testa('Delete', false, true)) {
		removeIsolados(true);
	} else if (testa('Backspace', true, false)) {
		excluirNoMantendoLinks();
	} else if (testa('KeyP', false, false)) {
		menu_pinarNo(null);
	} else if (testa('KeyP', true, false)) {
		menu_pinarDesfazerTudo();
	} else if (testa('KeyP', false, true)) {
		menu_pinarUmNoEmCadaGrupo();
	} else if (testa('KeyC', false, false)) {
		menu_colorir();
	} else if (testa('KeyC', true, false)) {
		menu_colorir('transparent');
	} else if (testa('Space', false, false)) {
		menu_rendererAtivarParar(!gparam.bRenderAtivado, true);
	} else if (testa('ArrowLeft', false, false)) {
		menu_teclaLeft(false);
	} else if (testa('ArrowRight', false, false)) {
		menu_teclaRight(false);
	} else if (testa('ArrowUp', false, false)) {
		menu_teclaUp(false);
	} else if (testa('ArrowDown', false, false)) {
		menu_teclaDown(false);
	} else if (testa('KeyO', false, false)) {
		menu_exportaJSONServidorParaBaseLocal(true, '', 'operacao' );
	} else {
		return;
	}
	e.preventDefault();
}//.function evento_teclasDown

alertifyfake = {
	'prompt':function(titulo, texto, valor, func1, func2) {
		menuOnClick(); //firefox no android, não está fechando o menu
		var resp = 	prompt(titulo+'\n'+texto, valor);
		if (resp) {
			func1(null, resp);
		} else {
			func2();
		};
	},
	'confirm':function(titulo, texto, func1,func2) {
		menuOnClick();
		var resp = confirm(titulo + '\n' + texto);
		if (resp) {
			func1();
		} else {
			func2();
		}
	},
	'alert':function(titulo, texto, func) {
		menuOnClick();
		texto = texto.replace(/<b>/g, '').replace(/<\/b>/g, '').replace(/<br>/g, '')
		setTimeout(function(){ alert(titulo + '\n\n' + texto);}, 500);
	},
	'success':function(texto) {
		menuOnClick();
		setTimeout(function(){ alert(texto);}, 500);
	},
	'error':function(texto) {
		menuOnClick();
		setTimeout(function(){ alert('ERRO!!! ' + texto); }, 500);
	}
}//.alertifyfake

function ajustaAmbiente_adicionarListaIconesAoMenu() {
	//var menuIcone = document.getElementById('menu_selecao_icone');
	var menuIconeOptions = document.getElementById('menu_selecao_icone_options');

	for (item of gparam.listaImagens) {
		/*
		var itemMenu = document.createElement('li');
		itemMenu.innerHTML = '\
			<button type="button" class="menu-btn" onclick="menu_alteraIcone('+item+');"> \
			<i class="fa fa-tags"></i><span class="menu-text">' + item + '</span> \
			</button>	'
		itemMenu.setAttribute('class', "menu-item"); */


		var itemOption = document.createElement('option');
        //itemOption.onchange = 'menu_alteraIcone("' + item + '");';
		itemOption.text = item;
		itemOption.value = item;
		menuIconeOptions.appendChild(itemOption);
	}
}//.function ajustaAmbiente_adicionarListaIconesAoMenu

function ajustaAmbiente() {
	if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){ //mobile
		//mobile. gambiarra, o alertify não funciona no ipad, no android fica muito pequeno
		alertify.set('notifier','position', 'top-center'); //se fica de lado, os alertas não aparecem no mobile
		gparam.mobile = true;
		gparam.inserirDefault = 'TESTE'; //como é dificil digitar no mobile, coloca um valor padrão
		if (/Android/i.test(navigator.userAgent)) { //android
			//no android, tenta usar menu contextual. Aumenta o tamanho do menu para poder visualizar.
			//document.getElementsByClassName('menu')[0].style.scale=2;
			document.querySelectorAll('.menu-btn').forEach(function(element,key) {element.style.fontSize='30px'});
			document.querySelectorAll('.menu-text').forEach(function(element,key) {element.style.marginLeft='50px'});
			document.querySelector('.menu').style.width='500px';
			menu = document.querySelector('.menu');
			document.querySelector('body').style.fontSize='xx-large'; //para alterar tamanho do texto no alertify
			for (let botao of document.getElementsByClassName('botaosuperior')) {
				botao.style.fontSize = '60px'; //="font-size:60px;";
			}
		} else 	{ //safari
			gparam.safari = true;
			alertify.prompt = alertifyfake.prompt;
			alertify.confirm = alertifyfake.confirm;
			alertify.alert = alertifyfake.alert;
			//alertify.success = alertifyfake.success;
			//alertify.error = alertifyfake.error;
			//safari, trocar onclick por ontouchend nos botoes
    		var botoes = document.getElementsByClassName('botaosuperior');
    		for (var i=0; i<botoes.length; i++) { //ipad antigo não aceita let
    			botoes[i].ontouchend=botoes[i].onclick;
    		}
    		document.querySelectorAll('.menu-btn').forEach( function(element,key) {element.ontouchend = element.onclick;});
			menu = document.querySelector('.menu');
			gparam.eventclick = 'touchend';
			//no safari, redimensiona botoes por css
			document.querySelectorAll('.menu-btn').forEach(function(element,key) {element.style.fontSize='10px'});
			document.querySelectorAll('.menu-text').forEach(function(element,key) {element.style.marginLeft='40px'});
			document.querySelector('.menu').style.width='300px';
			//document.getElementById('botaoDadosBasicos').ontouchend = "";
		}
		alert('Isto não funciona corretamente no celular ou tablet... Se der erro, tente em um computador com o Firefox, Chrome ou Edge.');
		document.getElementById("drop_area").style.display = "none"; //esconde área de drop em mobile
		document.getElementById('div_referencia').textContent=""; //apaga referencia
	} else { //desktop
		try {
			document.getElementById('btn_github').textContent="Rede-CNPJ no Github";
			document.getElementById('btn_srf').textContent="Dados Públicos da Receita Federal";
		} catch (e) {;}
		menu = document.querySelector('.menu');
		document.addEventListener('contextmenu', onContextMenu, false); //menu contextual em toda a tela
		ajustaAmbiente_adicionarListaIconesAoMenu();
	}
}//.function ajustaAmbiente
function changeVisibility() {
    var prin = document.getElementById('principal');
    var seg =  document.getElementById('segundo');
    if (prin.style.visibility === "visible")
    {
    prin.style.visibility = "hidden";
    seg.style.visibility = "visible";
    }
    else
    {
    prin.style.visibility = "visible";
    seg.style.visibility = "hidden";
    }

}
function main() {
//var loc = window.location.pathname;
//var dir = loc.substring(0, loc.lastIndexOf('/'));
//alert('debug: '+dir)
	ajustaAmbiente();
	gparam.layout = Viva.Graph.Layout.forceDirected(graph, {
		   springLength : gparam.springLength, //170, //140, //80,
		   springCoeff : 0.0002, //0.0002,
		   dragCoeff : 0.02,
		   gravity : -1.2,
		   theta : 0.8
	});
	gparam.renderer = Viva.Graph.View.renderer(graph, {
			graphics : graphics,
			layout: gparam.layout,
			container  : document.getElementById('principal')
		});

	gparam.renderer.run();

	gparam.geom = Viva.Graph.geom();
	if (gparam.mobile) {
		menu_zoomin(false, false);
		menu_zoomin(false, false);
	} else {
		//Ajusta região para drag and drop de arquivo ou do excel
		ajustaRegiaoDrop();
		gparam.AreaSelecaoRetangular.Setup();
		ativaAtalhos(true);
	}

	if (gparam.inicio.cpfcnpj) {
		menu_incluirCamada(gparam.inicio.cpfcnpj, gparam.inicio.camada, null, true);
	} else if (gparam.inicio.idArquivoServidor ) {
		menu_importaJSONServidor(gparam.inicio.idArquivoServidor, true);
	} else if (gparam.inicio.lista) {
		inserir_lista(gparam.inicio.lista, true);
	} else if (gparam.inicio.json) {
		inserirJson(gparam.inicio.json, 'Json informado. ', true);
	} else {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('pula_mensagem')!='sim') {
			if (gparam.inicio.mensagem) {
				alert(gparam.inicio.mensagem);
			}
		}
		if (gparam.inicio.bMenuInserirInicial) {
			menu_inserir();
		}
	}

}//.main()

</script>
