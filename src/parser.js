import * as cheerio from 'cheerio';
// import fs from 'fs';
// import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

import renameFromUrl from '../utils/renameFromUrl.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const filePath = path.resolve(__dirname, '..', '__fixtures__', 'ru-hexlet-io-courses-before.html');

// const data = fs.readFileSync(filePath);

export default (htmlData, domenUrl, directory) => {
  const hostParts = domenUrl.split('.');
  const hostZone = hostParts.pop();
  const hostDomen = hostParts.pop();
  const hostName = `${hostDomen}.${hostZone}`;

  const $ = cheerio.load(htmlData);
  const $img = $('img');
  // console.log($img.attr('src'));
  const filesUrls = [];
  $img
    .filter((i, { attribs: { src } }) => !src.includes('http') || src.includes(hostName))
    .each((i, el) => {
      const linkWithDomen = !el.attribs.src.includes('http') ? `${domenUrl}${el.attribs.src}` : el.attribs.src;
      filesUrls.push(linkWithDomen);
      const { ext } = path.parse($img.attr('src'));
      el.attribs.src = `${directory}/${renameFromUrl(linkWithDomen, domenUrl)}${ext}`;
    });

  return { htmlData: $.html(), filesUrls };
};

// console.log(new URL('https://ru.hexlet.io/courses'))
// parser(data, 'https://ru.hexlet.io', 'ru-hexlet-io-courses_files');
