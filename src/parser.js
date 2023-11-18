import * as cheerio from 'cheerio';
import path from 'path';

import renameFromUrl from '../utils/renameFromUrl.js';
import hasHostName from '../utils/hasHostName.js';

export default (htmlData, host, directory) => {
  const $ = cheerio.load(htmlData);
  const $img = $('img');
  const $link = $('link');
  const $script = $('script');
  const filesUrls = [];

  const changeHtmlCode = (i, el) => {
    const url = el.attribs?.href ? el.attribs.href : el.attribs.src;
    const isFile = path.parse(url).ext;
    const fullUrl = new URL(url, host);
    if (isFile) {
      filesUrls.push(fullUrl.toString());
    }

    const pathToFile = isFile
      ? path.join(directory, renameFromUrl(fullUrl))
      : `${directory}/${renameFromUrl(fullUrl)}.html`;
    if (el.attribs?.href) {
      el.attribs.href = pathToFile;
    } else {
      el.attribs.src = pathToFile;
    }
  };

  $img
    .filter((_i, { attribs: { src } }) => hasHostName(src, host))
    .each(changeHtmlCode);
  $link
    .filter((_i, { attribs: { href } }) => hasHostName(href, host))
    .each(changeHtmlCode);
  $script
    .filter((_i, { attribs: { src } }) => hasHostName(src, host))
    .each(changeHtmlCode);

  return { htmlData: $.html(), filesUrls };
};
