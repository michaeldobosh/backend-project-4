import * as cheerio from 'cheerio';
import path from 'path';

import renameFromUrl from '../utils/renameFromUrl.js';

export default (htmlData, host, directory) => {
  const $ = cheerio.load(htmlData);
  const $img = $('img');
  const $link = $('link');
  const $script = $('script');
  const filesUrls = [];

  const changeHtmlCode = (i, el) => {
    const url = el.attribs?.href ? el.attribs.href : el.attribs.src;
    const fullUrl = new URL(url, host);
    filesUrls.push(fullUrl.toString());

    const pathToFile = path.parse(url).ext
      ? path.join(directory, renameFromUrl(fullUrl))
      : `${directory}/${renameFromUrl(fullUrl)}.html`;
    if (el.attribs?.href) {
      el.attribs.href = pathToFile;
    } else {
      el.attribs.src = pathToFile;
    }
  };

  $img
    .filter((i, { attribs: { src } }) => src && (!src?.includes('http') || src.includes(host)))
    .each(changeHtmlCode);
  $link
    .filter((i, { attribs: { href } }) => href && (!href?.includes('http') || href.includes(host)))
    .each(changeHtmlCode);
  $script
    .filter((i, { attribs: { src } }) => src && (!src?.includes('http') || src.includes(host)))
    .each(changeHtmlCode);

  return { htmlData: $.html(), filesUrls };
};
