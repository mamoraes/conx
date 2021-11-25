
RedeSocial = {}

RedeSocial.formValido = function() {
    var form = document.formRedeSocial;
    var url = form.url.value.replace(/^\s+|\s+$/g,'');
    var rede_social = form.rede_social.value.replace(/^\s+|\s+$/g,'');
    var acao = form.acao.value;

    if ((acao == 'editar') || (acao == 'novo')) {
	if (url.length == 0) {
	    alert('É necessário informar o endereço (URL) do perfil da pessoa.');
	    form.url.focus();
	    return false;
	}
	if (rede_social.length == 0) {
	    alert('É necessário informar a qual rede social o perfil da pessoa pertence.');
	    form.rede_social.focus();
	    return false;
	}
    }
    
    return true;
}

RedeSocial.salvar = function() {

    var form;
    var xhrArgs;

    if (RedeSocial.formValido()) { 
	mostrarStandby('dialogRedesSociais');     

	form = document.formRedeSocial;   
	form.perfil_id.disabled=false;
	
	xhrArgs = {
	    headers: { "X-CSRFToken": dojo.cookie("csrftoken")},
	    form: dojo.byId("formRedeSocial"),
	    handleAs: "json",
            load: function(result) { 
		if (result.sucesso) {    
		    RedeSocial.atualizaForm(result);
		    RedeSocial.nova();    
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
	form.perfil_id.disabled=true;
    }
}    


RedeSocial.nova = function() {
    var form = document.formRedeSocial;
    form.perfil_id.value = '';
    form.acao.value = 'novo';
    form.url.value = '';
    dijit.byId('cbRedeSocial').set('value', '');
    dijit.byId('btnApagarPerfil').set('disabled', true);   
}


RedeSocial.showDialog = function(identificador) {

    var form = document.formRedeSocial;
    var tabAtual = Global.tabs.selectedChildWidget;
    
    identificador = identificador.replace(/[-\.\/ ]/g,'');    
    form.cpf_cnpj.value = identificador;      
    form.action = '/macros/redesocial/' + identificador + '/';

    dijit.byId('dialogRedesSociais').show();
    dojo.style('dialogRedesSociais', 'top', '10%');

    mostrarStandby('dialogRedesSociais');

    var xhrArgs = {
        url: '/macros/redesocial/' + identificador + '/',
        headers: { "X-CSRFToken": dojo.cookie("csrftoken")},
        handleAs: "json",
        preventCache: true,
        
        load: function(result) {
            RedeSocial.atualizaForm(result);
            RedeSocial.nova();
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


RedeSocial.editar = function(id, rede_social_nome, url) {
    var form = document.formRedeSocial;

    form.acao.value = 'editar';
    form.url.value = url;
    form.perfil_id.value = id;
    dijit.byId('cbRedeSocial').set('value', rede_social_nome);
    dijit.byId('btnApagarPerfil').set('disabled', false);
}

RedeSocial.apagar = function() {
    form = document.formRedeSocial;
    form.acao.value = 'apagar';
    RedeSocial.salvar();
}

RedeSocial.store = new dojo.store.Memory({data: []});

RedeSocial.atualizaForm = function(json) {  

    var tabela = "";
    var opcoes = "";     
    var http;
    
    /* atualiza tabela de perfis cadastrados */
    if (json.registros.length == 0) {
	tabela = "<tr><td colspan='3' align='center'>Nenhum perfil cadastrado.</td></tr>";
    } else {       
	for (var i in json.registros) {
	    if (json.registros[i].url.toLowerCase().substring(0, 4) == "http") {
		http = "";
	    } else {
		http = "http://";
	    }
		
            tabela = tabela + "<tr><td align='center'><a href=\"javascript:RedeSocial.editar(" + json.registros[i].id + ", '" + 
		json.registros[i].rede_social_nome + "', '" + json.registros[i].url + "');\">" + 
		json.registros[i].id + "</a></td><td>" + 
  		json.registros[i].rede_social_nome + "</td><td><a target='_blank' href='" + http + json.registros[i].url+"'>"+
		json.registros[i].url + "</a></td></tr>"
	}
    }
    dojo.byId("tbodyRedesSociais").innerHTML = tabela;
    
    /* atualiza combobox de tipos de redes sociais */
    opcoes = [];
    for (i in json.redes) {       
	opcoes.push({ name: json.redes[i].nome , id: json.redes[i].id.toString()});
    }     
    dijit.byId('cbRedeSocial').store.data = opcoes;    
}


