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
    timers: {},
  };

  const view = new View(i18nInstance);
  view.init(state);

  // Функция для добавления новых постов
  const addNewPosts = (newPosts, feedId) => {
    const existingLinks = new Set(state.posts.map(post => post.link));
    const uniqueNewPosts = newPosts.filter(post => !existingLinks.has(post.link));

    if (uniqueNewPosts.length === 0) return [];

    const postsWithMeta = uniqueNewPosts.map(post => ({
      ...post,
      id: `${feedId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      feedId,
      viewed: false,
    }));

    state.posts = [...postsWithMeta, ...state.posts];
    return postsWithMeta;
  };

  // Функция обновления фида
  const updateFeed = async (feedId) => {
    const feed = state.feeds.find(f => f.id === feedId);
    if (!feed) return;

    try {
      const xmlString = await fetchRss(feed.url);
      const { posts: newPosts } = parseRss(xmlString);
      const addedPosts = addNewPosts(newPosts, feedId);

      if (addedPosts.length > 0) {
        // Сохраняем состояние просмотра перед обновлением
        const viewedLinks = new Set();
        state.posts.forEach(post => {
          if (post.viewed) viewedLinks.add(post.link);
        });

        // Обновляем состояние для новых постов
        state.posts.forEach(post => {
          if (viewedLinks.has(post.link)) {
            post.viewed = true;
          }
        });

        view.renderPosts(state.posts);
      }
    } catch (error) {
      console.error(`Ошибка обновления фида ${feedId}:`, error);
    } finally {
      // Планируем следующее обновление через 5 секунд
      state.timers[feedId] = setTimeout(() => updateFeed(feedId), 5000);
    }
  };

  // Запуск периодического обновления
  const startFeedUpdates = (feedId) => {
    // Останавливаем предыдущий таймер, если был
    if (state.timers[feedId]) {
      clearTimeout(state.timers[feedId]);
    }
    // Первый запуск сразу
    updateFeed(feedId);
  };

  // Обработчик отправки формы
  view.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();

    try {
      // Валидация
      await validateUrl(url, state.feeds.map(feed => feed.url));
      state.form.status = 'loading';
      view.disableForm();

      // Загрузка данных
      const xmlString = await fetchRss(url);
      const { feed, posts } = parseRss(xmlString);
      
      // Создание фида
      const feedId = Date.now().toString();
      const newFeed = {
        id: feedId,
        url,
        title: feed.title,
        description: feed.description,
      };
      
      // Добавление фида и постов
      state.feeds.push(newFeed);
      const newPosts = posts.map(post => ({
        ...post,
        id: `${feedId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        feedId,
        viewed: false,
      }));
      state.posts = [...newPosts, ...state.posts];
      
      // Обновление UI
      state.form.status = 'added';
      state.form.error = null;
      view.clearForm();
      view.render({ feeds: state.feeds, posts: state.posts });
      
      // Запуск отслеживания обновлений
      startFeedUpdates(feedId);
      view.showSuccess('RSS успешно загружен');
    } catch (error) {
      state.form.status = 'error';
      state.form.error = error.message;
      
      if (error.name === 'NetworkError' || error.name === 'ParseError') {
        view.showError(`errors.${error.name.toLowerCase()}`);
      } else {
        view.showError(error.message);
      }
    } finally {
      view.enableForm();
    }
  });

  // Сброс ошибки при вводе
  view.input.addEventListener('input', () => {
    if (state.form.status === 'error') {
      view.input.classList.remove('is-invalid');
      state.form.status = 'filling';
    }
  });

  view.postsContainer.addEventListener('click', (e) => {
    // Обработка клика на ссылке
    const postLink = e.target.closest('a');
    if (postLink) {
      const postId = postLink.dataset.id;
      const post = state.posts.find(p => p.id === postId);
      
      if (post) {
        post.viewed = true;
        postLink.classList.remove('fw-bold');
        postLink.classList.add('fw-normal', 'link-secondary');
      }
    }
    
    // Обработка кнопки предпросмотра
    const previewButton = e.target.closest('button[data-id]');
    if (previewButton) {
      const postId = previewButton.dataset.id;
      const post = state.posts.find(p => p.id === postId);
      
      if (post) {
        // Помечаем пост как просмотренный
        post.viewed = true;
        
        // Обновляем UI
        const postElement = previewButton.closest('li');
        const postLink = postElement.querySelector('a');
        if (postLink) {
          postLink.classList.remove('fw-bold');
          postLink.classList.add('fw-normal', 'link-secondary');
        }
        
        // Показываем модальное окно
        view.showPostModal(post);
      }
    }
  });
};

export default initApp;