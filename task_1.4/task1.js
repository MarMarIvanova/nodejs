#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const readline = require('readline');

const logFile = path.join(__dirname, 'log.txt');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('Игра "Орёл или решка"');
console.log('Введи 1 (орёл) или 2 (решка)');
console.log('Для выхода напиши exit\n');

function play() {
  rl.question('Твой выбор: ', (answer) => {
    if (answer === 'exit') {
      console.log('Пока!');
      rl.close();
      return;
    }

    if (answer !== '1' && answer !== '2') {
      console.log('Нужно ввести 1 или 2:');
      play();
      return;
    }

    const userChoice = Number(answer);
    const random = Math.random() < 0.5 ? 1 : 2;

    const result = userChoice === random ? 'WIN' : 'LOSE';

    console.log(
      result === 'WIN'
        ? 'Угадал'
        : 'Не угадал'
    );

    const logLine = `user: ${userChoice}, random: ${random}, result: ${result}\n`;

    fs.appendFileSync(logFile, logLine);

    play();
  });
}

play();