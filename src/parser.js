
const dataParser = (data) => {
  const parser = new DOMParser();

  const feedData = parser.parseFromString(data, 'text/xml');

  const parsererrors = feedData.querySelector('parsererror');

  if (parsererrors !== null) {
    const error = parsererrors.textContent;
    throw new Error(error);
  }

  const feedTitle = feedData.querySelector('channel title').textContent;
  const feedDescription = feedData.querySelector('channel description').textContent;
  const items = feedData.querySelectorAll('channel item');

  const posts = [...items].map((singlePost) => {
    const postTitle = singlePost.querySelector('title').textContent;
    const singlePostLink = singlePost.querySelector('link').textContent;
    const singlePostDescription = singlePost.querySelector('description').textContent;
    const singlePostPubDate = singlePost.querySelector('pubDate').textContent;

    const post = {
      title: postTitle,
      link: singlePostLink,
      description: singlePostDescription,
      pubDate: singlePostPubDate,
    };

    return post;
  });
  return { title: feedTitle, posts, description: feedDescription };
};

export default dataParser;
