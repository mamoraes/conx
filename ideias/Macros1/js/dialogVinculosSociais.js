dojo.require('dojo.store.Memory');
dojo.require('dijit.form.ComboBox');

var VinculoSocial = {}
VinculoSocial.dados = []
VinculoSocial.store = new dojo.store.Memory({data: []});

// indica se o cpf informado pelo usuário no form foi validado
VinculoSocial.cpf_cnpj_valido = false; 

VinculoSocial.showDialog = function(identificador) {

    var form = document.formVinculosSociais;
    var tabAtual = Global.tabs.selectedChildWidget;
    var aleatorio = Math.random();

    identificador = identificador.replace(/[-\.\/ ]/g,'');
    dijit.byId('VincSociais.dialog').show();
//    dojo.style('VincSociais.dialog', 'top', '10%');

    mostrarStandby('VincSociais.dialog');

    VinculoSocial.identificador = identificador;
    
    form.action = '/macros/vinculosocial/' + identificador + '/';    

    dojo.byId('VincSociais.tdCPF2').innerHTML = 'CPF/CNPJ: ' + identificador;
    dojo.byId('VincSociais.tdCPF3').innerHTML = 'CPF/CNPJ: ' + identificador;
    dojo.byId('VincSociais.img2').src = '/macros/verfoto/' + identificador + '/principal/thumbnail?foo=' + aleatorio;
    dojo.byId('VincSociais.img3').src = '/macros/verfoto/' + identificador + '/principal/thumbnail?foo=' + aleatorio;

    xhrArgs = {
        url: '/macros/vinculosocial/' + identificador + '/',
        headers: { "X-CSRFToken": dojo.cookie("csrftoken")},
        handleAs: "json",
        preventCache: true,
        load: function(result) {
	    dojo.byId('VincSociais.tdNome2').innerHTML = result.nome;
	    dojo.byId('VincSociais.tdNome3').innerHTML = result.nome;
            VinculoSocial.atualizaForm(result);	    
            VinculoSocial.novo();
        },
        error: function(error) {
            alert(error);          
        },
        handle: function(res, ioargs) {
            esconderStandby();
        }
    };
    dojo.xhrGet(xhrArgs);    
}


VinculoSocial.atualizaForm = function(json) {  

    var opcoes = "";     
    var tabela = "";
    var cpf_cnpj = "";
    var nome = "";    
    var tipo;
    var dados;
    var identificador;
    
    /* atualiza tabela de perfis cadastrados */
    if (json.registros.length == 0) {
	tabela = "<tr><td colspan='2' align='center'>Nenhum vínculo cadastrado.</td></tr>";

    } else {       
	VinculoSocial.dados = json.registros.slice();
	dados = VinculoSocial.dados;
	identificador = VinculoSocial.identificador;

	for (var i=0; i< dados.length; i++) {
	    
	    /* coloca sempre o perfil atual como segunda pessoa */
	    if (dados[i].cpf_cnpj_1 == identificador) {
		cpf_cnpj = dados[i].cpf_cnpj_1;
		nome = dados[i].nome_1;
		tipo = dados[i].tipo_12_nome;

		dados[i].cpf_cnpj_1 = dados[i].cpf_cnpj_2;
		dados[i].nome_1 = dados[i].nome_2;
		dados[i].tipo_12_nome = dados[i].tipo_21_nome;

		dados[i].cpf_cnpj_2 = cpf_cnpj;
		dados[i].nome_2 = nome;
		dados[i].tipo_21_nome = tipo;
	    }

	    if (dados[i].atual) {
		atual = "é";
	    } else {
		atual = "foi";
	    }
		
            tabela = tabela + "<tr ><td align='center'><a href=\"javascript:VinculoSocial.editar(" + i 
		+");\">" + json.registros[i].id + "</a></td><td>" + 
		dados[i].nome_1 + " (" + dados[i].cpf_cnpj_1 +") <b>" + atual + " " + dados[i].tipo_12_nome + "</b> de " + 
		dados[i].nome_2 + " (" + dados[i].cpf_cnpj_2 +")<br/>" + 
		dados[i].nome_2 + " (" + dados[i].cpf_cnpj_2 +") <b>" + atual + " " + dados[i].tipo_21_nome + "</b> de " + 
		dados[i].nome_1 + " (" + dados[i].cpf_cnpj_1 +")</td></tr>";
	}
    }
    dojo.byId("VincSociais.tbody").innerHTML = tabela;
    
    /* atualiza combobox de tipos de vinculos */
    opcoes = [];
    for (i in json.vinculos) {       
	opcoes.push({ nome: json.vinculos[i].nome , id: json.vinculos[i].id });
    }     
    dijit.byId('VincSociais.cbTipo_12').store.data = opcoes;    
                
}




