
Grafo = {}

Grafo.formValido = function() {
  var form = document.formGrafo;
  var c = 0;
  
  dojo.query('#tcGrafo .cbg').map(dijit.byNode).forEach(function(cb) {
    if (cb.get('checked')) c++; 
  });
  if (c == 0) {
    alert('Selecione pelo menos um tipo de vínculo.');
    return false;
  }
      
  return true;
}

Grafo.salvar = function() {
  var form;
  var xhrArgs;

  if (Grafo.formValido()) { 
    mostrarStandby('dialogGrafo');     

    var camadas = dojo.dijit.byId('camadasid').get('value');
    var ligacoes_tipo = [];
    dojo.query('#tcGrafo .cbg').map(dijit.byNode).forEach(function(cb) {
      if (cb.get('checked')) {
        ligacoes_tipo.push(cb.id.substr(4,6));
      }
    });
	var lista_exclusao = document.getElementById('lista_exclusaoid').value;

    xhrArgs = {
      url: '/macros/configGrafo',
      headers: { "X-CSRFToken": dojo.cookie("csrftoken")},
      content: {'camadas':camadas, 'ligacoes_tipo':ligacoes_tipo, 'lista_exclusao':lista_exclusao},
      handleAs: "json",
      load: function(result) { 
        dijit.byId('dialogGrafo').hide();
      },
      error: function(error) {
        alert('Erro: ' + error);
      },
      handle: function(res, ioargs) {
        esconderStandby();
      }
    };
    dojo.xhrPost(xhrArgs);
  }
}    


Grafo.showDialog = function() {
  var form = document.formGrafo;

  var tabAtual = Global.tabs.selectedChildWidget;
  var identificador = Global.dossie[tabAtual].identificador;
  var tipo = Global.dossie[tabAtual].tipo;
  var urlc = '/macros/configGrafo';
  if (tipo == 'cs') {
    urlc += '/cs/'+identificador;
  }
  
  dijit.byId('dialogGrafo').show();
  dojo.style('dialogGrafo', 'top', '10%');

  mostrarStandby('dialogGrafo');

  var xhrArgs = {
    url: urlc,
    headers: { "X-CSRFToken": dojo.cookie("csrftoken")},
    handleAs: "json",
    preventCache: true,
    
    load: function(result) {
      Grafo.atualizaForm(result);
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

Grafo.selecionarTodos = function() {
  dojo.query('#tcGrafo .cbg').map(dijit.byNode).forEach(function(cb) {
    cb.set('checked', true); 
  });
}

Grafo.limpar = function() {
  dojo.query('#tcGrafo .cbg').map(dijit.byNode).forEach(function(cb) {
    cb.set('checked', false); 
  });
}

Grafo.atualizaForm = function(json) {  
  var camadas = json.config.camadas;  
  var lista_exclusao = json.config.lista_exclusao;
  var ligacoes_tipo = json.config.ligacoes_tipo;
  
  dojo.dijit.byId('camadasid').set('value', camadas); 
  if (!lista_exclusao) {
	lista_exclusao = '';
  }
  document.getElementById('lista_exclusaoid').value = lista_exclusao;
  
  dojo.query('#tcGrafo .cbg').map(dijit.byNode).forEach(function(cb) {
    cb.set('checked', false); 
  });
  for (var i=0; i<ligacoes_tipo.length; i++) {
    dojo.dijit.byId('cbg_'+ligacoes_tipo[i]).set('checked', true);
  }
}
