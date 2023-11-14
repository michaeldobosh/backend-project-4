import path from 'path';

export default (link) => {
  const { ext } = path.parse(link.toString());
  const linkWithoutExt = path
    .join(link.host, link.pathname)
    .replace(ext, '')
    .replace(/\W/g, '-');
  return `${linkWithoutExt}${ext}`;
};
