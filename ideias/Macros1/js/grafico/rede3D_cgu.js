// visualização em 3D
// 
// novembro/2016 cgu/sp
// 20/10/2017 - rótulos

gRede.pesquisarPorCPFCNPJ = function () {
	var cpfcnpjBusca = prompt('Digite cpf/cnpj para pesquisar');
	var idEncontrado;
	for (var k=0, tam = gRede.nodes.length; k<tam; k++) {
		if (gRede.nodes[k].id.search(cpfcnpjBusca) != -1) {
			idEncontrado = gRede.nodes[k].id;
			break;
		}
	}
	if (idEncontrado) {
		gRede.renderGraph.showNode(idEncontrado,30);
	} else {
		alert('Não foi encontrado ' + cpfcnpjBusca);
	}
	
};


gRede.pesquisarPorNome = function () {
	var nomeBusca = prompt('Digite o nome para pesquisar');
	var nomeBuscaMaiusculo = nomeBusca.toUpperCase();
	var idEncontrado;
	for (var k=0, tam = gRede.nodes.length; k<tam; k++) {
		if (gRede.nodes[k].nome.toUpperCase().search(nomeBuscaMaiusculo) != -1) {
			idEncontrado = gRede.nodes[k].id;
			break;
		}
	}
	if (idEncontrado) {
		gRede.renderGraph.showNode(idEncontrado,30);
	} else {
		alert('Não foi encontrado ' + nomeBusca);
	}
	
};

gRede.ativarPararLeiaute = function () {
	var ehEstavel = gRede.renderGraph.stable();
	gRede.renderGraph.stable(ehEstavel?0:1);
}


gRede.toggleRotulos = function () {
	gRede.bmostraRotulos = !gRede.bmostraRotulos;
    for (var i = 0; i < gRede.nodes.length; ++i) {
	  var label = gRede.rotulos[i];
	  if (label) {
		label.style.display = gRede.bmostraRotulos?'inline':'none';
		//if (!gRede.bmostraRotulos) {
		//	label.style.top = '-999em';
		//}
	  }
	}
};