"use strict";

const config = {
  answer: "Hello World!",
  initialLength: 5,
  populationSize: 10,
  maxGenerations: 1,
  mutationChance: 0.5
};

const half = Math.floor(config.initialLength / 2);
const max = config.initialLength + half;
const min = config.initialLength - half;

console.log(`max: ${max}`);
console.log(`min: ${min}`);

const minCharCode = 65;
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
  // 1 point for each character up to the length of the answer, -1 for each character over
  let score = 0; //chromosome.length - config.answer.length;

  //console.log(`======================`);
  console.log(`str: ${str}    (${str.length})`);

  if (str.length < config.answer.length) {
    score = str.length - config.answer.length;
  } else if (str.length > config.answer.length) {
    score = config.answer.length - str.length;
  }

  //console.log(`score: ${score}`);

  for (let i = 0; i < str.length; i++) {
    const a = str.charCodeAt(i);

    let b = 0;
    if (config.answer.length > i) {
      b = config.answer.charCodeAt(i);
    } else {
      b = i - config.answer.length;
      console.log(`*** b: ${b}`);
    }

    if (a === b) {
      //console.log(`a: (${String.fromCharCode(a)}) ${a} b: (${String.fromCharCode(b)}) ${b} score: ${1}`);
      score += 1;
    } else if (a < b) {
      //console.log(`a: (${String.fromCharCode(a)}) ${a} b: (${String.fromCharCode(b)}) ${b} (a-b) score: ${a - b}`);
      score += (a - b);
    } else {
      //console.log(`a: (${String.fromCharCode(a)}) ${a} b: (${String.fromCharCode(b)}) ${b} (b-a) score: ${b - a}`);
      score += (b - a);
    }
  }

  console.log(`score: ${score}`);
  console.log(`-------------------------`);

  return score;
};

const sort = population => {
  const sorted = population.sort((a, b) => {
    return b.fitness - a.fitness;
  });

  return sorted;
};

const kill = population => {
  const survivals = population.slice(0, Math.floor(population.length / 2));
  return survivals;
};

const mate = population => {
  // const new_population = []

  // for (let i = 0; i < population.length; i += 2) {
  //   const father = population[i].value;
  //   const mother = population[i + 1] && population[i + 1].value;

  //   if (!mother) {
  //     continue;
  //   }

  //   const ave_length = Math.floor((father.length + mother.length) / 2);

  //   const child_1 = father.substring(0, Math.floor(father.length / 2)) + mother.substring(Math.floor(mother.length / 2));
  //   const child_2 = mother.substring(0, Math.floor(mother.length / 2)) + father.substring(Math.floor(father.length / 2));

  //   // ???
  //   // new_population.push({ value: father });
  //   // new_population.push({ value: mother });
  //   new_population.push({ value: child_1 });
  //   new_population.push({ value: child_2 });
  // }

  // return [mutate(new_population)];

  const new_population = [];

  for (let i = 0; i < population.length; i += 1) {
    const father = population[i].value;
    const mother = population[i + 1] && population[i + 1].value;

    if (!mother) {
      continue;
    }

    const child_1 =
      father.substring(0, Math.floor(father.length / 2)) +
      mother.substring(Math.floor(mother.length / 2));
    const child_2 =
      mother.substring(0, Math.floor(mother.length / 2)) +
      father.substring(Math.floor(father.length / 2));

    // ???
    // new_population.push({ value: father });
    // new_population.push({ value: mother });
    new_population.push({ value: child_1 });
    new_population.push({ value: child_2 });
  }

  return new_population;
};

const mutate = population => {
  const new_population = population.map(chromosome => {
    let c = chromosome.value;
    if (Math.random() < config.mutationChance) {
      const rIndex = Math.floor(Math.random() * chromosome.length);
      const rMutation = Math.random() < 0.5 ? -1 : 1;
      let nValue = chromosome.value.charCodeAt(rIndex) + rMutation;
      nValue = nValue < 0 ? 0 : nValue;
      nValue = nValue > 255 ? 255 : nValue;
      c =
        c.substring(0, rIndex) +
        String.fromCharCode(nValue) +
        c.substring(rIndex + 1);
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
    return c === config.answer;
  });
  if (success && success.length) {
    console.log(`Done!`);
    console.log(`Generation: ${generation}`);
    console.log(success[0].value);
    console.log(success[0].fitness);
    return true;
  }

  if (generation > config.maxGenerations) {
    console.log(`Failed!`);
    console.log(`Generation: ${generation}`);
    console.log(`Best Found`);
    console.log(population[0].value);
    console.log(calcFitness(population[0].value));
    return true;
  }

  return false;
};

// ==================================================
// will try to get a constant length working first
const tempLength = config.answer.length;
const seed = randomSeed(tempLength);

let population = [];
console.log(`tempLength: ${tempLength}`);
for (let i = 0; i < config.populationSize; i++) {
  population.push({ value: randomSeed(tempLength) });
}

console.log(`population size: ${population.length}`);

while (!done(population)) {
  generation++;

  // console.log(`population: ${JSON.stringify(population)}`);
  // console.log(`first value: ${population[0].value}`);
  const new_population = population.map(p => {
    // console.log(`${ i } ${ p.value.length } ${ p.value }`);
    return {
      value: p.value,
      fitness: calcFitness(p.value)
    };
  });

  console.log(`generation: ${generation} --  new_population size: ${new_population.length}`);

  const sorted = sort(new_population);
  console.log(`generation: ${generation} --  highest fitness: ${sorted[0].fitness} : ${sorted[0].value}`);

  const pruned = kill(sorted);
  console.log(`pruned down to: ${pruned.length}`);

  const families = mate(pruned);
  console.log(`families: ${families.length}`);

  population = mutate(families);
  console.log(`population: ${population.length}`);
}

// for (let i = 0; i < new_population.length; i++) {
//   console.log(`${ new_population[i].fitness } : ${ new_population[i].value }`);
// }

/*
console.log(`================= `);
for (let i = 0; i < 256; i++) {
  console.log(`${ i }: ${ String.fromCharCode(i) }`);
}
*/
