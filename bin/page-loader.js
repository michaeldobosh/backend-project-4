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
  .action((url, dir) => pageloader(url, dir.output)
    .then((pathToFile) => console.log(`Page was successfully downloaded into ${pathToFile}`))
    .catch((error) => {
      if (error.errno === -2) {
        console.error(`Cannot write ${error.path}: no such file or directory '${path.parse(error.path).dir}'`);
      }
      if (error.errno === -13) {
        console.error(`Cannot write ${error.path}: Permission denied`);
      }
      if (error.errno === -17) {
        console.error(`Cannot write ${error.path}: already exists`);
      }
      if (error.errno === -3001 || error.errno === -3008) {
        console.error('No response');
      }
      process.exit(1);
    }));

program.parse();
