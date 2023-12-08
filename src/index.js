import path from 'path';
import fsp from 'fs/promises';
import axios from 'axios';
import debug from 'debug';
import { addLogger } from 'axios-debug-log';
import Listr from 'listr';
import _ from 'lodash';

import renameFromUrl from '../utils/renameFromUrl.js';
import parser from './parser.js';

addLogger(axios);
const log = debug('axios');
const name = 'page-loader';

log('booting %s', name);

export default (link, output = '') => {
  const requestUrl = new URL(link);
  const fileName = renameFromUrl(requestUrl);
  console.log(fileName);
  const directoryFileName = fileName.replace('.html', '_files');
  const pathToFile = path.resolve(output, fileName);
  const pathToFileDirectory = path.join(output, directoryFileName);
  const tasks = [{ title: link, task: () => axios.get(link) }];
  let loadedData;

  return axios.get(requestUrl.toString())
    .then(({ data }) => { loadedData = data; })
    .then(() => fsp.mkdir(pathToFileDirectory))
    .then(() => {
      const { htmlData, urls } = parser(loadedData, requestUrl.origin, directoryFileName);
      fsp.writeFile(pathToFile, htmlData, 'utf-8');
      tasks.push(...urls.map((url) => ({
        title: url,
        task: (_stx, task) => axios({ method: 'get', url, responseType: 'stream' }).catch((error) => {
          if (error.response?.status === 404) {
            task.skip(`Error loading file "${url}"`);
          }
        }),
      })));
      return urls;
    })
    .then((urls) => urls
      .map((fileUrl) => axios({ method: 'get', url: fileUrl, responseType: 'stream' })
        .catch(() => _.noop)))
    .then((requests) => Promise.all(requests))
    .then((responses) => {
      responses.forEach((respons) => {
        if (respons?.status === 200) {
          const { url } = respons.config;
          fsp.writeFile(path.join(pathToFileDirectory, renameFromUrl(new URL(url))), respons.data)
            .catch((error) => {
              throw error;
            });
        }
      });
    })
    .then(() => {
      const listr = new Listr(tasks, { concurrent: true });
      return listr.run();
    })
    .then(() => pathToFile);
};
