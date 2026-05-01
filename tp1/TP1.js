const fs = require('fs').promises
const path = require('path')
// const DATA_FILE = 'tp1_samples/tp1_sample9.bin'

function initCounters () {
  return {
    '0': 0,
    '1': 0,
    pairs: {
      '00': 0, '01': 0,
      '10': 0, '11': 0
    }
  }
}

async function countOccurrences (fileName) {
  console.log(path.join(__dirname, fileName))
  const fh = await fs.open(path.join(__dirname, fileName), 'r')
  const buffer = Buffer.alloc(1);
  let bytesRead, prevValue;
  const counters = initCounters();

  do {
    const res = await fh.read({buffer});
    bytesRead = res.bytesRead;
    // console.log(bytesRead, buffer[0]);
    if (bytesRead > 0) {
      for (let i = 7; i >= 0; i--) {
        const currentValue = (buffer[0] >> i) & 0x1;
        counters[currentValue]++;
        if (typeof prevValue !== 'undefined') {
          counters.pairs[`${prevValue}${currentValue}`]++;
        }
        prevValue = currentValue;
      }
    }
  } while (bytesRead > 0);
  await fh.close();
  return counters;
}

function calculateProbabilites (counters) {
  const TOTAL_OCCURS = counters['0'] + counters['1']
  const OCCURS_0 = counters.pairs['00'] + counters.pairs['01']
  const OCCURS_1 = counters.pairs['10'] + counters.pairs['11']
  const probabilites = {
    '0': counters['0'] / TOTAL_OCCURS,
    '1': counters['1'] / TOTAL_OCCURS,
    pairs: {}
  }
  Object.keys(counters.pairs).forEach((key) => {
    probabilites.pairs[key] = counters.pairs[key] / (key.startsWith('0') ? OCCURS_0 : OCCURS_1); // Single pair / Total pairs
  })
  return probabilites
}

function hasMemory (probabilites) {
  const {pairs} = probabilites
  function areClose (val1, val2) {
    const offset = 0.01;
    return val1 >= val2 - offset && val1 <= val2 + offset;
  }
  return !(areClose(pairs['00'], pairs['10']) && areClose(pairs['01'], pairs['11']))
}

function calculateExtensionData (probabilites, N) {
  const S = Object.keys(probabilites) // Fuente S
  const PdS = Object.values(probabilites) // Probabilidades S

  const extension = [], probExtension = []
  function generateExtension (symbol, prob, alt) {
    if (alt >= N) {
      extension.push(symbol)
      probExtension.push(prob)
      return
    }
    for (let i = 0; i < S.length; i++) {
      generateExtension(symbol + S[i], prob * PdS[i], alt + 1)
    }
  }
  generateExtension('', 1, 0)

  // console.log({extension, probExtension})

  // const infoExtension = probExtension.map(p => Math.log2(1/p))
  // console.log({infoExtension})

  const entropyExtension = probExtension.reduce((res, prob) => {
    return res + prob * Math.log2(1/prob)
  }, 0)

  // console.log({entropyExtension})

  return {extension, probExtension, entropyExtension}
}

async function main () {
  try {
    const counters = await countOccurrences(process.argv[2]);
    const probabilites = calculateProbabilites(counters);
    // console.log('counters', counters);
    console.log('probabilites', probabilites);

    if (hasMemory(probabilites)) {
      console.log('Es de memoria NO nula');
      
      const BsC = probabilites.pairs['01'] / probabilites.pairs['10'];
      const x0 = 1 / (1 + BsC);
      const x1 = BsC * x0;

      console.log(`Vector estacionario: [${x0}, ${x1}]`)

    } else {
      console.log('Es de memoria nula');

      const {pairs, ...probs} = probabilites
      const entropy = Object.values(probs).reduce((res, val) => res + val * Math.log2(1/val), 0);
      console.log('Entropia:', entropy);

      if (process.argv[3]) {
        const N = parseInt(process.argv[3])
        const {extension, probExtension, entropyExtension} = calculateExtensionData(probs, N);
        const stringExtension = extension.reduce((res, val, i) => `${res}${val} (${(probExtension[i] * 100).toFixed(4)}%), `, '');
        console.log('Extensión:     ', stringExtension.slice(0, -2));
        console.log('Entropia de la extension:', entropyExtension);
      }
    }
  } catch (error) {
    console.log('ERROR:', error.message);
  }
}

main();