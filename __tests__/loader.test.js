import axios from 'axios';
import path from 'node:path';
import fsp from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const url = new URL('https://page-loader.hexlet.repl.co');
const fileName = `${url.toString().replaceAll('.', '-').split('//')[1]}.html`;
const filePath = path.resolve(__dirname, '..', 'page-loader', fileName);

beforeEach( async () => {
  const data = await axios.get(url.toString());
  console.log(data);
  await fsp.writeFile(filePath, data);
});

test('loader', async () => {
  const res = await fsp.readFile(filePath, 'utf-8');
  console.log(res);
  expect(res).toEqual('Hello World!');
})