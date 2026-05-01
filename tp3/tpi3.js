const fs = require('fs').promises

function lzwCompress(input) {
  // Inicializar diccionario con código ASCII
  const dictionary = {};
  const occursDict = {};
  for (let i = 0; i < 256; i++) {
      dictionary[String.fromCharCode(i)] = i;
  }

  let result = [];
  let w = '';
  let currentCode = 256;

  for (let i = 0; i < input.length; i++) {
      let k = input[i];

      if (dictionary[w + k] !== undefined) {
          // Si wK está en el diccionario, actualiza w
          w = w + k;
      } else {
          // Imprimir el código de w
          result.push(dictionary[w]);
          if (occursDict[w]) 
            occursDict[w]++;
          else
            occursDict[w] = 1;

          // Agregar wK al diccionario
          dictionary[w + k] = currentCode;
          currentCode++;

          // w se actualiza con K
          w = k;
      }
  }

  // Imprimir el código de la última cadena
  if (w !== '') {
      result.push(dictionary[w]);
  }

  return {result, dictionary, occursDict};
}

function lzwDecompress(compressed) {
  // Inicializar diccionario con cadenas de longitud 1 del código ASCII
  const dictionary = {};
  const occursDict = {}
  for (let i = 0; i < 256; i++) {
      dictionary[i] = String.fromCharCode(i);
  }

  let result = '';
  let oldCode = compressed[0];
  let character = dictionary[oldCode];
  result += character;

  for (let i = 1; i < compressed.length; i++) {
      let newCode = compressed[i];

      let entry;
      if (dictionary[newCode] !== undefined) {
          // Si el código nuevo ya está en el diccionario, obtener la cadena correspondiente
          entry = dictionary[newCode];

          if (occursDict[newCode]) 
            occursDict[newCode]++;
          else
            occursDict[newCode] = 1;
      } else {
          // Si el código nuevo no está en el diccionario, construir la cadena
          entry = dictionary[oldCode] + character;
      }

      // Imprimir la cadena
      result += entry;

      // Agregar la nueva entrada al diccionario
      let newEntry = dictionary[oldCode] + entry[0];
      dictionary[Object.keys(dictionary).length] = newEntry;

      // Preparar para la siguiente iteración
      oldCode = newCode;
      character = entry[0];
  }

  return {result, dictionary, occursDict};
}

function getBit(buffer, i, bit){
  return (buffer[i] >> bit) & 0x1;
}

function setBit(buffer, i, bit, value){
  if(value == 0){
    buffer[i] &= ~(1 << bit);
  }else{
    buffer[i] |= (1 << bit);
  }
}

// Función para escribir un array de números enteros en un archivo binario
async function writeBinaryFile(filename, array, bitsPerNumber) {
    const buffer = Buffer.alloc(Math.ceil(array.length * (bitsPerNumber / 8)) + 1);
    buffer.writeUInt8(bitsPerNumber);

    let iBuff = 1, iBit = 7;
    for (let num of array) {
        // Escribir el número en el buffer según la cantidad de bits especificada
        for (let iBitNum = 0; iBitNum < bitsPerNumber; iBitNum++) {
          // Los numeros se escriben en little endian
          if (iBit < 0) {
            iBit = 7;
            iBuff++;
          }
          const val = (num >> iBitNum) & 0x1;
          setBit(buffer, iBuff, iBit--, val)
        }
    }

    // Escribir el buffer en el archivo binario
    return fs.writeFile(filename, buffer);
}

async function readBinaryFile(filename) {
  const buffer = await fs.readFile(filename);
  const bitsPerNumber = buffer.readUInt8(0);
  const array = [];

  let iBit = 7, iBuff = 1, currentNumber = 0;
  let eof = false;

  while (iBuff < buffer.length) {
    for (let iBitNum = 0; iBitNum < bitsPerNumber; iBitNum++) {
      if (iBit < 0) {
        iBit = 7;
        iBuff++;
        if (iBuff >= buffer.length) {
          eof = true;
          break;
        }
      }

      const bitValue = getBit(buffer, iBuff, iBit--);
      currentNumber |= (bitValue << iBitNum);
    }

    if (!eof) {
      array.push(currentNumber);
      currentNumber = 0;
    }
  }

  return {binaryData: array, bitsPerNumber};
}

function getDictionaryEntropy (occursDict) {
  const simbolsOccurs = Object.values(occursDict)
  const sumOccurs = simbolsOccurs.reduce((sum, curr) => sum + curr, 0)
  const entropy = simbolsOccurs.reduce((sum, curr) => {
    const prob = curr / sumOccurs
    return sum + prob * Math.log2(1/prob)
  }, 0)
  return entropy
}

function getPerformanceAndRedundancy (occursDict, codeLength) {
  const entropy = getDictionaryEntropy(occursDict)
  const performance = entropy / codeLength
  const redundancy = 1 - performance
  return {performance, redundancy, entropy}
}

async function getCompressionRate (textFile, binFile) {
  const textStats = await fs.stat(textFile);
  const binStats = await fs.stat(binFile);
  return textStats.size / binStats.size;
}

async function showStatistics (occursDict, bitsPerCode, textFile, binFile) {
  const {performance, redundancy} = getPerformanceAndRedundancy(occursDict, bitsPerCode);
  const compressionRate = await getCompressionRate(textFile, binFile)
  console.log(`Tasa de compresion: ${compressionRate.toFixed(2)}:1`)
  console.log('Rendimiento:', performance.toFixed(4))
  console.log('Redundancia:', redundancy.toFixed(4))
}

async function main () {
  if (process.argv.length !== 5) {
    const [,, ...args] = process.argv;
    console.log("Ingrese correctamente los parametros del programa. Ingresados:", args.join(' '));
  } else {
    const [,, textFile, binFile, option] = process.argv;
    
    if (option === '-c') { // Comprimir
      const inputData = await fs.readFile(textFile);
      const inputString = inputData.toString();
    
      const {result: compressedResult, occursDict} = lzwCompress(inputString);
      const maxCode = Math.max(...compressedResult);
      const bitsPerCode = Math.ceil(Math.log2(maxCode));
    
      await writeBinaryFile(binFile, compressedResult, bitsPerCode);
      console.log('Compresión exitosa!\n');

      await showStatistics(occursDict, bitsPerCode, textFile, binFile);
    } else if (option === '-d') { // Descomprimir
      const {binaryData, bitsPerNumber} = await readBinaryFile(binFile);
      const {result: decompressedData, occursDict} = lzwDecompress(binaryData);
      await fs.writeFile(textFile, decompressedData);
      console.log('Descompresión exitosa!\n');

      await showStatistics(occursDict, bitsPerNumber, textFile, binFile);
    }
  }
} 

main()
