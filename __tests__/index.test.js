import nock from 'nock';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { tmpdir } from 'node:os';
import fsp from 'fs/promises';

import pageLoader from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tmp = {
  base: 'https://ru.hexlet.io',
  url: {
    courses: '/courses',
    img: '/assets/professions/nodejs.png',
    css: '/assets/application.css',
    js: '/packs/js/runtime.js',
  },
  htmlFileName: 'ru-hexlet-io-courses.html',
  htmlFixtureName: 'ru-hexlet-io-courses-after.html',
  getFixturePath: (filename) => path.resolve(__dirname, '..', '__fixtures__', filename),
};

beforeAll(async () => {
  tmp.loadedHtml = await fsp.readFile(tmp.getFixturePath(tmp.htmlFileName), 'utf-8');

  tmp.htmlFixture = await fsp.readFile(tmp.getFixturePath(tmp.htmlFixtureName), 'utf-8');
  tmp.imgFixture = await fsp.readFile(tmp.getFixturePath('ru-hexlet-io-assets-professions-nodejs.png'));
  tmp.cssFixture = await fsp.readFile(tmp.getFixturePath('ru-hexlet-io-assets-application.css'));
  tmp.jsFixture = await fsp.readFile(tmp.getFixturePath('ru-hexlet-io-packs-js-runtime.js'));
});

beforeEach(async () => {
  nock.cleanAll();
  tmp.downloadDirectory = await fsp.mkdtemp(path.join(tmpdir(), 'page-loader-'));
  tmp.fileDirectory = path.join(tmp.downloadDirectory, 'ru-hexlet-io-courses_files');
});

test('parsing/downloadingFiles', async () => {
  nock(tmp.base).persist().get(tmp.url.courses).reply(200, tmp.loadedHtml);
  nock(tmp.base).get(tmp.url.img).reply(200, tmp.imgFixture);
  nock(tmp.base).get(tmp.url.css).reply(200, tmp.cssFixture);
  nock(tmp.base).get(tmp.url.js).reply(200, tmp.jsFixture);

  await pageLoader(`${tmp.base}${tmp.url.courses}`, tmp.downloadDirectory);

  const htmlFilePath = path.join(tmp.downloadDirectory, tmp.htmlFileName);
  const imgFilePath = path.join(tmp.fileDirectory, 'ru-hexlet-io-assets-professions-nodejs.png');
  const cssFilePath = path.join(tmp.fileDirectory, 'ru-hexlet-io-assets-application.css');
  const jslFilePath = path.join(tmp.fileDirectory, 'ru-hexlet-io-packs-js-runtime.js');

  expect(await fsp.readFile(htmlFilePath, 'utf-8')).toEqual(tmp.htmlFixture);
  expect(await fsp.readFile(imgFilePath)).toEqual(tmp.imgFixture);
  expect(await fsp.readFile(cssFilePath)).toEqual(tmp.cssFixture);
  expect(await fsp.readFile(jslFilePath)).toEqual(tmp.jsFixture);

  const downloadedFiles = await fsp.readdir(tmp.fileDirectory);
  expect(downloadedFiles.includes('cdn2-hexlet-io-assets-menu.css')).toBeFalsy();
});

test('non existent premissions to write', async () => {
  nock(tmp.base).get(tmp.url.courses).reply(200, tmp.dataFile);
  await fsp.chmod(tmp.downloadDirectory, '555');
  await expect(pageLoader(`${tmp.base}${tmp.url.courses}`, tmp.downloadDirectory))
    .rejects.toThrow('permission denied');
});

test('non existent path', async () => {
  nock(tmp.base).get(tmp.url.courses).reply(200, tmp.dataFile);
  await expect(pageLoader(`${tmp.base}${tmp.url.courses}`, 'non-existent-directory'))
    .rejects.toThrow('no such file or directory');
});

test('no response', async () => {
  nock(tmp.base).get(tmp.url.courses).reply(404, tmp.dataFile);
  nock(tmp.base).get(tmp.url.img).reply(404, tmp.imgFixture);
  await expect(pageLoader(`${tmp.base}${tmp.url.courses}`, tmp.downloadDirectory))
    .rejects.toThrow('Request failed with status code 404');
});
