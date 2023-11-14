import path from 'path';
import fsp from 'fs/promises';
import axios from 'axios';
import _ from 'lodash';

import renameFromUrl from '../utils/renameFromUrl.js';
import parser from './parser.js';

export default (link, output) => {
  const requestUrl = new URL(link);
  const renamedUrl = renameFromUrl(requestUrl.toString());
  const fileName = `${renamedUrl}.html`;
  const directoryFileName = `${renamedUrl}_files`;
  const filepath = path.resolve(output, fileName);
  const pathToFileDirectory = path.join(output, directoryFileName);

  return axios.get(requestUrl.toString())
    .then(({ data }) => {
      const { htmlData, filesUrls } = parser(data, requestUrl.origin, directoryFileName);
      fsp.mkdir(pathToFileDirectory);
      return { htmlData, filesUrls };
    })
    .then(({ htmlData, filesUrls }) => {
      fsp.writeFile(filepath, htmlData, 'utf-8');
      return filesUrls.map((fileUrl) => axios({ method: 'get', url: fileUrl, responseType: 'stream' }).catch(_.noop));
    })
    .then((requests) => Promise.all(requests))
    .then((responses) => {
      responses.forEach((respons) => {
        if (respons) {
          const { url } = respons.config;
          const { ext } = path.parse(url);
          fsp.writeFile(path.join(pathToFileDirectory, `${renameFromUrl(url)}${ext}`), respons.data);
        }
      });
    })
    .then(() => filepath)
    .catch((err) => console.log(err.message));
};
