import validateUrl from './validation.js';
import View from './view.js';

const app = () => {
  const state = {
    feeds: [],
    form: {
      status: 'filling',
      error: null,
    },
  };

  const view = new View();
  view.init();

  view.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();

    try {
      await validateUrl(url, state.feeds.map(feed => feed.url));
      
      // Добавление нового фида
      state.feeds.push({ url });
      state.form.status = 'added';
      state.form.error = null;
      
      view.clearForm();
    } catch (error) {
      state.form.status = 'error';
      state.form.error = error.message;
      view.showError(error.message);
    }
  });

  // Сброс ошибки при вводе
  view.input.addEventListener('input', () => {
    if (state.form.status === 'error') {
      view.input.classList.remove('is-invalid');
      state.form.status = 'filling';
    }
  });
};

export default app;