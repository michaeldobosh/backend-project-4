import * as cheerio from 'cheerio';
import path from 'path';

import renameFromUrl from '../utils/renameFromUrl.js';

export default (htmlData, host, directory) => {
  const $ = cheerio.load(htmlData);
  const $img = $('img');
  const $link = $('link');
  const $script = $('script');
  const filesUrls = [];

  $img
    .filter((i, { attribs: { src } }) => src && (!src?.includes('http') || src.includes(host)))
    .each((i, el) => {
      const fullUrl = new URL(el.attribs.src, host);
      filesUrls.push(fullUrl.toString());
      const { ext } = path.parse(el.attribs.src);
      el.attribs.src = `${directory}/${renameFromUrl(fullUrl.toString())}${ext}`;
    });
  $link
    .filter((i, { attribs: { href } }) => href && (!href?.includes('http') || href.includes(host)))
    .filter((i, { attribs: { href } }) => path.parse(href).ext)
    .each((i, el) => {
      const fullUrl = new URL(el.attribs.href, host);
      filesUrls.push(fullUrl.toString());
      const { ext } = path.parse(el.attribs.href);
      el.attribs.href = `${directory}/${renameFromUrl(fullUrl.toString())}${ext}`;
    });
  $link
    .filter((i, { attribs: { href } }) => href && (!href?.includes('http') || href.includes(host)))
    .filter((i, { attribs: { href } }) => !path.parse(href).ext)
    .each((i, el) => {
      const fullUrl = new URL(el.attribs.href, host);
      el.attribs.href = `${directory}/${renameFromUrl(fullUrl.toString())}.html`;
    });
  $script
    .filter((i, { attribs: { src } }) => src && (!src?.includes('http') || src.includes(host)))
    .each((i, el) => {
      const fullUrl = new URL(el.attribs.src, host);
      filesUrls.push(fullUrl.toString());
      const { ext } = path.parse(el.attribs.src);
      el.attribs.src = `${directory}/${renameFromUrl(fullUrl.toString())}${ext}`;
    });

  return { htmlData: $.html(), filesUrls };
};
