// import axios from 'axios';
import nock from 'nock';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import os, { tmpdir } from 'node:os';
import fsp from 'fs/promises';

import pageLoader from '../src/pageLoader.js';
import pageRecorder from '../src/pageRecorder.js';
import renameFileFromUrl from '../utils/renameFileFromUrl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tmp = { link: 'https://ru.hexlet.io/courses' };
tmp.fileName = renameFileFromUrl(tmp.link);

beforeAll(async () => {
  const pathToFile = path.resolve(__dirname, '..', '__fixtures__', tmp.fileName);
  tmp.dataFile = await fsp.readFile(pathToFile, 'utf-8');
});

beforeEach(async () => {
  tmp.pathToDirectory = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
})

test('loader', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, tmp.dataFile);
    
  const { data } = await pageLoader(tmp.link);
  expect(data).toEqual(tmp.dataFile);
});

test('pageRecorder', async () => {
  const pathToFile = path.resolve(tmp.pathToDirectory, tmp.fileName);
  await pageRecorder(pathToFile, tmp.dataFile);
  const data = await fsp.readFile(pathToFile, 'utf-8');

  expect(data).toEqual(tmp.dataFile);
  expect(tmp.fileName).toEqual('ru-hexlet-io-courses.html');
});
