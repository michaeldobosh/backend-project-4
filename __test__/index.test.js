import nock from 'nock';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { tmpdir } from 'node:os';
import fsp from 'fs/promises';

import pageLoader from '../src/index.js';
import renameFromUrl from '../utils/renameFromUrl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tmp = { link: 'https://ru.hexlet.io/courses' };
tmp.fileName = `${renameFromUrl(tmp.link, 'https://ru.hexlet.io')}.html`;
tmp.fileDirectoryName = `${renameFromUrl(tmp.link, 'https://ru.hexlet.io')}_files`;
tmp.pathToFixtures = path.resolve(__dirname, '..', '__fixtures__');

beforeAll(async () => {
  const pathToFile = path.join(tmp.pathToFixtures, tmp.fileName);
  tmp.dataFile = await fsp.readFile(pathToFile, 'utf-8');

  const pathToAfter = path.join(tmp.pathToFixtures, `${renameFromUrl(tmp.link, 'https://ru.hexlet.io')}-after.html`);
  tmp.dataAfter = await fsp.readFile(pathToAfter, 'utf-8');
});

beforeEach(async () => {
  tmp.pathToDirectory = await fsp.mkdtemp(path.join(tmpdir(), 'page-loader-'));
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, tmp.dataFile);

  await pageLoader(tmp.link, tmp.pathToDirectory);
});

test('pathName', () => {
  const pathName = path.resolve(tmp.pathToDirectory, tmp.fileName);
  expect(pathName).toEqual(`${tmp.pathToDirectory}/ru-hexlet-io-courses.html`);
});

test('pageLoader/htmlChanges', async () => {
  const pathToFile = path.join(tmp.pathToDirectory, tmp.fileName);
  const data = await fsp.readFile(pathToFile, 'utf-8');
  expect(data).toEqual(tmp.dataAfter);
});

test('downloadingImages', async () => {
  const pathToFileDirectory = path.resolve(tmp.pathToDirectory, tmp.fileDirectoryName);
  const dir = await fsp.readdir(tmp.pathToDirectory);
  const dir2 = await fsp.readdir(pathToFileDirectory);

  console.log('Open main directory: ', dir);
  console.log('Open files directory (ru-hexlet-io-courses_files): ', dir2);

  expect('aaa').toEqual('ru-hexlet-io-assets-experts-mokevnin-e24b0edf2c468a90e04c8a94f6fce444693e3c8fddc4b81969776e4bb8e64df6.png');
});
