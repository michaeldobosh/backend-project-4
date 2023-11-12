import path from 'path';

function domainParts(str) {
  let regexp = /^(?:[^:]+:\/\/)?([^:\/?#\[\]@]+)/;
  return str.match(regexp)[1].split(".").reverse()[1];
}

const res = domainParts('http://ru.hexlet.ru');

['a', 'b'].forEach((el, i) => console.log(i))

console.log(new URL('https://cdn2.hexlet.io/assets/flag-ru-cbc8b7f126679346ce42aa727144c020bd7d33be1accb60b49c6c5cccde7cbee.svg'))
