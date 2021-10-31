//------------------------ Define funções que criam marcadores -----------------------------------------------------------------
//------------------------------------Marcadores - quadrado e circulo-------------------------------------------------------------------------
var gLastTap = 0;
var gTouchStartTime = 0;

function criaMarcador(){
	var createMarker = function(id, x, y) {
			return Viva.Graph.svg('marker')
					   .attr('id', id)
					   .attr('viewBox', "0 0 10 10")
					   .attr('refX', x)
					   .attr('refY', y)
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', tamanhoSeta*2)
					   .attr('markerHeight', tamanhoSeta)
					   .attr('orient', "auto");
		};
	var marker = createMarker('Triangulo', "10", "5");			
	var markerInv = createMarker('TriangleInv',"0","5");
	marker.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z').attr('fill','gray');;
	markerInv.append('path').attr('d', 'M 10 0 L 0 5 L 10 10 z');
	var MeiaSeta = Viva.Graph.svg('marker')
					   .attr('id', "MeiaSeta")
					   .attr('viewBox', "0 0 20 10")
					   .attr('refX', "20")
					   .attr('refY', "10")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', tamanhoSeta)
					   .attr('markerHeight', tamanhoSeta*2)
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	MeiaSeta.append('path').attr('d', 'M 0 0 L 20 10 L 0 10 z').attr('fill','black');
	var Vermelho = Viva.Graph.svg('marker')
					   .attr('id', "Vermelho")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	Vermelho.append('circle').attr('cx','30').attr('cy','30').attr('r','30').attr('fill','red');
	var VermelhoQua = Viva.Graph.svg('marker')
					   .attr('id', "VermelhoQua")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	VermelhoQua.append('path').attr('d', 'M 0 0 L 0 60 L 60 60 L 60 0 z').attr('fill','red');
	var Verde = Viva.Graph.svg('marker')
					   .attr('id', "Verde")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	Verde.append('circle').attr('cx','30').attr('cy','30').attr('r','30').attr('fill','green');
	var VerdeQua = Viva.Graph.svg('marker')
					   .attr('id', "VerdeQua")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	VerdeQua.append('path').attr('d', 'M 0 0 L 0 60 L 60 60 L 60 0 z').attr('fill','green');
	var Dourado = Viva.Graph.svg('marker')
					   .attr('id', "Dourado")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	Dourado.append('circle').attr('cx','30').attr('cy','30').attr('r','30').attr('fill','gold');
	var DouradoQua = Viva.Graph.svg('marker')
					   .attr('id', "DouradoQua")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	DouradoQua.append('path').attr('d', 'M 0 0 L 0 60 L 60 60 L 60 0 z').attr('fill','gold');
	var Azul = Viva.Graph.svg('marker')
					   .attr('id', "Azul")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	Azul.append('circle').attr('cx','30').attr('cy','30').attr('r','30').attr('fill','blue');
	var AzulQua = Viva.Graph.svg('marker')
					   .attr('id', "AzulQua")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	AzulQua.append('path').attr('d', 'M 0 0 L 0 60 L 60 60 L 60 0 z').attr('fill','blue');
	var AzulEscuro = Viva.Graph.svg('marker')
					   .attr('id', "AzulEscuro")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	AzulEscuro.append('circle').attr('cx','30').attr('cy','30').attr('r','30').attr('fill','darkslateblue');
	var AzulEscuroQua = Viva.Graph.svg('marker')
					   .attr('id', "AzulEscuroQua")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	AzulEscuroQua.append('path').attr('d', 'M 0 0 L 0 60 L 60 60 L 60 0 z').attr('fill','darkslateblue');
	var Roxo = Viva.Graph.svg('marker')
					   .attr('id', "Roxo")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	Roxo.append('circle').attr('cx','30').attr('cy','30').attr('r','30').attr('fill','purple');
	var RoxoQua = Viva.Graph.svg('marker')
					   .attr('id', "RoxoQua")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	RoxoQua.append('path').attr('d', 'M 0 0 L 0 60 L 60 60 L 60 0 z').attr('fill','purple');
	var Cinza = Viva.Graph.svg('marker')
					   .attr('id', "Cinza")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	Cinza.append('circle').attr('cx','30').attr('cy','30').attr('r','30').attr('fill','silver');
	var CinzaQua = Viva.Graph.svg('marker')
					   .attr('id', "CinzaQua")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	CinzaQua.append('path').attr('d', 'M 0 0 L 0 60 L 60 60 L 60 0 z').attr('fill','silver');
	var Preto = Viva.Graph.svg('marker')
					   .attr('id', "Preto")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	Preto.append('circle').attr('cx','30').attr('cy','30').attr('r','30').attr('fill','black');
	var PretoQua = Viva.Graph.svg('marker')
					   .attr('id', "PretoQua")
					   .attr('viewBox', "0 0 60 60")
					   .attr('refX', "30")
					   .attr('refY', "30")
					   .attr('markerUnits', "strokeWidth")
					   .attr('markerWidth', "60")
					   .attr('markerHeight', "60")
					   //.attr('render-order',-1)
					   .attr('orient', "auto");
	PretoQua.append('path').attr('d', 'M 0 0 L 0 60 L 60 60 L 60 0 z').attr('fill','black');

		 //	<pattern id="crosshatch" patternUnits="userSpaceOnUse" width="8" height="8"> <image xlink:href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc4JyBoZWlnaHQ9JzgnPgogIDxyZWN0IHdpZHRoPSc4JyBoZWlnaHQ9JzgnIGZpbGw9JyNmZmYnLz4KICA8cGF0aCBkPSdNMCAwTDggOFpNOCAwTDAgOFonIHN0cm9rZS13aWR0aD0nMC41JyBzdHJva2U9JyNhYWEnLz4KPC9zdmc+Cg==" 
//	x="0" y="0" width="8" height="8"> </image> </pattern>
	/*
	var FiltroSaturate = Viva.Graph.svg("feColorMatrix" ).attr('type','saturate');
	var FiltroPB = Viva.Graph.svg('filter').attr('id', "FiltroPB");
	FiltroPB.appendChild(FiltroSaturate);
	*/
	
	// Marker should be defined only once in <defs> child element of root <svg> element:
	//var defs = graphics.getSvgRoot().append('defs');
	if (!defs) {
		defs = graphics.getSvgRoot().append('defs');
	}
	defs.append(marker);
	defs.append(markerInv);
	defs.append(MeiaSeta);
	defs.append(Vermelho);
	defs.append(VermelhoQua);
	defs.append(Verde);
	defs.append(Dourado);
	defs.append(Azul);
	defs.append(AzulEscuro);
	defs.append(Roxo);
	defs.append(Cinza);
	defs.append(Preto);
	defs.append(VerdeQua);
	defs.append(DouradoQua);
	defs.append(AzulQua);
	defs.append(AzulEscuroQua);
	defs.append(RoxoQua);
	defs.append(CinzaQua);
	defs.append(PretoQua);
	//defs.append(markerTexto);		
	//defs.append(FiltroPB);
}


