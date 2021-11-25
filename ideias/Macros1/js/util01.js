

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

Util.anoMes = function(anomes) {

	var months = ["","Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", 
	                "Out", "Nov", "Dec"];	
	    var ano = anomes.toString().substr(0,4);
	    var mes = parseInt(anomes.toString().substr(4,2));
	    if ((mes==1)|(mes==6){
	      return months[mes] + "/" + ano;
	    }else{
	      return mes.toString();
	    }
	  }
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