VinculoSocial.validaCPF = function() {

    var xhrArgs;
    var form = document.formVinculosSociais;
    var cpf = form.cpf_cnpj_1.value.replace(/[ -\.\/]/g,'');
    var aleatorio;
    var url;
    var nome;

    if (!cpf.match(/^[0-9]{11}|[0-9]{14}$/)) {
	alert('CPF deve ter 11 dígitos.');

    } else {
	if (cpf == VinculoSocial.identificador) {
	    alert('Não é possível incluir um vínculo para uma pessoa com ela mesma!');
	} else {
	    mostrarStandby('VincSociais.dialog');   

	    if (cpf.length == 11) {
		url = '/macros/pf/macro_cpf/' + cpf + '/json';
	    } else {
		url = '/macros/pj/macro_cnpj/' + cpf + '/json';
	    }
    
	    xhrArgs = {
		url: url,
		headers: { "Accept": "application/json"},
		handleAs: "json",
		load: function(result) {
		    if (result) {				
			VinculoSocial.cpf_cnpj_valido = true;
			if (cpf.length == 11) {
			    nome = result.nome;			    
			} else {
			    nome = result.razaoSocial;
			}
			dojo.byId('VincSociais.tdNome1').innerHTML = nome;
			dojo.byId('VincSociais.tdNome4').innerHTML = nome;
			aleatorio = Math.random();
			dojo.byId('VincSociais.img1').src = '/macros/verfoto/' + cpf + '/principal/thumbnail?foo=' + aleatorio;
			dojo.byId('VincSociais.img4').src = '/macros/verfoto/' + cpf + '/principal/thumbnail?foo=' + aleatorio;
			dojo.byId('VincSociais.tdCPF4').innerHTML = cpf;
			dijit.byId('VincSociais.cpf_cnpj_1').set('value', cpf);
			dijit.byId('VincSociais.cpf_cnpj_1').set('disabled', true);
			dijit.byId('VincSociais.btnValidaCPF').set('label', 'Alterar');
			dijit.byId('VincSociais.btnValidaCPF').set('onClick', VinculoSocial.alteraCPF);
			dijit.byId('VincSociais.selAtual').set('disabled', false);    
			dijit.byId('VincSociais.cbTipo_12').set('disabled', false);    
			dijit.byId('VincSociais.cbTipo_21').set('disabled', false);    
			dijit.byId('VincSociais.btnSalvar').set('disabled', false);		    
			dijit.byId('VincSociais.txtDetalhes').set('disabled', false);    
		    } else {
			alert('CPF/CNPJ inexistente!');
		    }
		},
		error: function(error) {
		    alert(error);          
		},
		handle: function(res, ioargs) {
		    esconderStandby();
		}
	    };
	    dojo.xhrGet(xhrArgs);    
	}
    }

}


VinculoSocial.onChangeAtual = function(ev) {
    var selAtual = dijit.byId('VincSociais.selAtual');
    var valor = selAtual.get('value');
    var opcoes = selAtual.get('options');
    var label = "";

    for (var opcao in opcoes) {
	if (opcoes[opcao].value == valor) {
	    label = opcoes[opcao].label;
	    break;
	}
    }
    dojo.byId('VincSociais.atual_21').innerHTML = label;
}

