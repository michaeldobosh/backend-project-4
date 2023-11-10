#!/usr/bin/env node
import { program } from 'commander';
import pageloader from '../src/index.js';

program
  .name('page-loader')
  .version('0.0.1')
  .description('A command line utility that downloads pages from the Internet and saves them on the computer.')
  .arguments('<url>')
  .option(
    '-o, --output [dir]',
    `output dir (default: "${process.cwd()}")`,
    process.cwd(),
  )
  .action((url, dir) => pageloader(url, dir.output).then(console.log));

program.parse();
