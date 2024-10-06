import * as yup from 'yup';
import buildStateWatcher from './watchers';

const schema = yup.string().url().required();
console.log('schema: ', schema);

const linkValidator = (channels, link) => {
  try {
    schema.notOneOf(channels).validateSync(link);
    return null;
  } catch (validationError) {
    return validationError;
  }
};

export default () => {
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
  console.log('form: ', form)

  form.addEventListener('submit', (even) => {
    even.preventDefault()
    console.log('submit');

    const formData = new FormData(event.target);
    const rssLink = formData.get('url');
    console.log('rssLink: ', rssLink)

    const loadedLinks = state.feeds.map(({ link }) => link);

    const validationErrors = linkValidator(loadedLinks, rssLink);
    console.log('validationErrors: ', validationErrors)

    if (validationErrors === null) {
      watchedState.form.state = 'valid';
    } else {
      watchedState.form.errorsMessages = `validationError.${validationErrors.type}`;
      watchedState.form.state = 'invalid';
    }
  })
}
