import path from 'path';

function domainParts(str) {
  let regexp = /^(?:[^:]+:\/\/)?([^:\/?#\[\]@]+)/;
  return str.match(regexp)[1].split(".").reverse()[1];
}

// const res = domainParts('http://ru.hexlet.ru');

// console.log(new URL('https://ru.hexlet.io/packs/js/runtime.js'));

// console.log(path.parse('https://ru.hexlet.io/packs/js/runtime'));

const first = { a: 'b' };

const second = {
  data: first.a,
};

second.data = 'c';

const link = new URL('https://jquery.com/');
const { ext } = path.parse(link.toString());
const linkWithoutExt = path
  .join(link.host, link.pathname !== '/' ? link.pathname : '')
  .replace(ext, '')
  .replace(/\W/g, '-');

console.log(link);
