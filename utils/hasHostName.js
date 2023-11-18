export default (link, host) => (new URL(link, host).toString()).includes(host);
