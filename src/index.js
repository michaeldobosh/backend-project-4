import path from 'path';
import fsp from 'fs/promises';
import axios from 'axios';

import renameFromUrl from '../utils/renameFromUrl.js';
import parser from './parser.js';

const writeFiles = (files, filesUrls, directoryPath, domenUrl) => Promise.all(files)
  .then((responses) => {
    responses.forEach((file, i) => {
      const { ext } = path.parse(filesUrls[i]);
      if (file?.data) {
        fsp.writeFile(path.join(directoryPath, `${renameFromUrl(filesUrls[i], domenUrl)}${ext}`), file?.data, 'utf-8');
      }
    });
  });

export default (link, output) => {
  const url = new URL(link);
  const renamedUrl = renameFromUrl(url.toString(), url.origin);
  const fileName = `${renamedUrl}.html`;
  const directoryFileName = `${renamedUrl}_files`;
  const filepath = path.resolve(output, fileName);
  const directoryPath = path.join(output, directoryFileName);

  return axios.get(url.toString())
    .then(({ data }) => {
      fsp.mkdir(directoryPath);
      return data;
    })
    .then((pageData) => {
      const { htmlData, filesUrls } = parser(pageData, url.origin, directoryFileName);
      const files = filesUrls.map((fileUrl) => axios({ method: 'get', url: fileUrl, responseType: 'stream' })
        .catch((err) => console.log(err.message)));
      return { htmlData, files, filesUrls };
    })
    .then(({ htmlData, files, filesUrls }) => {
      writeFiles(files, filesUrls, directoryPath, url.origin);
      return htmlData;
    })
    .then((htmlData) => {
      fsp.writeFile(filepath, htmlData, 'utf-8');
    })
    .then(() => filepath)
    .catch((err) => console.log(err));
};
