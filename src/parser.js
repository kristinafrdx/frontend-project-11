export default (response) => {
  const parseRss = response
 .then((resp) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(resp.data.contents, 'application/xml');
    const feeds = xmlDoc.querySelector('rss')
    console.log(xmlDoc.querySelector('rss'))
    return feeds
    // return xmlDoc;
  });
  return parseRss;
};
