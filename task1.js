#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

function getCurrentDate() {
  return new Date();
}

function formatDate(date) {
  return date.toISOString();
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addYears(date, years) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

function subDays(date, days) {
  return addDays(date, -days);
}

function subMonths(date, months) {
  return addMonths(date, -months);
}

function subYears(date, years) {
  return addYears(date, -years);
}

yargs(hideBin(process.argv))
    .command('current', 'Get current date', (yargs) => {
      return yargs
        .option('year', {
          alias: 'y',
          type: 'boolean',
          description: 'Get current year'
        })
        .option('month', {
          alias: 'm',
          type: 'boolean',
          description: 'Get current month'
        })
        .option('date', {
          alias: 'd',
          type: 'boolean',
          description: 'Get current date in calendar month'
        });
    }, (argv) => {
      const now = getCurrentDate();
      
      if (argv.year) {
        console.log(now.getFullYear());
      } else if (argv.month) {
        console.log(now.getMonth() + 1);
      } else if (argv.date) {
        console.log(now.getDate());
      } else {
        console.log(formatDate(now));
      }
    })
    .command('add', 'Add years, months or days to current date', (yargs) => {
      return yargs
        .option('year', {
          alias: 'y',
          type: 'number',
          description: 'Add years'
        })
        .option('month', {
          alias: 'm',
          type: 'number',
          description: 'Add months'
        })
        .option('date', {
          alias: 'd',
          type: 'number',
          description: 'Add days'
        });
    }, (argv) => {
      let date = getCurrentDate();
      
      if (argv.year) {
        date = addYears(date, argv.year);
      }
      if (argv.month) {
        date = addMonths(date, argv.month);
      }
      if (argv.date) {
        date = addDays(date, argv.date);
      }
      
      console.log(formatDate(date));
    })
    .command('sub', 'Subtract years, months or days from current date', (yargs) => {
      return yargs
        .option('year', {
          alias: 'y',
          type: 'number',
          description: 'Subtract years'
        })
        .option('month', {
          alias: 'm',
          type: 'number',
          description: 'Subtract months'
        })
        .option('date', {
          alias: 'd',
          type: 'number',
          description: 'Subtract days'
        });
    }, (argv) => {
      let date = getCurrentDate();
      
      if (argv.year) {
        date = subYears(date, argv.year);
      }
      if (argv.month) {
        date = subMonths(date, argv.month);
      }
      if (argv.date) {
        date = subDays(date, argv.date);
      }
      
      console.log(formatDate(date));
    })
    .help()
    .parse();

