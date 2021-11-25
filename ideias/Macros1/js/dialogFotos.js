dojo.require("dojox.form.Uploader");
dojo.require("dojo.io.iframe");
dojo.require("dojo.parser");
dojo.require("dojox.image.ThumbnailPicker");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.SimpleTextarea");


var Fotos = {};

// registro de fotos do cpf/cnpj
Fotos.fotos = {};


dojo.ready(function() {
    dojo.connect(dijit.byId('Fotos.uploaderFoto'), "onChange", function(dataArray){
	Fotos.onChangeUploader();
    });
});



Fotos.selecionaFoto = function(img) {
    var fotoanterior = dojo.query('.fotoselecionada');
    var form = document.formFotos;
    var fotoid;

    for (var i=0; i < fotoanterior.length; i++) {
	fotoanterior[i].className = 'fotonaoselecionada';
    }

    img.className = 'fotoselecionada';
    fotoid = parseInt(img.name.substring(4));
    // dojo.byId('Fotos.imgFoto').src = img.src.substring(0, img.src.length-9);
    dojo.byId('Fotos.imgFoto').src = Fotos.fotos[fotoid].url;
    form.fotoid.value = fotoid;
    dijit.byId("Fotos.btnApagarFoto").setAttribute('disabled', false);
//    dijit.byId("Fotos.btnPerfil").setAttribute('disabled', false);
    dijit.byId("Fotos.txaDescricao").setAttribute('value', Fotos.fotos[fotoid].descricao); 
    dijit.byId("Fotos.cbPrincipal").setAttribute('checked', Fotos.fotos[fotoid].ehPrincipal);
    dijit.byId("Fotos.cbAssinatura").setAttribute('checked', Fotos.fotos[fotoid].ehAssinatura);
}


Fotos.atualizaForm = function(json, fotoid) {  

    var tabela = "";
    var opcoes = "";     
    var http;
    var form = document.formFotos;

    Fotos.fotos = {};

    /* thumbnails */
    imagens_html = '<table width="170px">';
    if (json.registros.length == 0) {
	imagens_html = imagens_html + "<tr><td>Nenhuma imagem cadastrada.</td></tr>";
	form.fotoid.value = '';
	dojo.byId('Fotos.imgFoto').src = '';
	dijit.byId("Fotos.btnApagarFoto").setAttribute('disabled', true);
	dijit.byId("Fotos.btnSalvarFoto").setAttribute('disabled', true);
	dijit.byId("Fotos.txaDescricao").setAttribute('value', '');
	dijit.byId("Fotos.txaDescricao").setAttribute('disabled', true);
	dijit.byId("Fotos.cbPrincipal").setAttribute('checked', false);
	dijit.byId("Fotos.cbPrincipal").setAttribute('disabled', true);
	dijit.byId("Fotos.cbAssinatura").setAttribute('checked', false);
	dijit.byId("Fotos.cbAssinatura").setAttribute('disabled', true);

    } else {	
	for (var i in json.registros) {

	    if ( ( (fotoid != '')&&(json.registros[i].id == fotoid) ) || ((fotoid == '') && (i == 0)) ) {

		classe = 'fotoselecionada';
		form.fotoid.value = json.registros[i].id;
		dojo.byId('Fotos.imgFoto').src = json.registros[i].url;
		dijit.byId("Fotos.txaDescricao").setAttribute('value', json.registros[i].descricao);
		dijit.byId("Fotos.cbPrincipal").setAttribute('checked', json.registros[i].ehPrincipal);
		dijit.byId("Fotos.cbAssinatura").setAttribute('checked', json.registros[i].ehAssinatura);
	    } else {
		classe = 'fotonaoselecionada';
	    }

	    imagens_html = imagens_html + "<tr><td><img class='" + classe + "' name='foto" + json.registros[i].id + "' src='" + json.registros[i].url + "/thumbnail' title='" + json.registros[i].descricao.replace("'", "").replace("\\","") + "' onClick='javascript:Fotos.selecionaFoto(this);'/></td></tr>";

	    // guarda os dados em array	    
	    Fotos.fotos[json.registros[i].id] = {}
	    Fotos.fotos[json.registros[i].id]['descricao'] = json.registros[i].descricao;
	    Fotos.fotos[json.registros[i].id]['ehPrincipal'] = json.registros[i].ehPrincipal;
	    Fotos.fotos[json.registros[i].id]['url'] = json.registros[i].url;
	    Fotos.fotos[json.registros[i].id]['ehAssinatura'] = json.registros[i].ehAssinatura;
	}	
	dijit.byId("Fotos.btnApagarFoto").setAttribute('disabled', false);
	dijit.byId("Fotos.btnSalvarFoto").setAttribute('disabled', false);
	dijit.byId("Fotos.txaDescricao").setAttribute('disabled', false);
	dijit.byId("Fotos.cbPrincipal").setAttribute('disabled', false);
	dijit.byId("Fotos.cbAssinatura").setAttribute('disabled', false);

    }
    imagens_html = imagens_html + '</table>';
    dojo.byId("divFotosLista").innerHTML = imagens_html;

}


