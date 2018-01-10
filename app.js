'use strict';

const config = {
  str: 'Hello World!'
};

const randomSeed = () => {
  let length = 100;
  let seed = '';
  while (length--) {
    seed += String.fromCharCode(Math.floor(Math.random() * 255));
  }
  return seed;
}


const seed = randomSeed();

console.log(seed);