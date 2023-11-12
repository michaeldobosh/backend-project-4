import path from 'path';

export default (link, domenUrl) => {
  const changedDomen = new URL(link);
  const normalizeUrl = `${domenUrl}${changedDomen.pathname}`;
  const { dir, name } = path.parse(normalizeUrl);
  const url = path.join(dir.split('//')[1], name);

  const regExp = new RegExp('[\.\/]', 'g');
  const fileName = url.replace(regExp, '-');
  return fileName;
};
