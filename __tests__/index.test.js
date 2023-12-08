import nock from 'nock';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { tmpdir } from 'node:os';
import fsp from 'fs/promises';
import debug from 'debug';

import pageLoader from '../src/index.js';

const log = debug('nock');
const name = 'page-loader';

log('booting %s', name);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tmp = {
  base: 'https://ru.hexlet.io',
  url: {
    courses: '/courses',
    img: '/assets/professions/nodejs.png',
    css: '/assets/application.css',
    js: '/packs/js/runtime.js',
    arbitraryUrl: '/arbitrary',
  },
  fileName: 'ru-hexlet-io-courses.html',
  fileNameWithChanges: 'ru-hexlet-io-courses-after.html',
  fileDirectoryName: 'ru-hexlet-io-courses_files',
  imgFileName: 'ru-hexlet-io-assets-professions-nodejs.png',
  cssFileName: 'ru-hexlet-io-assets-application.css',
  jsFileName: 'ru-hexlet-io-packs-js-runtime.js',
  wrongFileName: 'cdn2-hexlet-io-assets-menu.css',
  fileDirectoryNameArbitrary: 'ru-hexlet-io-arbitrary_files',
  pathToFixtures: path.resolve(__dirname, '..', '__fixtures__'),
};

beforeAll(async () => {
  const pathToFile = path.join(tmp.pathToFixtures, tmp.fileName);
  tmp.dataFile = await fsp.readFile(pathToFile, 'utf-8');

  const pathToAfter = path.join(tmp.pathToFixtures, tmp.fileNameWithChanges);
  tmp.dataFileWithChanges = await fsp.readFile(pathToAfter, 'utf-8');

  tmp.imgFile = await fsp.readFile(path.join(tmp.pathToFixtures, tmp.imgFileName));
  tmp.cssFile = await fsp.readFile(path.join(tmp.pathToFixtures, tmp.cssFileName));
  tmp.jsFile = await fsp.readFile(path.join(tmp.pathToFixtures, tmp.jsFileName));
});

beforeEach(async () => {
  tmp.pathToDirectory = await fsp.mkdtemp(path.join(tmpdir(), 'page-loader-'));
  tmp.pathToFileDirectory = path.join(tmp.pathToDirectory, tmp.fileDirectoryName);

  nock(tmp.base).get(tmp.url.courses).reply(200, tmp.dataFile)
    .get(tmp.url.courses)
    .reply(200, tmp.dataFile)
    .get(tmp.url.courses)
    .reply(200, tmp.dataFile)
    .get(tmp.url.img)
    .reply(200, tmp.imgFile)
    .get(tmp.url.css)
    .reply(200, tmp.cssFile)
    .get(tmp.url.js)
    .reply(200, tmp.jsFile)
    .get(tmp.url.arbitraryUrl)
    .reply(200, tmp.dataFile);

  await pageLoader(`${tmp.base}${tmp.url.courses}`, tmp.pathToDirectory);
});

test('parsing', async () => {
  const pathToFile = path.join(tmp.pathToDirectory, tmp.fileName);
  const dataFile = await fsp.readFile(pathToFile, 'utf-8');
  expect(dataFile).toEqual(tmp.dataFileWithChanges);
});

test('downloadingFiles', async () => {
  const dir = await fsp.readdir(tmp.pathToFileDirectory);

  expect(dir.includes(tmp.imgFileName)).toBeTruthy();
  expect(dir.includes(tmp.cssFileName)).toBeTruthy();
  expect(dir.includes(tmp.jsFileName)).toBeTruthy();
  expect(dir.includes(tmp.wrongFileName)).toBeFalsy();
});

test('non existent premissions to write', async () => {
  await fsp.chmod(tmp.pathToDirectory, '555');
  await expect(pageLoader(`${tmp.base}${tmp.url.arbitraryUrl}`, tmp.pathToDirectory))
    .rejects.toThrow('permission denied');
});

test('non existent path', async () => {
  await expect(pageLoader(`${tmp.base}${tmp.url.arbitraryUrl}`, 'non-existent-directory'))
    .rejects.toThrow('no such file or directory');
});

test('no response', async () => {
  nock(tmp.base).get(tmp.url.courses).reply(504);
  await expect(pageLoader(`${tmp.base}${tmp.url.courses}`, tmp.pathToDirectory))
    .rejects.toThrow('Request failed with status code 504');
});
