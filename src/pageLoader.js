import axios from 'axios';
import renameFileFromUrl from '../utils/renameFileFromUrl.js';

export default async (url) => {
  const { data } = await axios.get(url);
  const fileName = renameFileFromUrl(url);
  return { data, fileName };
  
}