#!/usr/bin/env node

const readline = require('readline');

const MIN = 0;
const MAX = 100;

const numberForGuess = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`Загадано число в диапазоне от ${MIN} до ${MAX}`);

function processGuess(input) {
  const guess = parseInt(input.trim(), 10);
  
  if (isNaN(guess)) {
    rl.question('', processGuess);
    return;
  }
  
  if (guess === numberForGuess) {
    console.log(`Отгадано число ${numberForGuess}`);
    rl.close();
  } else if (guess < numberForGuess) {
    console.log('Больше');
    rl.question('', processGuess);
  } else {
    console.log('Меньше');
    rl.question('', processGuess);
  }
}

rl.question('', processGuess);

