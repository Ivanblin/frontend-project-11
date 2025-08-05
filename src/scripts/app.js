import { setupYup, validateUrl } from './validation.js';
import View from './view.js';
import { fetchRss, parseRss } from './rss.js';

const initApp = (i18nInstance) => {
  setupYup(i18nInstance);

  const state = {
    feeds: [],
    posts: [],
    form: {
      status: 'filling',
      error: null,
    },
    ui: {
      activeFeed: null,
    },
  };

  const view = new View(i18nInstance);
  view.init(state);

  view.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();

    try {
      // Валидация URL
      await validateUrl(url, state.feeds.map(feed => feed.url));
      
      // Начало загрузки
      state.form.status = 'loading';
      view.disableForm();
      
      // Загрузка и парсинг RSS
      const xmlString = await fetchRss(url);
      const { feed, posts } = parseRss(xmlString);
      
      // Генерация ID для нового фида
      const feedId = Date.now().toString();
      
      // Добавление фида
      const newFeed = {
        id: feedId,
        url,
        title: feed.title,
        description: feed.description,
      };
      state.feeds.push(newFeed);
      
      // Добавление постов
      const newPosts = posts.map(post => ({
        ...post,
        id: `${feedId}-${Date.now()}`,
        feedId,
        viewed: false,
      }));
      state.posts = [...newPosts, ...state.posts];
      
      // Успешное завершение
      state.form.status = 'added';
      state.form.error = null;
      state.ui.activeFeed = feedId;
      
      view.clearForm();
      view.render({ feeds: state.feeds, posts: state.posts });
    } catch (error) {
      state.form.status = 'error';
      state.form.error = error.message;
      
      // Обработка различных типов ошибок
      if (error.message === 'NetworkError' || error.message === 'ParseError') {
        view.showError(`errors.${error.message.toLowerCase()}`);
      } else {
        view.showError(error.message);
      }
    } finally {
      view.enableForm();
    }
  });

  view.input.addEventListener('input', () => {
    if (state.form.status === 'error') {
      view.input.classList.remove('is-invalid');
      state.form.status = 'filling';
    }
  });
};

export default initApp;