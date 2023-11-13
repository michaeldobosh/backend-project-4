import path from 'path';
import fsp from 'fs/promises';
import axios from 'axios';

import renameFromUrl from '../utils/renameFromUrl.js';
import parser from './parser.js';

export default (link, output) => {
  const url = new URL(link);
  const renamedUrl = renameFromUrl(url.toString());
  const fileName = `${renamedUrl}.html`;
  const directoryFileName = `${renamedUrl}_files`;
  const filepath = path.resolve(output, fileName);
  const pathToFileDirectory = path.join(output, directoryFileName);
  let urls;

  return axios.get(url.toString())
    .then(({ data }) => {
      const { htmlData, filesUrls } = parser(data, url.origin, directoryFileName);
      urls = filesUrls;
      fsp.mkdir(pathToFileDirectory);
      return htmlData;
    })
    .then((htmlData) => {
      fsp.writeFile(filepath, htmlData, 'utf-8');
      const requests = urls.map((fileUrl) => axios({ method: 'get', url: fileUrl, responseType: 'stream' }));
      return requests;
    })
    .then((requests) => Promise.all(requests))
    .then((responses) => {
      responses.forEach((respons, i) => {
        const { ext } = path.parse(urls[i]);
        if (respons?.data) {
          fsp.writeFile(path.join(pathToFileDirectory, `${renameFromUrl(urls[i])}${ext}`), respons.data);
        }
      });
    })
    .then(() => filepath)
    .catch((err) => console.log(err.message));
};
