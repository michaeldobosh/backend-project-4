import * as cheerio from 'cheerio';
import path from 'path';
import _ from 'lodash';

import renameFromUrl from '../utils/renameFromUrl.js';

const hasHostName = (link, host) => (new URL(link, host).toString()).includes(host);

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

    const pathToFile = path.join(directory, renameFromUrl(fullUrl));
    if (el.attribs?.href) {
      el.attribs.href = pathToFile; // eslint-disable-line no-param-reassign
    } else {
      el.attribs.src = pathToFile; // eslint-disable-line no-param-reassign
    }
  };

  $img
    .filter((_i, { attribs: { src } }) => src && hasHostName(src, host))
    .each(changeHtmlCode);
  $link
    .filter((_i, { attribs: { href } }) => href && hasHostName(href, host))
    .each(changeHtmlCode);
  $script
    .filter((_i, { attribs: { src } }) => src && hasHostName(src, host))
    .each(changeHtmlCode);

  const urls = _.uniq(filesUrls);
  return { htmlData: $.html(), urls };
};
