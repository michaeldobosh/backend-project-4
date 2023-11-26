import path from 'path';
import fsp from 'fs/promises';
import axios from 'axios';
import debug from 'debug';
import axiosLogger from 'axios-debug-log';

import renameFromUrl from '../utils/renameFromUrl.js';
import parser from './parser.js';

const log = debug('http');
const name = 'page-loader';

log('booting %s', name);

export default (link, output) => {
  const requestUrl = new URL(link);
  const renamedUrl = renameFromUrl(requestUrl);
  const fileName = `${renamedUrl}.html`;
  const directoryFileName = `${renamedUrl}_files`;
  const pathToFile = path.resolve(output, fileName);
  const pathToFileDirectory = path.join(output, directoryFileName);

  return axios.get(requestUrl.toString())
    .catch((error) => {
      if (error.response.status === 404) {
        const { url } = error.response.config;
        throw new Error(`Page ${url} not found`);
      }
      if (error.response.status === 500) {
        throw new Error('Network error');
      }
      throw new Error('Error, try again');
    })
    .then(({ data }) => {
      const { htmlData, filesUrls } = parser(data, requestUrl.origin, directoryFileName);
      fsp.mkdir(pathToFileDirectory);
      return { htmlData, filesUrls };
    })
    .then(({ htmlData, filesUrls }) => {
      fsp.writeFile(pathToFile, htmlData, 'utf-8');
      return filesUrls.map((fileUrl) => axios({ method: 'get', url: fileUrl, responseType: 'stream' })
        .catch((error) => {
          if (error.response.status === 404) {
            const { url } = error.response.config;
            console.log(`Error loading file "${url}"`);
          }
        }));
    })
    .catch(() => {
      throw new Error('Data writing error');
    })
    .then((requests) => Promise.all(requests))
    .then((responses) => {
      responses.forEach((respons) => {
        if (respons?.status === 200) {
          const { url } = respons.config;
          fsp.writeFile(path.join(pathToFileDirectory, renameFromUrl(new URL(url))), respons.data);
        }
      });
    })
    .then(() => `Page was successfully downloaded into ${pathToFile}`)
    .catch((error) => error.message);
};