VinculoSocial.alteraCPF = function() {

    var xhrArgs;
    var form = document.formVinculosSociais;

    dojo.byId('VincSociais.tdNome1').innerHTML = '';
    dojo.byId('VincSociais.tdNome4').innerHTML = '';
    dojo.byId('VincSociais.tdCPF4').innerHTML = '';
    dijit.byId('VincSociais.cpf_cnpj_1').set('disabled', false);
    dijit.byId('VincSociais.btnValidaCPF').set('label', 'Ok');
    dijit.byId('VincSociais.btnValidaCPF').set('onClick', VinculoSocial.validaCPF);
    dijit.byId('VincSociais.selAtual').set('disabled', true);    
    dijit.byId('VincSociais.cbTipo_12').set('disabled', true);    
    dijit.byId('VincSociais.cbTipo_21').set('disabled', true);    
    dijit.byId('VincSociais.btnSalvar').set('disabled', true);		    
    dijit.byId('VincSociais.btnApagar').set('disabled', true);	
    dijit.byId('VincSociais.txtDetalhes').set('disabled', true);    
    VinculoSocial.cpf_cnpj_valido = false;	    
}


VinculoSocial.novo = function() {
    var form = document.formVinculosSociais;

    form.acao.value = 'novo';
    form.vinculo_id.value = '';
    form.cpf_cnpj_1.value = '';
    VinculoSocial.cpf_cnpj_valido = false;

    dijit.byId('VincSociais.selAtual').set('value', '1');    
    dijit.byId('VincSociais.selAtual').set('disabled', true);    
    dijit.byId('VincSociais.txtDetalhes').set('disabled', true);    
    dijit.byId('VincSociais.txtDetalhes').set('value', '');    
    dijit.byId('VincSociais.cbTipo_12').set('value', '');    
    dijit.byId('VincSociais.cbTipo_12').set('disabled', true);    
    dijit.byId('VincSociais.cbTipo_21').set('value', '');    
    dijit.byId('VincSociais.cbTipo_21').set('disabled', true);    
    
    dijit.byId('VincSociais.btnApagar').set('disabled', true);
    dijit.byId('VincSociais.btnSalvar').set('disabled', true);
    dijit.byId('VincSociais.btnValidaCPF').set('label', 'Ok');
    dijit.byId('VincSociais.btnValidaCPF').set('onClick', VinculoSocial.validaCPF);

    dojo.byId('VincSociais.tdNome1').innerHTML = '';
    dojo.byId('VincSociais.tdNome4').innerHTML = '';
    dojo.byId('VincSociais.img1').src = '';
    dojo.byId('VincSociais.img4').src = '';
    dojo.byId('VincSociais.tdCPF4').innerHTML = '';
    dijit.byId('VincSociais.cpf_cnpj_1').set('value', '');
    dijit.byId('VincSociais.cpf_cnpj_1').set('disabled', false);
}