//------------------------ Define funções para configurar os Links -------------------------------------------------------------
//------------------------------------Links com setas-------------------------------------------------------------------------


function configuraLinks(){
	var geom = Viva.Graph.geom(); 
	
	graphics.link(function(link){
		var grupo = Viva.Graph.svg('g');
		link.data.cor = retornaCorDoRelacionamentoF(link.data.tipoDescricao);
		var uipath=Viva.Graph.svg('path')
				   .attr('stroke', link.data.cor)
				   .attr('stroke-width', 0.5) //não estava definido, default é 1 - 0.5 fica melhor quando há muitos nós 
				   .attr('fill','none')
				   //.attr('render-order',5)
				   .attr('id', link.data.id); // !gUsaMarcadorLink
		//if ((link.data.label != 'endereço') && (link.data.label != 'telefone') && (link.data.label != 'conta_corrente')) {

		//var textoLabel = link.data.label;
		var textoLabel = textoLinkF(link.data.tipoDescricao, false);
		var textoTooltipLink = textoLinkF(link.data.tipoDescricao, true);
		var labeltemp = Viva.Graph.svg('text')
			.attr('font-size', dadosNos.tamanhoFonte)
			.attr('text-anchor','middle')
			//.attr('render-order',6)
			//.attr('render-order', '-1')
			//.attr('fill',corTextoLink(link.data.linkId))		
			.attr('fill',corTextoLinkF(link.data.tipoDescricao))						
			.attr('id','texto_ligacao_' + link.data.id)
			//.attr('title',textoTooltipLink)
			.text(textoLabel);
		graphics.getSvgRoot().childNodes[0].append(labeltemp).insertAdjacentHTML('beforeEnd','<title>' + textoTooltipLink + '</title>');
		
		
		// idéia para dar clique duplo no texto do rótulo da ligação e abrir a macro correspondente.
		$(labeltemp).dblclick(function(event) {
			if (!grafoOnline()) {
				return ;
			}
			if (event.which == 1) {
				//console.log('double');
				//alert(link.fromId+"   "+link.toId+" "+link.data.tipoDescricao);
				abreMacro(link.data.tipoDescricao, link.fromId, link.linktoId); 
			};
			return;
		});
/*
		if (navigator.userAgent.search('Firefox') != -1) { 
			graphics.getSvgRoot().childNodes[0].append(labeltemp); 
		} else { //tooltip do link no chrome
			graphics.getSvgRoot().childNodes[0].append(labeltemp).insertAdjacentHTML('beforeEnd','<title>' + textoTooltipLink + '</title>');
		} */
						
		//if (link.data.sentidoUnico == true) {
		if (ehSentidoUnicoF(link.data.tipoDescricao)) {
			$(uipath).attr('marker-end','url(#Triangulo)');
			//$(ui).attr('marker-end', 'url(#MeiaSeta)');
		}
			
		link.data.ref = $(uipath);
		return uipath;
	}).placeLink(function(linkUI, fromPos, toPos) {
		// Here we should take care about 
		//  "Links should start/stop at node's bounding box, not at the node center."
		// For rectangular nodes Viva.Graph.geom() provides efficient way to find
		// an intersection point between segment and rectangle
		var toNodeSize = nodeSize,
			fromNodeSize = nodeSize;
			
		var from = geom.intersectRect(
				// rectangle:
						fromPos.x - fromNodeSize / 2, // left
						fromPos.y - fromNodeSize / 2, // top
						fromPos.x + fromNodeSize / 2, // right
						fromPos.y + fromNodeSize / 2, // bottom
				// segment:
						fromPos.x, fromPos.y, toPos.x, toPos.y) 
				   || fromPos; // if no intersection found - return center of the node
		
		var to = geom.intersectRect(
				// rectangle:
						toPos.x - toNodeSize / 2, // left
						toPos.y - toNodeSize / 2, // top
						toPos.x + toNodeSize / 2, // right
						toPos.y + toNodeSize / 2, // bottom
				// segment:
						toPos.x, toPos.y, fromPos.x, fromPos.y) 
					|| toPos; // if no intersection found - return center of the node	
			
			var data = 	'M' + from.x + ',' + from.y + 
						//'L' + intermed.x + ',' + intermed.y +
						'L' + to.x + ',' + to.y;
		
			linkUI.attr("d", data);

		/* ajuste da posição do texto (sem marcador) */
		var angulo = 180.0/Math.PI* Math.atan2(toPos.y-fromPos.y,toPos.x - fromPos.x);
		var baseline = '-1';
		//console.log(JSON.stringify(linkUI));
		//if (!graph.hasLink(linkUI.toId, linkUI.fromId)) { //isto não funciona
		if (1) {
			if (angulo>90) {
				angulo = -(180.0 - angulo);
				baseline = '-1';
			} else if (angulo<-90) {
				angulo = 180.0 + angulo;
				baseline = '-2';
			}
		}
		var elemento = document.getElementById('texto_ligacao_'+linkUI.attr('id'));
		if (elemento) {
				elemento.attr("transform","rotate(" + parseFloat(angulo) + " " + parseInt((from.x + to.x) / 2) + "," 
					+ parseInt((from.y + to.y) / 2) + ") translate(0," + baseline + ")")
				.attr("x", (from.x + to.x) / 2)
				.attr("y", (from.y + to.y) / 2);
		}
	});
}
/*
function configuraLinksAnterior(){
	graphics.link(function(link){
		//alert(link.fromId+"   "+link.toId+" "+link.data.cor+" "+link.data.label);
		return Viva.Graph.svg('path')
			.attr('stroke', link.data.cor);
	}).placeLink(function(linkUI, fromPos, toPos) {
		var data = 'M' + fromPos.x + ',' + fromPos.y + 
				   'L' + toPos.x + ',' + toPos.y;

		linkUI.attr("d", data);
	});
}
*/

