export default (data) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, 'application/xml');
};
