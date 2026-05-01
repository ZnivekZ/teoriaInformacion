const { match } = require('assert');
const fs = require('fs');

var palabras = [];
var vecAppearance = {};
var vecAux = {};
var vecProbabilities = [];//respeta el orden de vecApperance
var longAlfabeto;

readArch();

function readArch(){
    const nombreArchivo = process.argv[2]; 
    console.log(`Archivo: ${nombreArchivo}`);
      
    fs.readFile(nombreArchivo, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error al leer el archivo: ${err}`);
        return;
      }

      palabras = data.split(/\s+/);
      listAtribute();
    }); 
    
}

function getProbabilities(){

    var aux;
    for (var i=0; i<palabras.length; i++){
        aux=palabras[i];

        if (vecAux[aux]){
            vecAux[aux]++;}
        else    {
            vecAux[aux]=1;}
        }
    
    vecAppearance = Object.entries(vecAux).map(([palabra, cantidad]) => ({ palabra, cantidad }));
    for (var i=0; i<vecAppearance.length; i++){
        vecProbabilities[i] = vecAppearance[i].cantidad / palabras.length;   } 

    longAlfabeto = new Set();
    for (var i = 0; i < vecAppearance.length; i++) {
        var word = vecAppearance[i].palabra;

      for (var j = 0; j < word.length; j++) {
         longAlfabeto.add(word[j]);
        }
      }        
}


function getEntropia(){
  var tot=0;
    for (var i=0; i<vecProbabilities.length; i++){
      tot+=vecProbabilities[i]* (Math.log10(1/vecProbabilities[i])/Math.log10(longAlfabeto.size));
    }
    if (longAlfabeto.size == 1)
      tot = 0
  return tot;
}

function getLongMedia(){
    var tot=0;
    for (var i=0; i<vecAppearance.length; i++){
      tot+=vecAppearance[i].palabra.length*vecProbabilities[i];
    }
    return tot;
}

function ecKraftMCmillan(){
  var tot=0;
  for (var i=0; i<vecAppearance.length; i++){
    tot += Math.pow(longAlfabeto.size,(vecAppearance[i].palabra.length * -1));
  }
 return tot;
}

function getInstantaneo(){
 var bool = true;
 var mov1=0,mov2=0,aux=vecAppearance.length;
  while (mov1 < aux && bool == true){
    while (mov2 < aux && bool == true){
      if (mov1 != mov2){
        if (vecAppearance[mov1].palabra.startsWith(vecAppearance[mov2].palabra))
            {
              bool=false;}
        }
        mov2++;
      }
    mov2=0;
    mov1++;
  }
return bool;
}

function getCompact(){ 
  var val = true; 
  let cont=0;
  while (val == true && cont<=longAlfabeto.size){
    if (vecAppearance[cont].palabra.length > Math.ceil(Math.log10(1/vecProbabilities[cont])))
        val = false;      
    cont++;
  }
  return val;
}

function listAtribute(){
  getProbabilities();

  console.log('Palabras:')
  vecAppearance.forEach(function(code) {
    console.log(' ', code.palabra);
  });

  console.log("Alfabeto fuente:");
  longAlfabeto.forEach(function(letter) {
    console.log(' ', letter);
  });
  console.log();
  console.log("Entropia: " + getEntropia());
  console.log("Longitud Media: " + getLongMedia());

  if (ecKraftMCmillan() >= 1)
    console.log("Cumple con Kraft / McMillan ");
  else
    console.log("No cumple con Kraft / McMillan ");

  console.log("Instantaneo: " + getInstantaneo());
  console.log("Compacto: " + getCompact());
}