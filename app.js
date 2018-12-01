'use strict';

var args = require('minimist')(process.argv.slice(2));

const config = {
  answer: "Hello World",
  initialLength: 50, // used for variable length
  populationSize: 100,
  maxGenerations: 10000,
  mutationChance: 0.5
};

console.dir(args);

if (args.h) {
  console.log(`usage: node app.js [opts] "[answer]"`);
  console.log(`\topts:`);
  console.log(`\t-l, --initialLength\tStarting length of the generated strings (default ${config.initialLength})`);
  console.log(`\t-s, --populationSize\tMaximum size of the population for each generation (default ${config.populationSize})`);
  console.log(`\t-m, --maxGenerations\tMaximum number of generations to find the answer (default ${config.maxGenerations})`);
  console.log(`\t-c, --mutationChance\tChance for an organism to mutate [0-1] (default ${config.mutationChance})`);
  console.log(`\n\t[answer]\t\tProvide a string value for the application to search for. When reached, the algorithm will exit.`);
  console.log(`\t\t\t\t(default "${config.answer}")`);
  process.exit(0);
}

/* Get config options from command line */
config.answer = (args._ && Array.isArray(args._) && args._[0] && args._[0].length) ? args._[0] : config.answer;
config.initialLength = args.l || args.initialLength || config.initialLength;
config.populationSize = args.s || args.populationSize || config.populationSize;
config.maxGenerations = args.m || args.maxGenerations || config.maxGenerations;
config.mutationChange = args.c || args.mutationChance || config.mutationChance;


const half = Math.floor(config.initialLength / 2);
const max = config.initialLength + half;
const min = config.initialLength - half;

console.log(`max: ${max}`);
console.log(`min: ${min}`);

const minCharCode = 32;
const maxCharCode = 126;

console.log(`==========================`);
console.log(`possible set`);
let n = minCharCode;
let s = "";
while (n <= maxCharCode) {
  s += String.fromCharCode(n);
  n++;
}
console.log(s);
console.log(`==========================`);


const randomSeed = length => {
  let l = length || config.initialLength + Math.floor(Math.random() * (max - min + 1)) + min;
  // console.log(l);
  let seed = "";
  while (l--) {
    const num = Math.floor(Math.random() * (maxCharCode - minCharCode + 1)) + minCharCode;
    const s = String.fromCharCode(num);
    seed += s;
    //console.log(`charCode: ${num} ==> ${s} ==> ${seed}`);
  }
  return seed;
};

// higher is better
const calcFitness = str => {

  let score = 0;

  if (str.length < config.answer.length) {
    score = (str.length * 10) - config.answer.length;
  } else if (str.length > config.answer.length) {
    score = (config.answer.length * 10) - str.length;
  }

  // console.log(`*** s: ${str.length} c: ${config.answer.length} score: ${score}`);

  for (let i = 0; i < str.length; i++) {
    const a = str.charCodeAt(i);

    let b = 0;
    if (config.answer.length > i) {
      b = config.answer.charCodeAt(i);
    } else {
      b = -1;
      // console.log(`*** b: ${b}, i: ${i}, length: ${config.answer.length}`);
    }

    if (a === b) {
      // console.log(`a: (${String.fromCharCode(a)}) ${a} b: (${String.fromCharCode(b)}) ${b} score: ${1}`);
      score += 1;
    } else if (a < b) {
      // console.log(`a: (${String.fromCharCode(a)}) ${a} b: (${String.fromCharCode(b)}) ${b} (a-b) score: ${a - b}`);
      score += (a - b);
    } else {
      // console.log(`a: (${String.fromCharCode(a)}) ${a} b: (${String.fromCharCode(b)}) ${b} (b-a) score: ${b - a}`);
      score += (b - a);
    }
  }

  // const arr = str.split('');
  // score = arr.reduce((p, c, i) => {
  //   const a = c.charCodeAt(0);
  //   const b = config.answer.charCodeAt(i);

  //   if (a === b) {
  //     // console.log(`a: (${String.fromCharCode(a)}) ${a} b: (${String.fromCharCode(b)}) ${b} score: ${1}`);
  //     return p + 1;
  //   } else if (a < b) {
  //     // console.log(`a: (${String.fromCharCode(a)}) ${a} b: (${String.fromCharCode(b)}) ${b} (a-b) score: ${a - b}`);
  //     return p + (a - b);
  //   } else {
  //     // console.log(`a: (${String.fromCharCode(a)}) ${a} b: (${String.fromCharCode(b)}) ${b} (b-a) score: ${b - a}`);
  //     return p + (b - a);
  //   }
  // }, 0);

  // console.log(`*** score: ${score}`);
  // console.log(`-------------------------`);

  return score;
};

const sort = population => {
  const sorted = population.sort((a, b) => {
    return b.fitness - a.fitness;
  });

  return sorted;
};

const kill = population => {
  const survivals = population.slice(0, config.populationSize);
  return survivals;
};

const mate = population => {
  const new_population = [];

  // console.log(`*** mate ***`);
  // console.log(`population.length: ${population.length}`);
  for (let i = 0; i < population.length; i++) {
    const father = population[i].value;
    const mother = population[i + 1] && population[i + 1].value;

    if (!mother) {
      // console.log('no mother')
      continue;
    }

    const child_1 = father.substring(0, Math.floor(father.length / 2)) + mother.substring(Math.floor(mother.length / 2));
    const child_2 = mother.substring(0, Math.floor(mother.length / 2)) + father.substring(Math.floor(father.length / 2));

    // ???
    // new_population.push({ value: father });
    // new_population.push({ value: mother });
    new_population.push({ value: child_1 });
    new_population.push({ value: child_2 });
  }

  // console.log(`new_population.length: ${new_population.length}`);
  // console.log(`*** end mate ***`);


  return new_population;
};