VinculoSocial.editar = function(indice) {

    var form = document.formVinculosSociais;
    var aleatorio;
    
    form.acao.value = 'editar';

    form.vinculo_id.value = VinculoSocial.dados[indice].id;

    dijit.byId('VincSociais.cpf_cnpj_1').set('value', VinculoSocial.dados[indice].cpf_cnpj_1);
    dijit.byId('VincSociais.cpf_cnpj_1').set('disabled', true);
    VinculoSocial.cpf_cnpj_valido = true;

    if (VinculoSocial.dados[indice].atual) {
	dijit.byId('VincSociais.selAtual').set('value', '1');    
    } else {
	dijit.byId('VincSociais.selAtual').set('value', '0');    
    }
    dijit.byId('VincSociais.selAtual').set('disabled', false);    

    dijit.byId('VincSociais.txtDetalhes').set('value', VinculoSocial.dados[indice].detalhes);    
    dijit.byId('VincSociais.txtDetalhes').set('disabled', false);    
    dijit.byId('VincSociais.cbTipo_12').set('value', VinculoSocial.dados[indice].tipo_12_nome);    
    dijit.byId('VincSociais.cbTipo_12').set('disabled', false);    
    dijit.byId('VincSociais.cbTipo_21').set('value', VinculoSocial.dados[indice].tipo_21_nome);    
    dijit.byId('VincSociais.cbTipo_21').set('disabled', false);        
    dijit.byId('VincSociais.btnApagar').set('disabled', false);
    dijit.byId('VincSociais.btnSalvar').set('disabled', false);
    dijit.byId('VincSociais.btnValidaCPF').set('label', 'Alterar');
    dijit.byId('VincSociais.btnValidaCPF').set('onClick', VinculoSocial.alteraCPF);
    dojo.byId('VincSociais.tdNome1').innerHTML = VinculoSocial.dados[indice].nome_1;
    dojo.byId('VincSociais.tdNome4').innerHTML = VinculoSocial.dados[indice].nome_1;
    dojo.byId('VincSociais.tdCPF4').innerHTML = VinculoSocial.dados[indice].cpf_cnpj_1;
    aleatorio = Math.random();
    dojo.byId('VincSociais.img1').src = '/macros/verfoto/' + VinculoSocial.dados[indice].cpf_cnpj_1 + '/principal/thumbnail?foo=' + aleatorio;
    dojo.byId('VincSociais.img4').src = '/macros/verfoto/' + VinculoSocial.dados[indice].cpf_cnpj_1 + '/principal/thumbnail?foo=' + aleatorio;

}


VinculoSocial.formValido = function() {

    var form = document.formVinculosSociais;
    var acao = form.acao.value;
    var titulo;
    var sumario;
    var conteudo;

    if ((acao == 'editar') || (acao == 'novo')) {
	tipo_12 = dijit.byId('VincSociais.cbTipo_12').get('value').replace(/^\s+|\s+$/g,'');    
	if (tipo_12.length == 0) {
	    alert('É necessário informar o tipo de vínculo.');
	    dijit.byId('VincSociais.cbTipo_12').focus();
	    return false;
	}
	
	tipo_21 = dijit.byId('VincSociais.cbTipo_21').get('value').replace(/^\s+|\s+$/g,'');    
	if (tipo_21.length == 0) {
	    alert('É necessário informar o tipo de vínculo inverso.');
	    dijit.byId('VincSociais.cbTipo_21').focus();
	    return false;
	}

	detalhes = dijit.byId('VincSociais.txtDetalhes').get('value').replace(/^\s+|\s+$/g,'');
	if (detalhes.length == 0) {
	    alert('É necessário informar a Fonte da Informação / Detalhes.');
	    dijit.byId('VincSociais.txtDetalhes').focus();
	    return false;
	}

    }
 
    return true;
}

VinculoSocial.salvar = function() {

    var form;
    var xhrArgs;

    if (VinculoSocial.formValido()) { 
	mostrarStandby('VincSociais.dialog');     

	form = document.formVinculosSociais;   
	form.vinculo_id.disabled=false;
	form.cpf_cnpj_1.disabled=false;
	
	xhrArgs = {
	    headers: { "X-CSRFToken": dojo.cookie("csrftoken")},
	    form: form,
	    handleAs: "json",
            load: function(result) { 
		if (result.sucesso) {    
		    VinculoSocial.atualizaForm(result);
		    VinculoSocial.novo();    
		    if (result.mensagem.length > 0) {
			alert(result.mensagem);           
		    }
		} else {
		    alert(result.mensagem);
		}
            },
            error: function(error) {
		alert('Erro: ' + error);
            },
            handle: function(res, ioargs) {
		esconderStandby();
            }
	};
	dojo.xhrPost(xhrArgs);
	form.vinculo_id.disabled=true;
	form.cpf_cnpj_1.disabled=true;
    }
}    



VinculoSocial.apagar = function() {
    var form = document.formVinculosSociais;
    form.acao.value = 'apagar';
    VinculoSocial.salvar();
}






