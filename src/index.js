import path from 'path';
import pageLoader from './pageLoader.js';
import pageRecorder from './pageRecorder.js';

export default (url, output) => {
  let filepath;
  return pageLoader(url)
    .then(({ data, fileName}) => {
      filepath = path.resolve(output, fileName)
      pageRecorder(filepath, data);
    })
    .then(() => filepath);
};

// сюда перенести изменение имени файла и запись в файл, удалить pageRecorder
