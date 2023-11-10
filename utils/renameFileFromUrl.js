export default (link) => {
  const url = new URL(link);
  const regExp = new RegExp('[\.\/]', 'g');
  const fileName = `${(url.host + url.pathname).replace(regExp, '-')}.html`;
  return fileName;
}




