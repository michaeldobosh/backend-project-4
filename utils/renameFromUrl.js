import path from 'path';

export default (link) => {
  const { dir, name } = path.parse(link);
  const linkWithoutExt = path.join(dir.split('//')[1], name);

  const regExp = new RegExp('[\.\/]', 'g');
  const fileName = linkWithoutExt.replace(regExp, '-');
  return fileName;
};
