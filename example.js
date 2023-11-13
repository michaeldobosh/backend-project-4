import path from 'path';

function domainParts(str) {
  let regexp = /^(?:[^:]+:\/\/)?([^:\/?#\[\]@]+)/;
  return str.match(regexp)[1].split(".").reverse()[1];
}

const res = domainParts('http://ru.hexlet.ru');

console.log(new URL('/hess/hi.png', '/hess/hi.png').toString());
