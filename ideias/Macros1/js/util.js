

var Util = {};

/*
 * referência http://codigofonte.uol.com.br/codigo/js-dhtml/strings/funcao-trim-no-javascript
 */
Util.trim = function(str) {
  return str.replace(/^\s+|\s+$/g,"");
}

/* 
 * referência: http://battisti.wordpress.com/2007/03/08/arredondar-formatando-e-desformatando-valores-em-javascript/ 
 */
Util.float2moeda = function(num) {

  var x = 0;
  var ret;

  if(num < 0) {
     num = Math.abs(num);
     x = 1;
  }

  if(isNaN(num)) {
    num = "0";
  }

  cents = Math.floor((num*100+0.5)%100);
  if(cents < 10) { 
    cents = "0" + cents;
  }

  num = Math.floor((num*100+0.5)/100).toString();

  for (var i = 0; i < Math.floor((num.length-(1+i))/3); i++) {
    num = num.substring(0,num.length-(4*i+3))+'.'+num.substring(num.length-(4*i+3));
  }

  ret = num + ',' + cents;
  if (x == 1) { 
    ret = ' - ' + ret;
  }
  return ret;
}

/*
 * referência: http://www.pcforum.com.br/cgi/yabb/YaBB.cgi?board=cgi;action=display;num=1090001360
 */
Util.valida_cpf = function(cpf)
{
  var numeros, digitos, soma, i, resultado, digitos_iguais;
  digitos_iguais = 1;
  if (cpf.length < 11) {
    return false;
  } 
  
  for (i = 0; i < cpf.length - 1; i++) {
    if (cpf.charAt(i) != cpf.charAt(i + 1)) {
      digitos_iguais = 0;
      break;
    }
  }

  if (!digitos_iguais) {
    numeros = cpf.substring(0,9);
    digitos = cpf.substring(9);
    soma = 0;
    for (i = 10; i > 1; i--) {
      soma += numeros.charAt(10 - i) * i;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) {
      return false;
    }
    
    numeros = cpf.substring(0,10);
    soma = 0;    
    for (i = 11; i > 1; i--) {
      soma += numeros.charAt(11 - i) * i;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) {
      return false;
    }

    return true;
  } else { 
    return false;
  } 
}

/*
 * referência: http://www.pcforum.com.br/cgi/yabb/YaBB.cgi?board=cgi;action=display;num=1090001360
 */
Util.valida_cnpj = function(cnpj)
{
  var numeros, digitos, soma, i, resultado, pos, tamanho, digitos_iguais;
  digitos_iguais = 1;
  if (cnpj.length < 14) {
    return false;
  } 
  for (i = 0; i < cnpj.length - 1; i++) {  
    if (cnpj.charAt(i) != cnpj.charAt(i + 1)) {
      digitos_iguais = 0;
      break;
    }
  }
  
  if (!digitos_iguais) {
    tamanho = cnpj.length - 2
    numeros = cnpj.substring(0,tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) {
      return false;
    }
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0,tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) {
        pos = 9;
      }
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) {
      return false;
    }
    return true;
  } else {
    return false;
  }
} 

Util.validaNUP = function(nup)
{
  var stringDoNUP, dv, dv1, dv2, peso, soma, resto;

  stringDoNUP = nup.toString().replace(/[^\d]+/g,'');
  if(stringDoNUP.length != 17 || isNaN(stringDoNUP) || stringDoNUP < 0) {
    return false;
  } else {
    dv = stringDoNUP.substring(15,17);
    peso = 2;
    soma = 0;
    for (i = 14; i >= 0; i--) { 
      soma += parseInt(stringDoNUP[i], 10)*peso;
      peso++;
    }
    resto = soma % 11;
    if(resto == 0 || resto == 1) {
      dv1 = (1 - resto).toString();
    } else {
      dv1 = (11 - resto).toString();
    }
    if(dv1 != dv.substring(0, 1)) {
      return false;
    }
    peso = 2;
    soma = 0;
    stringDoNUP += dv1;
    for (i = 15; i >= 0; i--) { 
      soma += parseInt(stringDoNUP[i], 10)*peso;
      peso++;
    }
    resto = soma % 11;
    if(resto == 0 || resto == 1) {
      dv2 = (1 - resto).toString();
    } else {
      dv2 = (11 - resto).toString();
    }
    stringDoNUP += dv2;
    if(dv2 != dv.substring(1, 2)) {
      return false;
    }
    return true;
  }
}

