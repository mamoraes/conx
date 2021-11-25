dojo.require("dojox.form.Uploader");
dojo.require("dojo.io.iframe");

Imagens = {}

dojo.ready(function() {
    dojo.connect(dijit.byId('Imagens.uploaderFoto'), "onChange", function(dataArray){
	Imagens.onChange('foto');
    });
    dojo.connect(dijit.byId('Imagens.uploaderAssinatura'), "onChange", function(dataArray){
	Imagens.onChange('assinatura');
    });

});


Imagens.salvar = function() {

    var args;
    var aleatorio = Math.random();


    mostrarStandby('Imagens.dialog');     
    document.formImagens.csrfmiddlewaretoken.value = dojo.cookie("csrftoken");

    args = {
	headers: { "X-CSRFToken": dojo.cookie("csrftoken")},
	form: dojo.byId("formImagens"),
	method: "POST",
	handleAs: "json",
        load: function(result) { 
	    if (result.sucesso) {    
		Imagens.alterada = true;
	    } 
	    if (result.mensagem.length > 0) {
		alert(result.mensagem);           
	    }
	    dojo.byId('Imagens.imgFoto').src = '/macros/pf/foto/' + Imagens.identificador + '/?foo=' + aleatorio;
	    dojo.byId('Imagens.imgAssinatura').src = '/macros/pf/assinatura/' + Imagens.identificador + '/?foo=' + aleatorio;
        },
        error: function(error) {
	    alert('Erro: ' + error);
        },
        handle: function(res, ioargs) {
	    dijit.byId('Imagens.uploaderFoto').reset();
	    dijit.byId('Imagens.uploaderAssinatura').reset();
	    esconderStandby();
        }
    };
    dojo.io.iframe.send(args);
}    


Imagens.showDialog = function() {

    var form = document.formImagens;
    var tabAtual = Global.tabs.selectedChildWidget;
    var identificador = Global.dossie[tabAtual].identificador;
    var aleatorio = Math.random();

    Imagens.identificador = identificador;

    Imagens.alterada = false;
    
    form.action = '/macros/pf/foto/' + identificador + '/';

    dojo.byId('Imagens.imgFoto').src = '/macros/pf/foto/' + identificador + '/?foo=' + aleatorio;
    dojo.byId('Imagens.imgAssinatura').src = '/macros/pf/assinatura/' + identificador + '/?foo=' + aleatorio;

    dijit.byId('Imagens.dialog').show();

}  

Imagens.onHide = function() {

    if (Imagens.alterada) {
	numero = Global.dossie[Global.tabs.selectedChildWidget].numero;
	aleatorio = Math.random();
	/* os comandos abaixo para atualizar a imagem depende da ordem das imagens retornadas pelo cpf */
	dojo.query('#div_cpf_' + numero + ' img')[0].src = '/macros/pf/foto/' + Imagens.identificador + '/?foo=' + aleatorio;
	dojo.query('#div_cpf_' + numero + ' img')[1].src = '/macros/pf/assinatura/' + Imagens.identificador + '/?foo=' + aleatorio;
    }

}  

Imagens.onChange = function(campo) {
    var uploader;

    if (campo == 'foto') {
	uploader = dijit.byId('Imagens.uploaderFoto');
    } else {
	uploader = dijit.byId('Imagens.uploaderAssinatura');
    }

    if (uploader.getFileList().length == 0) {
	alert('Selecione uma imagem.');	
    } else {
	arquivo = uploader.getFileList()[0];
	if (arquivo.type != 'image/jpeg') {
	    alert('A imagem deve estar no formato JPEG (extensão .jpg).');
	    uploader.reset();
	} else if (arquivo.size > 51200) {
	    alert('O arquivo deve ter no máximo 50 KB.');
	    uploader.reset();
	} else {
	    document.formImagens.acao.value = 'alterar';	    
	    Imagens.salvar();
	}
    }	
}


Imagens.apagar = function(acao) {
    var form = document.formImagens;
    form.acao.value = acao;
    Imagens.salvar();
}




