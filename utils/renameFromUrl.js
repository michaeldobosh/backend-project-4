import path from 'path';

export default (link) => {
  const { ext } = path.parse(link.toString());
  return path
    .join(link.host, link.pathname)
    .replace(ext, '')
    .replace(/\W/g, '-');
};
