#!/usr/bin/env node
import { program } from 'commander';
import path from 'path';
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
  .action((url, dir) => pageloader(url, dir.output))
  .then((pathToFile) => console.log(`Page was successfully downloaded into ${pathToFile}`))
  .catch((error) => {
    if (error.errno === -2) {
      console.log(`Cannot write ${error.path}: no such file or directory '${path.parse(error.path).dir}'`);
      process.exit(1);
    }
    if (error.errno === -13) {
      console.log(`Cannot write ${error.path}: Permission denied`);
      process.exit(1);
    }
    if (error.errno === -17) {
      console.log(`Cannot write ${error.path}: already exists`);
      process.exit(1);
    }
    if (error.errno === -3001 || error.errno === -3008) {
      console.log('No response');
      process.exit(1);
    }
    process.exit(1);
  });

program.parse();
