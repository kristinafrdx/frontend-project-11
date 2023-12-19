export default (request) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(request.data.contents, 'application/xml');

  if (xmlDoc.querySelector('parsererror')) {
    throw new Error('Ресурс не содержит валидный RSS');
  }

  const channel = xmlDoc.querySelector('channel');
  const titleChannel = xmlDoc.querySelector('channel title').textContent;
  const descriptionChannel = xmlDoc.querySelector('channel description').textContent;
  const feed = { titleChannel, descriptionChannel };

  const itemElements = channel.getElementsByTagName('item');
  const posts = [...itemElements].map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('channel link').textContent;
    return {
      title,
      description,
      link,
    };
  });
  const parseRss = { feed, posts };
  return Promise.resolve(parseRss);
};
