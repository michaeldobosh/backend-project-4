import path from 'path';
import fsp from 'fs/promises';
import axios from 'axios';
import debug from 'debug';
import { addLogger } from 'axios-debug-log';

import renameFromUrl from '../utils/renameFromUrl.js';
import parser from './parser.js';

addLogger(axios);
const log = debug('axios');
const name = 'page-loader';

log('booting %s', name);

export default (link, output) => {
  const requestUrl = new URL(link);
  const renamedUrl = renameFromUrl(requestUrl);
  const fileName = `${renamedUrl}.html`;
  const directoryFileName = `${renamedUrl}_files`;
  const pathToFile = path.resolve(output, fileName);
  const pathToFileDirectory = path.join(output, directoryFileName);
  let loadedData;

  return axios.get(requestUrl.toString())
    .then(({ data }) => { loadedData = data; })
    .then(() => fsp.mkdir(pathToFileDirectory))
    .then(() => {
      const { htmlData, filesUrls } = parser(loadedData, requestUrl.origin, directoryFileName);
      fsp.writeFile(pathToFile, htmlData, 'utf-8');
      return filesUrls;
    })
    .then((filesUrls) => filesUrls
      .map((fileUrl) => axios({ method: 'get', url: fileUrl, responseType: 'stream' })
        .catch((error) => {
          if (error.response?.status === 404) {
            const { url } = error.response.config;
            console.error(`Error loading file "${url}"`);
          }
        })))
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
    .then(() => `Page was successfully downloaded into ${pathToFile}`)
    .catch((error) => {
      // console.log(error);
      // console.log(process.exit(error.code));

      if (error.errno === -2) {
        return `Cannot write ${error.path}: no such file or directory '${path.parse(error.path).dir}'`;
      }
      if (error.errno === -13) {
        return `Cannot write ${error.path}: Permission denied`;
      }
      if (error.errno === -17) {
        return `Cannot write ${error.path}: a file or directory with the specified name already exists`;
      }
      if (error.response?.status === 500) {
        return 'Network error';
      }
      const url = error?.config?.url;
      return `Page ${url} not found`;
    });
};
