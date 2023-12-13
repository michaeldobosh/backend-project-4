import path from 'path';
import fsp from 'fs/promises';
import 'dotenv/config';
import axios from 'axios';
import debug from 'debug';
import { addLogger } from 'axios-debug-log';
import Listr from 'listr';

import renameFromUrl from '../utils/renameFromUrl.js';
import parser from './parser.js';

addLogger(axios);

const namespace = 'page-loader';
const log = debug(namespace);
log('booting %s', namespace);

export default (link, output = '') => {
  const requestUrl = new URL(link);
  const fileName = renameFromUrl(requestUrl);
  const directoryFileName = fileName.replace('.html', '_files');
  const pathToFile = path.resolve(output, fileName);
  const fileDirectory = path.join(output, directoryFileName);
  const tasks = [];
  const data = {};

  log('downloading html-page');
  return axios.get(requestUrl.toString())
    .then((response) => {
      data.htmlData = response.data;
      log('creating file directory');
      return fsp.mkdir(fileDirectory);
    })
    .then(() => {
      log('parsing html');
      Object.assign(data, parser(data.htmlData, requestUrl.origin, directoryFileName));
      log('writing html-page to file');
      return fsp.writeFile(pathToFile, data.htmlData, 'utf-8');
    })
    .then(() => {
      log('creating tasks for Listr');
      tasks.push(...data.urls.map((linkToAsset) => ({
        title: linkToAsset,
        task: (_stx, task) => axios({ method: 'get', url: linkToAsset, responseType: 'arraybuffer' })
          .then((res) => {
            if (res?.status === 200) {
              const { url } = res.config;
              return fsp.writeFile(path.join(fileDirectory, renameFromUrl(new URL(url))), res.data);
            }
            return null;
          })
          .catch((error) => {
            if (error.response?.status === 404) {
              task.skip(`Error loading file "${linkToAsset}"`);
            } else {
              throw error;
            }
          }),
      })));
    })
    .then(() => {
      const listr = new Listr(tasks, { concurrent: true });
      log('downloading and writing assets');
      return listr.run();
    })
    .then(() => pathToFile);
};