const mutate = population => {
  const new_population = population.map(chromosome => {
    let c = chromosome.value;
    let old = c;
    if (Math.random() < config.mutationChance) {

      if (Math.random() < config.mutationChance) {
        // character change
        const rIndex = Math.floor(Math.random() * (chromosome.value.length));
        const rMutation = Math.random() < 0.5 ? -1 : 1;
        let nValue = chromosome.value.charCodeAt(rIndex) + rMutation;
        nValue = nValue < minCharCode ? minCharCode : nValue;
        nValue = nValue > maxCharCode ? maxCharCode : nValue;
        c = c.substring(0, rIndex) + String.fromCharCode(nValue) + c.substring(rIndex + 1);

        // if (c.length !== config.answer.length) {
        //   console.log(`new string is the wrong length! ${c.length} !== ${config.answer.length} // ${old} ==> ${c} // rIndex: ${rIndex}, nValue: ${nValue}, chromosome.length: ${chromosome.value.length}`);
        //   process.exit(1);
        // }
      } else {
        // length change
        const rMutation = Math.random() < 0.5 ? -1 : 1;
        if (rMutation === -1) {
          // decrease in length
          c = c.slice(0, -1);
        } else {
          // increase in length
          const num = Math.floor(Math.random() * (maxCharCode - minCharCode + 1)) + minCharCode;
          const s = String.fromCharCode(num);
          c = c + s;
        }
      }

    }
    return {
      value: c,
      fitness: chromosome.fitness
    };
  });
  return new_population;
};

let generation = 0;
const done = population => {
  const success = population.filter(c => {
    return c.value === config.answer;
  });
  if (success && success.length) {
    console.log(`\nDone!`);
    console.log(`Generation: ${generation}`);
    console.log(success[0].value);
    console.log(calcFitness(success[0].value));
    return true;
  }

  if (generation >= config.maxGenerations) {
    console.log(`\nFailed!`);
    console.log(`Generation: ${generation}`);
    console.log(`Best Found`);
    console.log(population[0].value);
    console.log(`fitness: ${calcFitness(population[0].value)}`);
    return true;
  }

  return false;
};


function parseHrtimeToSeconds(str) {
  const hrtime = process.hrtime(str);
  let seconds = parseFloat((parseFloat(hrtime[0]) + parseFloat((hrtime[1] / 1e9))).toFixed(3));
  return seconds;
}

// ==================================================
// will try to get a constant length working first
// const tempLength = config.answer.length;
// const seed = randomSeed(tempLength);
// const seed = randomSeed();

let population = [];
// console.log(`tempLength: ${tempLength}`);
for (let i = 0; i < config.populationSize; i++) {
  population.push({ value: randomSeed() });
}

console.log(`population size: ${population.length}`);

let tdone = 0, tcalc = 0, tsort = 0, tkill = 0, tmate = 0, tmutate = 0, tgen = 0;
let t = process.hrtime();
let g = process.hrtime();
let tt = process.hrtime();
while (!done(population)) {
  tdone += parseHrtimeToSeconds(t)
  generation++;

  // console.log(`population: ${JSON.stringify(population)}`);
  // console.log(`first value: ${population[0].value}`);
  t = process.hrtime();
  const new_population = population.map(p => {
    // console.log(`${ i } ${ p.value.length } ${ p.value }`);
    return {
      value: p.value,
      fitness: calcFitness(p.value)
    };
  });
  tcalc += parseHrtimeToSeconds(t);

  // console.log(`generation: ${generation} --  new_population size: ${new_population.length}`);

  t = process.hrtime();
  const sorted = sort(new_population);
  tsort += parseHrtimeToSeconds(t);
  tgen = parseHrtimeToSeconds(g);


  t = process.hrtime();
  const pruned = kill(sorted);
  tkill += parseHrtimeToSeconds(t);
  // console.log(`pruned down to: ${pruned.length}`);

  t = process.hrtime();
  const families = mate(pruned);
  tmate += parseHrtimeToSeconds(t);
  // console.log(`families: ${families.length}`);

  t = process.hrtime();
  population = mutate(families);
  tmutate += parseHrtimeToSeconds(t);
  // console.log(`population: ${population.length}`);

  // process.stdout.clearLine();
  // process.stdout.cursorTo(0);
  // process.stdout.write(`${tgen}s\tgeneration: ${generation} --\thighest fitness: ${sorted[0].fitness}\t: ${sorted[0].value}`);

  console.log(`${tgen}s\tgeneration: ${generation} --\thighest fitness: ${sorted[0].fitness}\t: ${sorted[0].value}`);
}

const ttotal = parseHrtimeToSeconds(tt);
console.log(config);
console.log(`total time:\t${ttotal}s`);
console.log(`tdone:\t\t${tdone}s`);
console.log(`tcalc:\t\t${tcalc}s`);
console.log(`tsort:\t\t${tsort}s`);
console.log(`tkill:\t\t${tkill}s`);
console.log(`tmate:\t\t${tmate}s`);
console.log(`tmutate:\t${tmutate}s`);
