import axios from 'axios';

export default (url) => axios.get(url).then(({ data }) => data);