Fotos.salvar = function(acao) {

    var args;
    var aleatorio = Math.random();
    var form = document.formFotos;

    mostrarStandby('Fotos.dialog');     
    form.csrfmiddlewaretoken.value = dojo.cookie("csrftoken");
    form.acao.value = acao;

    args = {
	headers: { "X-CSRFToken": dojo.cookie("csrftoken") },
	form: dojo.byId("formFotos"),
	method: "POST",
	handleAs: "json",
        load: function(result) { 
	    if (result.sucesso) {    
		Fotos.alterada = true;
	    } 
	    if (result.mensagem.length > 0) {
		alert(result.mensagem);           
	    }

	    if (acao == 'editar') {
		Fotos.atualizaForm(result, parseInt(form.fotoid.value));
	    } else {
		Fotos.atualizaForm(result, '');
	    }
	    //dojo.byId('Fotos.imgFoto').src = '/macros/pf/foto/' + Imagens.identificador + '/?foo=' + aleatorio;
	    //dojo.byId('Imagens.imgAssinatura').src = '/macros/pf/assinatura/' + Imagens.identificador + '/?foo=' + aleatorio;
        },
        error: function(error) {
	    alert('Erro: ' + error);
        },
        handle: function(res, ioargs) {
	    dijit.byId('Fotos.uploaderFoto').reset();
//	    dijit.byId('Imagens.uploaderAssinatura').reset();
	    esconderStandby();
        }
    };
    dojo.io.iframe.send(args);
}    


Fotos.showDialog = function(identificador) {

    var form = document.formFotos;
    var tabAtual = Global.tabs.selectedChildWidget;
    var aleatorio = Math.random();
    
    identificador = identificador.replace(/[-\.\/ ]/g,'');

    Fotos.identificador = identificador;

    if (Global.dossie[tabAtual].tipo  == 'pf') {
	dojo.style('Fotos.span_assinatura', 'visibility', 'visible');
    } else {
	dojo.style('Fotos.span_assinatura', 'visibility', 'hidden');
    }

    Fotos.alterada = false;
    
    form.action = '/macros/fotos/' + identificador + '/';

    mostrarStandby('Fotos.dialog');

    var xhrArgs = {
        url: '/macros/fotos/' + identificador + '/?aleatorio=' + aleatorio,
        headers: { "X-CSRFToken": dojo.cookie("csrftoken")},
        handleAs: "json",
        preventCache: true,
        load: function(result) {
            Fotos.atualizaForm(result, '');
        },
        error: function(error) {
            alert(error);          
        },
        handle: function(res, ioargs) {
            esconderStandby();
        }
    };
    dojo.xhrGet(xhrArgs);    

    dijit.byId('Fotos.dialog').show();

}  

Fotos.onHide = function() {

  var tipo = Global.dossie[Global.tabs.selectedChildWidget].tipo;
  
  if (Fotos.alterada) {
    identificador = Fotos.identificador;
    aleatorio = Math.random();
    // atualizar a imagem 
    
    if (tipo == 'pf' || tipo == 'pj') {
      imgs = dojo.query('[name="img_principal_' + identificador + '"]');
      for(var x = 0; x < imgs.length; x++){
        imgs[x].src = '/macros/verfoto/' + identificador + '/principal/?foo=' + aleatorio;
      }
      if (tipo == 'pf') {      
        imgs = dojo.query('[name="img_assinatura_' + identificador + '"]');
        for(var x = 0; x < imgs.length; x++){
          imgs[x].src = '/macros/verassinatura/' + identificador + '/principal/?foo=' + aleatorio;
        }
      } 
    }
  }

}  

Fotos.onChangeUploader = function() {
    var uploader = dijit.byId('Fotos.uploaderFoto');

/*
    if (campo == 'foto') {
	uploader = dijit.byId('Imagens.uploaderFoto');
    } else {
	uploader = dijit.byId('Imagens.uploaderAssinatura');
    }
*/

    if (uploader.getFileList().length == 0) {
	alert('Selecione uma imagem.');	
    } else {
	arquivo = uploader.getFileList()[0];
	if (arquivo.type != 'image/jpeg') {
	    alert('A imagem deve estar no formato JPEG (extensão .jpg).');
	    uploader.reset();
	} else {
	    document.formFotos.fotoid.value = '';
	    dijit.byId("Fotos.txaDescricao").setAttribute('value', ''); 
	    dijit.byId("Fotos.cbPrincipal").setAttribute('checked', false);
	    dijit.byId("Fotos.cbAssinatura").setAttribute('checked', false);	    
	    Fotos.salvar('incluir');
	}
    }	
}


Fotos.apagar = function() {
    var form = document.formFotos;
    if (form.fotoid.value == '') {
	alert('É necessário selecionar uma imagem.');
	return;
    }
    Fotos.salvar('apagar');
}




