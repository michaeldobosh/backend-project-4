import * as cheerio from 'cheerio';
import path from 'path';

import renameFromUrl from '../utils/renameFromUrl.js';

export default (htmlData, host, directory) => {
  const $ = cheerio.load(htmlData);
  const $img = $('img');
  const filesUrls = [];
  $img
    .filter((i, { attribs: { src } }) => !src.includes('http') || src.includes(host))
    .each((i, el) => {
      const fullUrl = new URL(el.attribs.src, host);
      filesUrls.push(fullUrl.toString());
      const { ext } = path.parse($img.attr('src'));
      el.attribs.src = `${directory}/${renameFromUrl(fullUrl.toString())}${ext}`;
    });

  return { htmlData: $.html(), filesUrls };
};