//------------------------ Define funções para configurar os Nós -------------------------------------------------------------
//Configura os Nós
function configuraNos(){
	graphics.node(function(node) {
		var LF = String.fromCharCode(10);
		var linhaTexto1='', linhaTexto2='', linhaTextoNota=''; 
		if (!node.data.label) {
			node.data.label = ''; // evitar erro quando label não foi inicializado
		}
		if (node.data.tipo == 'END') {
			linhaTexto1 = node.id.split('__')[0];
			linhaTexto2 = node.id.split('__')[1];
		} else if (node.data.tipo == 'TEL') {
				linhaTexto1 = node.id; //node.id.slice(4);	
		} else if (node.data.tipo == 'CC') {
				linhaTexto1 = node.id.split('-')[0] + '-' + node.id.split('-')[1];
				linhaTexto2	= node.id.split('-')[2]; //node.id.slice(4);	
		//} else if (node.data.label.startsWith("Inexistente")) {
		} else if (node.data.label.startsWith("Inexistente")) {
				linhaTexto1 = node.id;
				linhaTexto2 = 'Inexistente';
		} else if (node.data.tipo == 'IDE') { 
			linhaTexto1 = node.data.label; //remove underscore do começo
			linhaTexto2 = '';
		} else if (node.data.tipo == 'DOC') { 
			linhaTexto1 = node.id.substr(1); //remove underscore do começo
			var pos = linhaTexto1.substring(8).search('/');
			if (pos>0) {
				linhaTexto1 = linhaTexto1.substring(0, pos+8);
			}
			linhaTexto2 = node.data.label;
		} else { //PF, PJ e ES
				linhaTexto1 = formataCPFCNPJ(node.id);
				linhaTexto2 = node.data.label;
		}
		

		//textoTooltip = textoTooltip.trim();
		//mudar a cor de borda conforme a situação da PF/PJ
		node.data.corFonte = retornaCorFonteNaCamada(node.data.camada);
		node.data.tamanhoFonte = kTamanhoFonte;
		var corStroke = node.data.corFonte;
		var ui = Viva.Graph.svg('g');
		ui.insertAdjacentHTML('beforeEnd','<title>' + textoTooltip(node, true) + '</title>'); //title deve ser a primeira coisa apos g para funcionar no firefox 48
		// https://developer.mozilla.org/pt-BR/docs/Web/SVG/Element/title
		var	rect = Viva.Graph.svg('rect')
				//.attr('id','no_' + node.id)
				//.attr('stroke-width', 1)	
				//.attr('render-order',1)					
				.attr('stroke',corStroke)
				.attr('stroke-width', 0.2)		//.attr('stroke-width', 1)			
				.attr('fill', corFundoImagemF(node)) 
				.attr('y', -nodeSize*0+'px')
				.attr('x', -nodeSize*0+'px')
				.attr('width', nodeSize*1)
				.attr('height', nodeSize*1)
				.attr('tipo','fundo'); //inclui tipo para distinguir de outros rects
		var lineTop = Viva.Graph.svg('path')
				.attr('d', 'M 0 0 L 7.5 0 L 15 0')
				.attr('stroke-width', 0.1)
				.attr('stroke', corStroke);
		var	lineBottom = Viva.Graph.svg('path')
				.attr('d', 'M 0 15 L 7.5 15 L 15 15')
				.attr('stroke-width', 0.1)
				.attr('stroke', corStroke);
		var lineLeft = Viva.Graph.svg('path')
				.attr('d', 'M 0 0 L 0 7.5 L 0 15')
				.attr('stroke-width', 0.1)
				.attr('stroke', corStroke);
		var lineRight = Viva.Graph.svg('path')
				.attr('d', 'M 15 0 L 15 7.5 L 15 15')
				.attr('stroke-width', 0.1)
				.attr('stroke', corStroke);
		var svgText1 = Viva.Graph.svg('text')
			.attr('y', String(parseInt(node.data.tamanhoFonte) + nodeSize + 3) + 'px') //era -4px, 22px=15+4(fonte)+3
			.attr('x', '7px')  //era 0, x,y trocado para centralizar embaixo do quadrado
			.attr('font-size',node.data.tamanhoFonte)
			.attr('fill',node.data.corFonte)
			.attr('text-anchor','middle')
			//.attr('focusable', false)
			//.attr('visibility', 'visible')
			.attr('id', 'texto_no_linha1_' + node.id)
			//.attr('render-order',10)
			.text(linhaTexto1);	
		var svgText2 = null;
		if (linhaTexto2 != '') {
			svgText2 = Viva.Graph.svg('text')
				.attr('y', String(2*parseInt(node.data.tamanhoFonte) + nodeSize + 3) + 'px') //era -4px, 22px=15+4(fonte)+3
				.attr('x', '7px')  //era 0, x,y trocado para centralizar embaixo do quadrado
				.attr('font-size',node.data.tamanhoFonte)
				.attr('fill',node.data.corFonte)
				.attr('text-anchor','middle')
				//.attr('focusable', false)
				//.attr('visibility', 'visible')
				.attr('id', 'texto_no_linha2_' + node.id)
				//.attr('render-order',10)
				.text(linhaTexto2);
		}
		// dá para quebrar a linha usando tspan . <text y="26px" x="7px" font-size="4" fill="GoldenRod" text-anchor="middle" id="textoxxx"><tspan x="7" dy="0">linha1</tspan><tspan x="7" dy="4">linha2</tspan></text>
		var posicaoNota = svgText2 ? (4*parseInt(node.data.tamanhoFonte) + nodeSize + 3) : (2*parseInt(node.data.tamanhoFonte) + nodeSize + 3);
		var textoNota = node.data.nota ? node.data.nota : '';
		var svgTextNota = null;
		if (true) { //(linhaTextoNota != '') {
			svgTextNota = Viva.Graph.svg('text')
				.attr('y', String(posicaoNota) + 'px') //era -4px, 22px=15+4(fonte)+3
				.attr('x', '7px')  //era 0, x,y trocado para centralizar embaixo do quadrado
				.attr('font-size',2*node.data.tamanhoFonte)
				.attr('fill','black') //node.data.corFonte)
				.attr('text-anchor','middle')
				//.attr('focusable', false)
				//.attr('visibility', 'visible')
				.attr('id', 'texto_nota_' + ajustaQuerySelector(node.id))
				//.attr('render-order',10)
				.text(textoNota); //linhaTextoNota cria o elemento para inserir anotação depois
		}
		//----------------------------------------------------------------------
		//criar atributo 'relevante'=cpf ou cnpjs que tem informação relevante cadastrada
		//node.data.m10 = 0;
		
		if ((node.data.m10 == 1)||(node.data.tipo=='INF'))	{
			var rectRelevante = Viva.Graph.svg('circle')
				.attr('stroke-width',2)
				.attr('stroke', 'orange')
				.attr('fill', 'orange')
				.attr('cy', parseInt(nodeSize/2))
				.attr('cx', parseInt(nodeSize/2))
				.attr('r', parseInt(nodeSize*0.7));
			ui.append(rectRelevante);
		}
		if ((node.data.tipo=='ENT'))	{ // novidade 2019-03-14
			var rectRelevante = Viva.Graph.svg('circle')
				.attr('stroke-width',2)
				.attr('stroke', 'orange')
				.attr('fill', 'orange')
				.attr('cy', parseInt(nodeSize/2))
				.attr('cx', parseInt(nodeSize/2))
				.attr('r', parseInt(nodeSize*0.7));
			ui.append(rectRelevante);
		}
		//adicionar os marcadores conforme atributos do Nó------------------
		if (node.data.tipo == "PF") { //m1 para PJ indica tipo de entidade
			if (node.data.m1 == 1) { //circulo verde, servidor público estadual ou municipal
				$(lineTop).attr('marker-start', 'url(#Verde)');
			}
			if (node.data.m1 == 2) { //quadrado verde, pessoa física possui cadastro no siape
				$(lineTop).attr('marker-start', 'url(#VerdeQua)');
			}
		} else if(node.data.tipo == "PJ") {
			if (node.data.m1 == 1) { //circulo verde, empresa de servidor público federal, estadual ou municipal
				$(lineTop).attr('marker-start', 'url(#Verde)');
			}			
		}

		if (node.data.m2 == 1) { //pessoa física tem salário base menor que 2 salários mínimos, pj com sócio baixa renda
			$(lineTop).attr('marker-mid', 'url(#Cinza)');
		}
		/*
		if (node.data.m2 == 2) { //??
			$(lineTop).attr('marker-mid', 'url(#CinzaQua)');
		} */
		if ((node.data.m3 & 1) == 1) { //indica que a pf/pj recebeu ordem bancária do siafi
			$(lineTop).attr('marker-end', 'url(#Vermelho)');
		} else if ((node.data.m3 & 2) ==2) { //indica que pf/pj teve pagamento entre top 100 de municipios
			$(lineTop).attr('marker-end', 'url(#VermelhoQua)');
		}
		if (node.data.m4 == 1) { //pessoa física investigada em sindicância ou processo
			$(lineLeft).attr('marker-mid', 'url(#Azul)');
		}
		if (node.data.m4 == 2) { //?
			$(lineLeft).attr('marker-mid', 'url(#AzulQua)');
		}
		if (node.data.m5 == 1) { //circulo preto: pf=pessoa foi candidata, pj=pessoa jurídica possui de 1 a 3 funcionários(rais)						   	
			$(lineRight).attr('marker-mid', 'url(#Preto)');
		}
		if (node.data.m5 == 2) { //quadrado preto: pf=pessoa eleita, pj=pessoa jurídica não possui funcionários (rais)
			$(lineRight).attr('marker-mid', 'url(#PretoQua)');
		}
		if (node.data.m6 == 1) { //pf=cadastro no ceis/cepim/punidos, pj = ceis/cepim
			$(lineBottom).attr('marker-start', 'url(#Dourado)');
		}
		if (node.data.m6 == 2) { //??
			$(lineBottom).attr('marker-start', 'url(#DouradoQua)');
		}
		if (node.data.m7 == 1) { //pf ou pj doadora de campanha
			$(lineBottom).attr('marker-mid', 'url(#Roxo)');
		}
		if (node.data.m7 == 2) { //?
			$(lineBottom).attr('marker-mid', 'url(#RoxoQua)');
		}
		if (node.data.m8 == 1) { //pf consta do bolsa família, cad unico ou defeso pescador
			$(lineBottom).attr('marker-end', 'url(#AzulEscuro)');
		}
		if (node.data.m8 == 2) { //?
			$(lineBottom).attr('marker-end', 'url(#AzulEscuroQua)');
		}
		node.data.avatar= retornAvatar(node.data);
		
		var img = Viva.Graph.svg('image');

		img.attr('width', nodeSize)
		.attr('height', nodeSize)
		//.attr('render-order', '10')
		//.attr('filter','url(#FiltroPB)')
		.link(caminhoImagem + node.data.avatar);
		// if (navigator.userAgent.search('Firefox') != -1) { 
		// 	img.attr('title', textoTooltip(node, true)); //firefox 48 dá problema na criação dinâmico do tooltip, no chrome o tooltip é criado dinamicamente
		// 	// img.setAttribute('title', textoTooltip(node, true)); //firefox 48 dá problema na criação dinâmico do tooltip, no chrome o tooltip é criado dinamicamente
		// }		
		//------------------------------------------------------------------
		ui.append(lineTop);
		ui.append(lineBottom);
		ui.append(lineLeft);
		ui.append(lineRight);
		ui.append(rect);
		ui.append(img);
		ui.append(svgText1);
		if (svgText2 != null) {
			ui.append(svgText2);
		}			
		ui.append(svgTextNota);
		//----------------------------------------------------------------------
		//criar atributo 'falecido'
		//node.data.m9 = 0;
		if (node.data.m9 == 1)
		{
			var metade = nodeSize/2;
			var umQuarto = nodeSize/4;
			var faixa = Viva.Graph.svg('rect')
				.attr('fill', 'black')
				.attr('y', (-nodeSize*0+metade-umQuarto/2)+'px')
				.attr('x', (-nodeSize*0+nodeSize*0.05)+'px')
				.attr('width', nodeSize*0.9)
				.attr('height', umQuarto);
			ui.append(faixa);
			if (node.data.tipo == "PF") {
				var textoFalecido = Viva.Graph.svg('text')
					.attr('y', (-nodeSize*0+metade*1.33-umQuarto/2)+'px')
					.attr('x', (-nodeSize*0+nodeSize*0.1)+'px')
					.attr('font-size',nodeSize*0.16)
					.attr('fill','white')
					.text('Falecido(a)');
				ui.append(textoFalecido);
			}
		}
	
		
		//---------------------------------------------------------------------

		node.data.ref = $(ui);
 /*
$(ui).keypress(function (e) {
    //if (e.which == 13) {
        alert('You pressed enter!');
    //}
});*/
		
		$(ui).hover(function() { // mouse over
				highlightRelatedNodes(node.id, true);
				//gSVGtemp=Viva.Graph.svg('text').attr('y', '-8px').attr('font-size','15').attr('fill','red').text(node.data.label);
				//ui.appendChild(gSVGtemp);
				//mostraTextoDeLigacao(1); fica muito lento
				//coloca tooltip dinamicamente
				/*
				if (navigator.userAgent.search('Firefox') == -1) { //NO CHROME
					var nodeUI=graphics.getNodeUI(node.id);
					for (var c=0;c<nodeUI.children.length;c++) { 
						if (nodeUI.children[c].tagName=='image') { 
							// no firefox 48 a inclusão de tooltip dessa forma não está funcionando
							// nodeUI.children[c].setAttribute('title',textoTooltip(node, true)); //adiciona tooltip à imagem do ícone
							// no chrome é preciso usar outra estratégia
							if (!nodeUI.title) {
								nodeUI.insertAdjacentHTML('beforeEnd','<title>' + textoTooltip(node, true) + '</title>');
								nodeUI.title='ok';
							}
							break;
						} 
					}
				} 
				*/
			}, function() { // mouse out
				if ((gUltimoNodeId == null) || (gUltimoNodeId != node.id)){
					highlightRelatedNodes(node.id, false);
					//botaoExibirOcultarTextoDeLigacao();
				}
				/*
				if (navigator.userAgent.search('Firefox') != -1) {
					var nodeUI=graphics.getNodeUI(node.id);
					for (var c=0;c<nodeUI.children.length;c++) { 
						if (nodeUI.children[c].tagName=='image') { 
							// if (navigator.userAgent.search('Firefox') != -1) {
								nodeUI.children[c].setAttribute('title',''); //remove texto do tooltip
							// };
							break;
						} 
					}
				}
				*/
				//ui.removeChild(gSVGtemp);						//$(ui).removeChild(Viva.Graph.svg('text').attr('y', '-4px').text(node.id));
			}
		);					
		/* comentei, não entendi a necessidade dessa parte.
		$(ui).toggle(function () {
				selecionaNode("", false);			
				selecionaNode(node, true);
			},function () {
				carregaMenuLateral("",false);  //reseta o menu lateral
				selecionaNode('', false);		
			});
		*/
		$(ui).click(function( event ) { //necessário, mesmo que preventDefault 
			if ( event.shiftKey || event.controlKey) {
				event.preventDefault();
				//event.stopPropagation();
				//return true;
			}
		});

		// teste touch
		//var gLastTap = 0;
		//var gTapTimeout;
		$(ui).on('touchstart', function(event) {
			gTouchStartTime = new Date().getTime();
		});
		$(ui).on('touchend', function(event) {
			//todo verificar posição
			var currentTime = new Date().getTime();
			var tapLength = currentTime - gLastTap;
			if (tapLength<500 && tapLength > 0) {
				//double tab
				if (!grafoOnline()) {
					return true;
				}
				expandirCamada1(node);
				event.preventDefault();	
			} else {
				var touchLength = currentTime - gTouchStartTime;
				if (touchLength>2000 && gTouchStartTime!=0) {
					//fireEvent(event,'contextmenu');
					gTouchStartTime=0;
					alerta('Menu de contexto não implementado');
					event.preventDefault();	
					return true;
				}
				//single tap
				carregaMenuLateral(node, true);
				selecionaNode("", false); //desseleciona tudo
				selecionaNode(node,true);		
				if (navigator.userAgent.search('Firefox') != -1) {				
					$('#mc_titulo')[0].label = rotuloMenuContextual(node);
				}	
			}
			gLastTap = currentTime;
			return true;			
		});
		$(ui).mouseup(function(event) {
			retorno = true;
			if ( event.shiftKey ) {
				event.preventDefault();              
				if (gIdNosSelecionados.indexOf(node.id)==-1) {
					selecionaNode(node,true);				
				} else {
					//remove da seleção
					selecionaNode(node,false);
				}
				if (navigator.userAgent.search('Firefox') != -1) {				
					$('#mc_titulo')[0].label = rotuloMenuContextual(node);
				}
				return true;
			}
			if (event.which == 1) {
				carregaMenuLateral(node, true);
				selecionaNode("", false); //desseleciona tudo
				selecionaNode(node,true);		
				if (navigator.userAgent.search('Firefox') != -1) {				
					$('#mc_titulo')[0].label = rotuloMenuContextual(node);
				}
			} else if (event.which == 2) {
				//botão central abre edição de nota
				editarNota(node);
			} else if (event.which == 3) {
				gRightClickNo=node;
				if (gIdNosSelecionados.indexOf(node.id)==-1) {
					selecionaNode("", false); //desseleciona tudo
					selecionaNode(node,true);
				}
				renderer.pause();
				//event.preventDefault(); //?precisa
				var rotulo = rotuloMenuContextual(node);
				//var rotulo =  (node.data.label!='')? ((node.data.label.length>30)? (node.data.label.substring(0,30)+'...') : node.data.label) : node.id.substring(0,30);
				//if (gIdNosSelecionados.length>1) {
				//	rotulo = 'Expandir 1 Camada';
				//}
				ajustaMenuContextualGrafo(this,node,rotulo);
			}
		});
		$(ui).dblclick(function(event) {
			if (!grafoOnline()) {
				return ;
			}
			if (event.which == 1) {
				//console.log('double');
				expandirCamada1(node);
			};
			return;
		});

		/*
		$(ui).mousedown(function(event) {
			console.log(Date() + ' mousedown');
			return;
		});	
		*/
		return ui;
		}).placeNode(function(nodeUI, pos) {
			// 'g' element doesn't have convenient (x,y) attributes, instead
			// we have to deal with transforms: http://www.w3.org/TR/SVG/coords.html#SVGGlobalTransformAttribute 
			nodeUI.attr('transform', 'translate(' + (pos.x - nodeSize/2) + ',' + (pos.y - nodeSize/2) + ')');
		}); 
}

