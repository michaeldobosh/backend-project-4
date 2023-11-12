import * as cheerio from 'cheerio';
import path from 'path';

import renameFromUrl from '../utils/renameFromUrl.js';

export default (htmlData, domenUrl, directory) => {
  const hostParts = domenUrl.split('.');
  const hostZone = hostParts.pop();
  const hostDomen = hostParts.pop();
  const hostName = `${hostDomen}.${hostZone}`;

  const $ = cheerio.load(htmlData);
  const $img = $('img');
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
