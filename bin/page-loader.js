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
    .catch((error) => {
      if (error.errno === -2) {
        return `Cannot write ${error.path}: no such file or directory '${path.parse(error.path).dir}'`;
      }
      if (error.errno === -13) {
        return `Cannot write ${error.path}: Permission denied`;
      }
      if (error.errno === -17) {
        return `Cannot write ${error.path}: already exists`;
      }
      if (error.response?.status === 500) {
        return 'Network error';
      }
      const fileUrl = error?.config?.url;
      return `Page ${fileUrl} not found`;
    })
    .then(console.error));

program.parse();