function fireEvent(e, name){
	var event = new $.Event(name);
	event.pageX = e.changedTouches[0].pageX;
	event.pageY = e.changedTouches[0].pageY;
	$(e.target).trigger(event);
}

function ajustaMenuContextualGrafo(elementoComMenu,node,rotulo) {
	if (navigator.userAgent.search('Firefox') != -1) {
		$('#mc_titulo')[0].label = rotulo;
		if ((node.data.tipo == "PJ") || (node.data.tipo == "ES"))	{
			$('#mc_abrir')[0].hidden = false;
			$('#mc_ligacoes')[0].hidden = false;
			$('#mc_rais')[0].hidden = true;
			$('#mc_depsiape')[0].hidden = true;				
			$('#mc_siconvcontrato')[0].hidden = false;			
			$('#mc_tribunalcontas')[0].hidden = false;									
		} else if (node.data.tipo == "PF") {
			$('#mc_abrir')[0].hidden = false;
			$('#mc_ligacoes')[0].hidden = false;
			$('#mc_rais')[0].hidden = false;
			$('#mc_depsiape')[0].hidden = false;	
			$('#mc_siconvcontrato')[0].hidden = false;	
			$('#mc_tribunalcontas')[0].hidden = false;																
		} else { //(node.data.tipo == TEL ou END
			$('#mc_abrir')[0].hidden = true;
			$('#mc_ligacoes')[0].hidden = true;
			$('#mc_rais')[0].hidden = true;
			$('#mc_depsiape')[0].hidden = true;
			$('#mc_siconvcontrato')[0].hidden = true;	
			$('#mc_tribunalcontas')[0].hidden = true;
		}
		if (gHistoricoIdNosInseridos.length==0) {
			$('#mc_desfazer_ligacoes')[0].hidden = true;	
		} else {
			$('#mc_desfazer_ligacoes')[0].hidden = false;	
		}					
		if  (layout.isNodePinned(node)) {
			$('#mc_fixar_no')[0].label = 'Desafixar Nó';	
		} else {
			$('#mc_fixar_no')[0].label = 'Fixar Nó';	
		}
	} else { //no caso do chrome, usa o jquery-menu
		$('#tituloMenu').text(rotulo); //(node.data.label!='')? node.data.label.substring(0,30) : node.id.substring(0,30));	
		$(document).ready( function() {
			$(elementoComMenu).contextMenu({
				menu: "menuNo"
			},
			function(action, el, pos) { 
				//essa função parece que não é chamada
			});

		});				
		if ((node.data.tipo == "PJ") || (node.data.tipo == "ES"))	{
			$('#incluir_MenuAbrir').css('display','table');
			$('#incluir_PF').css('display','none');
			//$('#incluir_PJ').css('display','table');
			$('#incluir_PFPJ').css('display','table');
			$('#abreGoogle').css('display','table');
		} else if (node.data.tipo == "PF") {
			$('#incluir_MenuAbrir').css('display','table');
			$('#incluir_PF').css('display','table');
			//$('#incluir_PJ').css('display','none');
			$('#incluir_PFPJ').css('display','table');
			$('#abreGoogle').css('display','table');
		} else { //(node.data.tipo == TEL ou END
			$('#incluir_MenuAbrir').css('display','none');
			$('#incluir_PF').css('display','none');
			//$('#incluir_PJ').css('display','none');						
			$('#incluir_PFPJ').css('display','none');
			$('#abreGoogle').css('display','none');
		}
		if (gHistoricoIdNosInseridos.length==0) {
			$('#incluir_removeUltimaInsercao').css('display','none');
		} else {
			$('#incluir_removeUltimaInsercao').css('display','table');
		}		
	}
}

