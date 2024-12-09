
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import * as yup from 'yup';
import buildStateWatcher from './watchers';
import parser from './parser';
import en from './languages/en';
import ru from './languages/ru';

// const corsServer = 'https://cors-anywhere.herokuapp.com/';
const updateTime = 5000;

const schema = yup.string().url().required();

const linkValidator = (channels, link) => {
  try {
    schema.notOneOf(channels).validateSync(link);
    return null;
  } catch (validationError) {
    return validationError;
  }
};

const updateFeed = (url, id, watchedState) => {
  axios
    .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      const { posts: newPosts } = parser(response.data.contents);
      const oldPosts = watchedState.posts.filter((post) => post.feedId === id);

      const parsedPosts = newPosts.map((post) => ({ ...post, feedId: id }));

      const differentPosts = _.differenceWith(parsedPosts, oldPosts, _.isEqual);

      watchedState.posts.push(...differentPosts);
    })
    .catch(() => {
      watchedState.feedLoader.errorsMessages = 'Ошибка сети';
      watchedState.feedLoader.state = 'error';
    })
    .finally(() => {
      setTimeout(() => updateFeed(url, id, watchedState), updateTime);
    });
};

function rssParce(xmlData) {
  const parser = new DOMParser();
  const data = parser.parseFromString(xmlData, 'text/xml');

  return data;
}

const loadFeed = (url, watchedState, state, rssLink) => {
  watchedState.feedLoader.state = 'loading';
  axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
    .then((response) => {
      try {
        const { title: feedTitle, posts: parsedPosts, description: feedDescription } = parser(response.data.contents);
        const feedId = _.uniqueId();

        const posts = parsedPosts.map((post) => ({ ...post, feedId }));

        state.posts.push(...posts);

        const feed = {
          link: rssLink,
          feedId,
          name: feedTitle,
          description: feedDescription,
        };

        watchedState.feeds.push(feed);
        watchedState.feedLoader.state = 'loaded';
        watchedState.form.state = 'filling';
        setTimeout(() => updateFeed(url, feedId, watchedState), updateTime);
        } catch {
          watchedState.feedLoader.errorsMessages = 'Ресурс не содержит валидный RSS';
          watchedState.feedLoader.state = 'error';
        }
    })
    .catch(() => {
      watchedState.feedLoader.errorsMessages = 'Ошибка сети';
      watchedState.feedLoader.state = 'error';
    });
};

export default () => {
  const i18nInstance = i18next.createInstance();

  i18next.init({
    lng: 'ru',
    debug: true,
    resources: {
      en,
      ru
    },
  }).then(() => {
    const state = {
      form: {
        state: 'filling',
        errorsMessages: null,
      },
      feedLoader: {
        state: 'ready',
        errorsMessages: null,
      },
      feeds: [],
      posts: [],
    };

    const watchedState = buildStateWatcher(state);

    const form = document.getElementById('rssForm');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(event.target);
      const rssLink = formData.get('url');

      const correctUrl = `${rssLink}`;

      const loadedLinks = state.feeds.map(({ link }) => link);

      const validationErrors = linkValidator(loadedLinks, rssLink);

      if (validationErrors === null) {
        watchedState.form.state = 'valid';
      } else {
        watchedState.form.errorsMessages = `validationError.${validationErrors.type}`;
        watchedState.form.state = 'invalid';
      }

      if (state.form.state === 'valid') {
        loadFeed(correctUrl, watchedState, state, rssLink);
      }
    });
  });
};
