import path from 'path';

export default (link) => {
  const { ext } = path.parse(link.toString());
  const isMain = link.pathname === '/';
  const linkWithoutExt = path
    .join(link.host, isMain ? '' : link.pathname)
    .replace(ext, '')
    .replace(/\W/g, '-');
  return `${linkWithoutExt}${isMain ? '' : ext}`;
};