function rotuloMenuContextual(node) {
	var t='';
	if (gIdNosSelecionados.length>1) {
		t = 'Expandir 1 Camada';
	} else if (node.data.label) {
		if (node.data.label.length>30) {
			t = node.data.label.substring(0,30)+'...';
		} else {
			t= node.data.label;
		}
	} else if (node.data.id) {
		t = node.id.substring(0,30);	
	} else {
		t = 'Sistema Macros';
	}
	return t;
}

function situacaoCadastral(tipo,situacao) { 
	var textoSituacao='';
	if (tipo=="PF") {
		textoSituacao = situacaoCPF[situacao];
	} else if ((tipo=='PJ') ||(tipo=='ES')) {
		textoSituacao = situacaoCNPJ[situacao];
	}
	return textoSituacao;
}

function textoTooltip(node, todoTexto){ // se todoTexto=false, exibe apenas dados dos marcadores
	var LF = String.fromCharCode(10);
	var texto = '';
	var linhaTexto1='', linhaTexto2='';
	if (todoTexto) {
		if (node.data.tipo == 'END') {
			linhaTexto1 = node.id.split('__')[0];
			linhaTexto2 = node.id.split('__')[1];
			texto = 'Endereço' + LF + linhaTexto2 + LF + linhaTexto1;
		} else if (node.data.tipo == 'TEL') {
			linhaTexto1 = node.id; //node.id.slice(4);	
			texto = 'Telefone' + LF + node.id; //node.id.slice(4);
		} else if (node.data.tipo == 'CC') {
			linhaTexto1 = node.id.split('-')[0] + '-' + node.id.split('-')[1];
			linhaTexto2	= node.id.split('-')[2]; //node.id.slice(4);	
			texto = 'Conta-Corrente' + LF + 'Banco: ' + node.id.split('-')[0] + LF + 'Agência: ' + node.id.split('-')[1] + LF + 'Conta: ' +  node.id.split('-')[2]; //node.id.slice(4);
		} else if (node.data.tipo == 'INF') {
			linhaTexto1 = node.id.split('-')[0] + '-' + node.id.split('-')[1];
			linhaTexto2	= node.id.split('-')[2]; //node.id.slice(4);	
			texto = 'Informação Relevante:\n' + node.data.label;
		} else if (node.data.tipo == 'ENT') { //entidade
			linhaTexto1 = node.id.split('-')[0] + '-' + node.id.split('-')[1];
			linhaTexto2	= node.id.split('-')[2]; //node.id.slice(4);	
			//texto = node.data.label;
			texto = node.data.texto_tooltip; 
		} else if (node.data.tipo == 'DOC') { //entidade
			texto = node.data.texto_tooltip; 
		} else if (node.data.tipo == 'IDE') { //entidade
			texto = node.data.texto_tooltip; 
		} else if (node.data.label.startsWith("Inexistente")) {
			texto='O cpf/cnpj ' + node.id + ' não foi localizado. Talvez o cpf/cnpj seja recente na base da SRF e não tenha sido indexado na rotina de relacionamentos, ou o cpf/cnpj foi informado incorretamente em alguma base de dados';
			linhaTexto1 = node.id;
			linhaTexto2 = 'Inexistente';
		} else { //PF, PJ e ES
			linhaTexto1 = formataCPFCNPJ(node.id);
			linhaTexto2 = node.data.label;
			texto = linhaTexto1 + ' (' + situacaoCadastral(node.data.tipo, node.data.situacao) + ')' + LF + linhaTexto2;
		} 	
	}
	if (todoTexto) {
		var cont= 0 + graph.getLinks(node.id).length;
		if (cont==1) {
			texto += LF + '-1 ligação';		
		} else if (cont>1) {
			texto += LF + '-' + cont + ' ligações';
		}
	}
	if (node.data.m10 == 1) {
		texto += LF + '-informação relevante';
	}	
	if (node.data.tipo == "PF") {
		if (node.data.m1 == 1) { //circulo verde, servidor público estadual ou municipal
			texto += LF + '-servidor estadual/municipal';
		}
		if (node.data.m1 == 2) { //quadrado verde, pessoa física possui cadastro no siape
			texto += LF + '-registro no SIAPE';
		}
	} 	else if (node.data.tipo == "PJ") {
		if (node.data.m1 == 1) { //circulo verde, servidor público estadual ou municipal
			texto += LF + '-empresa de servidor';
		}
		/*
		if (node.data.m1 == 2) { //quadrado verde, pessoa física possui cadastro no siape
			texto += LF + '-registro no SIAPE';
		}*/
	}

	if (node.data.m2 == 1) { //pessoa física tem salário base menor que 2 salários mínimos, pj com sócio baixa renda
		if (node.data.tipo == "PF") {
			texto += LF + '-salário < 2 mínimos';
		} else if (node.data.tipo == "PJ"){
			texto += LF + '-sócio c/ salário < 2 mínimos';
		}
	}
	/*
	if (node.data.m2 == 2) { //??
		texto += LF + '';
	} */
	if (todoTexto) {
		if ((node.data.m3 & 1) == 1) { //indica que a pf/pj recebeu ordem bancária do siafi
			texto += LF + '-recebeu OB/SIAFI';
		}
		if ((node.data.m3 & 2) ==2) { //indica que pf/pj teve pagamento entre top 100 de municipios
			texto += LF + '-recebeu de Prefeitura, entre 100 maiores pagamentos';
		}		
	}
	if (node.data.m4 == 1) { //pessoa física investigada em sindicância ou processo
		texto += LF + '-sindicância/processo';
	}
	if (node.data.m4 == 2) { //?
		texto += LF + '';
	}
	if (node.data.m5 == 1) { //circulo preto: pf=pessoa foi candidata, pj=pessoa jurídica possui de 1 a 3 funcionários(rais)						   	
		if (node.data.tipo=='PF') {
			texto += LF + '-foi candidata(o)';
		} else {
			texto += LF + '-funcionários(RAIS)<=3';
		}
	}
	if (node.data.m5 == 2) { //quadrado preto: pf=pessoa eleita, pj=pessoa jurídica não possui funcionários (rais)
		if (node.data.tipo=='PF') {
			texto += LF + '-eleita';
		} else {
			texto += LF + '-sem funcionários(RAIS)';
		}
	}
	if (node.data.m6 == 1) { //pf=cadastro no ceis/cepim/punidos, pj = ceis/cepim
		if (node.data.tipo=='PF') {
			texto += LF + '-CEIS/CEPIM/Punidos';
		} else {
			texto += LF + '-CEIS/CEPIM';
		}
	}
	if (node.data.m6 == 2) { //??
		//texto += LF + '';
	}
	if (node.data.m7 == 1) { //pf ou pj doadora de campanha
		texto += LF + '-doador(a) de campanha';
	}
	if (node.data.m7 == 2) { //?
		//texto += LF + '';
	}
	if (node.data.m8 == 1) { //pf consta do bolsa família, cad unico ou defeso pescador
		if (node.data.tipo=='PF') {
			texto += LF + '-cadastrado no bolsa família/cad unico/defeso';
		} else {
			texto += LF + '-sócio/responsável no bolsa família/cad unico/defeso';
		}
	}		
	if (node.data.m8 == 2) { //?
		//texto += LF + '';
	}
	if (node.data.m9 == 1) { //?
		if (node.data.tipo == "PJ"){
			texto += LF + '-sócio/responsável falecido';			
		}  else if (node.data.tipo == "PF"){
			texto += LF + '-falecido';
		}
	}
	return texto;
}