//adiciona mascara ao NUP
Util.MascaraNUP = function(campo){
  var boleanoMascara;
  var Mascara = '00000.000000/0000-00';
  var Digitato = event.keyCode;
  var campoSoNumeros = campo.get('value').toString().replace(/[^\d]+/g, '');

  var posicaoCampo = 0;
  var NovoValorCampo="";
  var TamanhoMascara = campoSoNumeros.length;

  if (Digitato != 8) { // backspace
    for(i=0; i <= TamanhoMascara; i++) {
      boleanoMascara  = ((Mascara.charAt(i) == "-") || (Mascara.charAt(i) == ".") || (Mascara.charAt(i) == "/"));
      boleanoMascara  = boleanoMascara || ((Mascara.charAt(i) == "(") || (Mascara.charAt(i) == ")") || (Mascara.charAt(i) == " "));
      if (boleanoMascara) {
        NovoValorCampo += Mascara.charAt(i);
        TamanhoMascara++;
      } else {
        NovoValorCampo += campoSoNumeros.charAt(posicaoCampo);
        posicaoCampo++;
      }
    }
    campo.set('value', NovoValorCampo);
    return true; 
  } else { 
    return true; 
  }
}


/*
 * 
 */
Util.mostra_oculta_msg_erro = function(id) {
  if(document.getElementById(id).style.display == 'none'){
		document.getElementById(id).style.display = 'inline-block';
  } else {
		document.getElementById(id).style.display = 'none';
  }
};

/*
 * 
 */
Util.mostra_dados_grafico = function(id, exibir) {
  if (typeof exibir === 'undefined') { exibir = 0; };
//use myVariable here
  if(document.getElementById(id).style.display == 'none'){
	if (exibir != -1) {
		document.getElementById(id).style.display = 'inline';
		document.getElementById(id + 'Label').innerHTML = 'Ocultar dados do gráfico';
	}
  }
  else {
	if (exibir != 1) {
		document.getElementById(id).style.display = 'none';
		document.getElementById(id + 'Label').innerHTML = 'Exibir dados do gráfico';	  
	}
  }
};

Util.mostra_dados_todos_graficos = function(exibir)
{
	var lista=$("a[href^='javascript:Util.mostra_dados_grafico']");
	for (var tam=lista.length, i=0; i<tam; i++) {	
		var t = lista[i].href;
		if (exibir) {
			eval(t.substring(0,t.length-2) + "',1)");
		} else {
			eval(t.substring(0,t.length-2) + "',-1)");
		}
	}
};

/* //o dijit.Dialog tem o problema que se a sessão é desconectada, na janela de alerta o botão para fechar fica invisível
var alertaDojo = function(titulo,texto,tamanho) {
	var    myDialog = new dijit.Dialog({
        title: titulo,
        content: texto,
        style: "width: " + tamanho + "px"
		});
	myDialog.show();
} */

var ehCelular = function() {
	if (navigator.userAgent.search('Android') == -1 && navigator.userAgent.search('iPhone') == -1) {
		return false;
	} else {
		return true;
	}
};

var alerta = function(textoin) {
	texto = textoin;
	if ((texto.search('SyntaxError: expected expression, got') != -1)||(texto.search(":TypeError: result is null") != -1)) {
		texto = texto.replace(":SyntaxError: expected expression, got '<'", ".");
		texto = texto.replace(":TypeError: result is null", ".");
		if (texto.search('Talvez a sessão tenha se expirado.') == -1) {
			texto += '\nTalvez a sessão tenha se expirado.';
		}
	}
	if (ehCelular()) {
		alert(texto);
	} else {
		try {
			jAlert(texto,'Sistema Macros');
		} catch(err) {
			alert(texto);
		}
	}
};

