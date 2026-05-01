const { kMaxLength } = require('buffer');
const fs = require('fs');
const { totalmem } = require('os');
let matriz = [];//matriz del archivo de texto
let matrizCanal  =[];// matriz pasada por el canal
let matrizNM = [];//matriz aleatoria
let N = 0
let M = 0

let probInBOutA = [];
let probSubA= [];
let probSubB = [];
let infoSubA = [];
let infoSubB = [];
let infoInBOutA = [];
let probSucesos = [];
let probInAOutB = [];
let infoInAOutB = [];
let entropiaCondA = 0;
let entropiaCondB = 0;
let entropAlfaInA = [];
let entropAlfaInB = [];
let equivocAyB = 0;
let equivocByA = 0;
let infoMutuaAyB = 0;
let infoMutuaByA = 0;



    main()

async function main(){    
    N = parseInt(process.argv[3])    
    M = parseInt(process.argv[4])
    readArch()  
    getProbabilities() 
    generatMat()
    console.log("entropia de canal A "+entropiaCondA+" equivocacion A_B "+equivocAyB+" informacion mutua A_B"+infoMutuaAyB)
    console.log("entropia de canal B "+entropiaCondB+" equivocacion B_A "+equivocByA+" informacion mutua B_A"+infoMutuaByA)

    if (process.argv[5] == "-p") 
         {
         habPariedad()
         getMatrizCanal(N+1,M+1)
         correcParCruzada(matrizCanal,N,M)
        }
    else
        { getMatrizCanal(N,M)
}
    smsEstate(matrizNM,matrizCanal,N,M)
}


async function readArch(){
    const auxArchivoIn  = process.argv[2]
    const contenidoArchivo = fs.readFileSync(auxArchivoIn, 'utf-8');
    const filas = contenidoArchivo.split('\n');


    filas.forEach(fila => {
        const elementos = fila.split(/\s+/);
        // Filtra los elementos para eliminar los NaN
        const filaNumeros = elementos.map(elemento => parseFloat(elemento)).filter(numero => !isNaN(numero));
        // Agrega la fila solo si no está vacía después de filtrar los NaN
        if (filaNumeros.length > 0) {
            matriz.push(filaNumeros);
        }
    });
}

 async function generatMat(){
    let numeroAleatorio;
for (let i=0; i<N ; i++){
    let fila=[]
    for (let j=0; j<M; j++){

       numeroAleatorio = Math.random();

       if (numeroAleatorio<matriz[0][0])
         fila[j]=0
        else
            fila[j]=1
    }
    matrizNM[i]=fila
  }
}


async function getProbabilities(){
    //P(a)
    matriz[0].forEach((elemento,indice) => probSubA[indice]=elemento);
    //P(b/a)
    for (let i=1; i<matriz.length; i++){
        let aux=[];
        matriz[i].forEach((elemento,indice) => aux[indice]=elemento);
        probInBOutA[i-1]=aux;
    }
    //P(b)
    for (let i=0; i<probInBOutA.length; i++){
        let aux=probInBOutA[i];
        let auxTot=0;
        for (let j=0; j<aux.length; j++){
            auxTot+=probInBOutA[j][i]*probSubA[j];
        }
        probSubB[i]=auxTot;
    }
    //I(b)
    probSubB.forEach((elemento,indice) => infoSubB[indice]= Math.log2(1/elemento));
    //I(a)
    probSubA.forEach((elemento,indice) => infoSubA[indice]= Math.log2(1/elemento));
    //P(a,b)
    for (let i=0; i<probInBOutA.length; i++){
        let aux=probInBOutA[i];
        let auxVec=[];
        for (let j=0; j<aux.length; j++){
            auxVec[j]=probInBOutA[i][j]*probSubA[i];
        }
        probSucesos[i]=auxVec;
    }
    //I(b/a)
    for (let i=0; i<probInBOutA.length; i++){
        let aux=probInBOutA[i];
        let auxVec=[];
        for (let j=0; j<aux.length; j++){
            auxVec[j]=Math.log2(1/probInBOutA[i][j]);
        }
        infoInBOutA[i]=auxVec;
    }
    //P(a/b)
    for (let i=0; i<probSucesos.length; i++){
        let aux=probSucesos[i];
        let auxVec=[];
        for (let j=0; j<aux.length; j++){
            auxVec[j]= probSucesos[i][j]/probSubB[j];
        }
        probInAOutB[i]=auxVec;
    }

   //I(a/b)
    for (let i=0; i<probInAOutB.length; i++){
        let aux=probInAOutB[i];
        let auxVec=[];
        for (let j=0; j<aux.length; j++){
            auxVec[j]= Math.log2(1/probInAOutB[i][j]);
        }
        infoInAOutB[i]=auxVec;
}   
    //H(A/b)
    for (let i=0; i<probSucesos.length; i++){
        let aux=probSucesos[i];
        let auxTot=0;
        for (let j=0; j<aux.length; j++){
            auxTot+=probInAOutB[j][i]*infoInAOutB[j][i]
        }
        entropAlfaInA[i]=auxTot;
    }

    //H(B/a)
    for (let i=0; i<probSucesos.length; i++){
        let aux=probSucesos[i];
        let auxTot=0;
        for (let j=0; j<aux.length; j++){
            auxTot+=probInBOutA[i][j]*infoInBOutA[i][j]
        }
        entropAlfaInB[i]=auxTot;
    }

   //H(A)
   probSubA.forEach((elemento,indice) => entropiaCondA+=(elemento*infoSubA[indice]));
   //H(B)
   probSubB.forEach((elemento,indice) => entropiaCondB+=(elemento*infoSubB[indice]));
 
    //H(AlB)
    probSubB.forEach((elemento,indice) => equivocAyB+=(elemento*entropAlfaInA[indice]));
  
    //H(BlA)
  probSubA.forEach((elemento,indice) => equivocByA+=(elemento*entropAlfaInB[indice]));
 
   //I(AlB)
   infoMutuaAyB = entropiaCondA - equivocAyB;
    
   //I(BlA)
   infoMutuaByA = entropiaCondB-equivocByA;

}