function corTextoLink(tipo) {
	s = {
	'100':'green',
	'101':'red',
	'102':'cyan',
	'103':'blue',
	'104':'red',
	'105':'red',
	'106':'black',
	'127':'brown',
	'305':'orange',
	'306':'orange',
	'150':'orange',
	'151':'orange',
	'155':'orange',
	'160':'mediumpurple',
	'161':'mediumpurple',
	'162':'mediumpurple' 
   };
	primeiroItem = tipo.split('_')[0];
	if (s[primeiroItem]){
		return s[primeiroItem];
	} else {
		return 'purple';
	}
}

function corTextoLinkF(tipoDescricao) {
	return retornaCorDoRelacionamentoF(tipoDescricao);
	s = {
	'100':'green',
	'101':'red',
	'102':'cyan',
	'103':'blue',
	'104':'red',
	'105':'red',
	'106':'black',
	'127':'brown',
	'305':'orange',
	'306':'orange',
	'150':'orange',
	'151':'orange',
	'155':'orange',
	'160':'mediumpurple',
	'161':'mediumpurple',
	'162':'mediumpurple' 
   };
	var tipo = Object.keys(tipoDescricao)[0];
	if (s[tipo]){
		return s[tipo];
	} else {
		return 'purple';
	}
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

function retornaCorDoRelacionamentoF(tipoDescricao) {
	var retorno = "Silver";
	var listaID = Object.keys(tipoDescricao);
	var primeiroID = listaID[0];
	if (( listaID.indexOf("101") > -1) ||  //responsavel
		( listaID.indexOf("104") > -1) ||  //representante
		( listaID.indexOf("105") > -1))	{  //procurador
		retorno = "DarkOrange";
	}else if (( listaID.indexOf("103") > -1) )	{ //socio
		retorno = "Blue";
	}else if (( listaID.indexOf("100") > -1) )	{ //filial
		retorno = "Olive";
	}else if (( listaID.indexOf("106") > -1) ||  //ex-socio, ex-empregado, ex-respoonsável tecnico
		( listaID.indexOf("128") > -1) ||
		( listaID.indexOf("301") > -1) ) {
		retorno = "Gray";
	}else if (( listaID.indexOf("401") > -1) ||
			( listaID.indexOf("402") > -1) ||
			( listaID.indexOf("403") > -1) ||
			( listaID.indexOf("404") > -1) ||
			( listaID.indexOf("405") > -1) ||
			( listaID.indexOf("406") > -1) ||
			( listaID.indexOf("407") > -1) ||
			( listaID.indexOf("408") > -1) ||
			( listaID.indexOf("409") > -1) ||
			( listaID.indexOf("410") > -1) ||
			( listaID.indexOf("411") > -1) ||
			( listaID.indexOf("412") > -1) ||
			( listaID.indexOf("160") > -1) || //dependente siape
			( listaID.indexOf("162") > -1) ||  //possivel_pai_siape
			( listaID.indexOf("161") > -1) ||  //possivel_mae_cpf			
			( listaID.indexOf("305") > -1) ||  //mae
			( listaID.indexOf("306") > -1))	{  //irmão			
		retorno = "Green";
	}else if ( listaID.indexOf("102") > -1)	{
		retorno = "Cyan";
	} else if ( listaID.indexOf("127") > -1){ //empregado
		retorno = "GoldenRod";
	} else if (primeiroID<100) {
		retorno = "mediumpurple";
	} else if ((primeiroID=='150') || 
			(primeiroID=='151') || 
			(primeiroID=='155') ) { 
		retorno = "Black";
	} else if ((primeiroID=='200') || 
			(primeiroID=='250')) {
		retorno = "DarkRed";
	} else if ((primeiroID=='421') ||((500<=primeiroID)&&(primeiroID<600))) {
		retorno = "Brown";
	}
	return retorno;
}

function corFundoImagemF(node) {
	var corFundoIcone;
	if (node.data.cor) { return node.data.cor; }
	corFundoIcone = (node.data.camada==0)?'Red':'White';
	return corFundoIcone;
}