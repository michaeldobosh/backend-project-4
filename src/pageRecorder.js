import fsp from 'fs/promises';

export default async (pathToFile, data) => {
  await fsp.writeFile(pathToFile, data, 'utf-8');
}
