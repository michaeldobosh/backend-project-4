import * as cheerio from 'cheerio';
import path from 'path';
import _ from 'lodash';

import renameFromUrl from '../utils/renameFromUrl.js';

const hasHostName = (link, host) => (new URL(link, host).toString()).includes(host);

const getLink = (htmlElement) => (htmlElement.attribs?.href
  ? htmlElement.attribs.href
  : htmlElement.attribs.src);

const changeHtmlCode = (el, directory, host) => {
  const fullUrl = new URL(getLink(el), host);
  const pathToFile = path.join(directory, renameFromUrl(fullUrl));
  if (el.attribs?.href) {
    el.attribs.href = pathToFile; // eslint-disable-line no-param-reassign
  } else {
    el.attribs.src = pathToFile; // eslint-disable-line no-param-reassign
  }
};

export default (htmlData, host, directory) => {
  const $ = cheerio.load(htmlData);
  const $elements = $('img, script, link');
  const fileUrls = [];

  $elements
    .filter((_i, el) => (el.attribs.src || el.attribs.href) && hasHostName(getLink(el), host))
    .each((_i, el) => fileUrls.push(new URL(getLink(el), host).toString()))
    .each((_i, el) => changeHtmlCode(el, directory, host));

  return { htmlData: $.html(), urls: _.uniq(fileUrls) };
};
