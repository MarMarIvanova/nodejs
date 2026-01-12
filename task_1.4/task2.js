#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logFile = path.join(__dirname, 'log.txt');

let total = 0;
let wins = 0;
let losses = 0;

const rl = readline.createInterface({
  input: fs.createReadStream(logFile, { encoding: 'UTF8' }),
  crlfDelay: Infinity,
});

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  total += 1;

  if (trimmed.includes('result: WIN')) {
    wins += 1;
  } else if (trimmed.includes('result: LOSE')) {
    losses += 1;
  }
});

rl.on('close', () => {
  const winPercent = total === 0 ? 0 : (wins / total) * 100;

  console.log('Анализ логов');
  console.log('Всего партий:', total);
  console.log('Выиграно:', wins);
  console.log('Проиграно:', losses);
  console.log('Процент побед:', winPercent.toFixed(0) + '%');
});

rl.on('error', (err) => {
  console.log('Ошибка чтения файла:', err.message);
});