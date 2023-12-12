export default (response) => {
  const parseRss = response.then((resp) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(resp.data.contents, 'application/xml');
  });
  return parseRss;
};