async function getMatrizCanal(N,M){
let aux;
    for (let i=0; i<N; i++){
        let auxMat = matrizNM[i]
        let auxFila = []//
       for (let j=0; j<M; j++){
            aux = Math.random()
            if (auxMat[j] === 0){
                if (aux < probInBOutA[0][0])
                    auxFila[j]=0
                else
                    auxFila[j]=1
            }else{
                if (aux < probInBOutA[1][0])
                    auxFila[j]=0
                else
                    auxFila[j]=1
            }
        }
        matrizCanal[i]=auxFila;
    }

}

async function habPariedad(){
    let auxPariedadFil=0;
    let auxPariedadCol=0;
//filas
    for (let i=0; i<N; i++){
        let auxMat = matrizNM[i];
        let aux=0;
        for (let j =0; j<M; j++){
             aux+=auxMat[j];
        }
        if ( aux % 2 === 0)
            matrizNM[i][M]=0
        else{
            matrizNM[i][M]=1
            auxPariedadFil+=1}
    }

//columnas
let auxFila=[]
for(let k=0; k<M; k++)
    auxFila[k]=0;
 matrizNM.push(auxFila);

for (let i=0; i<M; i++){
    let aux=0;
    for (let j =0; j<N; j++){
         aux+=matrizNM[j][i]
    }
    if ( aux % 2 === 0)
        matrizNM[N][i]=0
    else
         {matrizNM[N][i]=1
          auxPariedadCol+=1}

}
//pos NxM
    if ( auxPariedadCol % 2 === 0)
    matrizNM[N][M]=0
    else
    matrizNM[N][M]=1

    //verificar pos NxM
    if (( matrizNM[N][M]===0 && auxPariedadFil % 2 === 1) || ( matrizNM[N][M]===1 && auxPariedadFil % 2 === 0) )
        console.log("error bit de control pariedad")
 
}


async function smsEstate(matrizOriginal , matrizRecibida, N, M){
let auxF=0, auxC=0
let cb = 0

while (/*cb != 2 &&*/ auxF !== N){
    if (matrizOriginal[auxF][auxC] !== matrizRecibida[auxF][auxC])
       { 
        cb+=1
        auxF+=1
        auxC = 0
        }
     else if (auxC === (M-1)){
        auxF+=1
        auxC = 0
    }else    
        auxC+=1
}
console.log("mensajes correctos: "+(N-cb)+" mensaje incorrectos: "+cb)
}

async function correcParCruzada(matriz, N ,M){
    let errTot=0
    let filError
    let colError
//filas
    for (let i=0; i<N; i++){
        let auxMat = matriz[i];
        let aux=0;
        for (let j =0; j<M; j++){
             aux+=auxMat[j];
        }
        if ((matriz[i][M]===0 && aux % 2 === 1) || ( matriz[i][M]===1 && aux % 2 === 0) )
          { filError = i
            errTot+=1   }
        
    }
    if (errTot === 1){
    //columnas
    for (let i=0; i<M; i++){
        let auxMat = matriz[i];
        let aux=0;
        for (let j =0; j<N; j++){
            aux+=matriz[j][i];
        }

        if ((matriz[N][i]===0 && aux % 2 === 1) || ( matriz[N][i]===1 && aux % 2 === 0) )
        { colError = i
          errTot+=1   }

    }
        if (errTot === 2)
            console.log("Se puede correjir fila "+filError+" columna "+colError)
        else 
             console.log("no se puede correjir ")

     }
    else
       console.log("no se puede correjir ")
}