export default class View {
  constructor(i18nInstance) {
    this.i18n = i18nInstance;
    this.form = document.querySelector('.rss-form');
    this.input = document.getElementById('url-input');
    this.feedback = document.querySelector('.feedback');
    this.feedsContainer = document.querySelector('.feeds');
    this.postsContainer = document.querySelector('.posts');
    this.submitButton = this.form.querySelector('button[type="submit"]');

    this.modal = document.getElementById('modal');
    this.modalTitle = this.modal.querySelector('.modal-title');
    this.modalBody = this.modal.querySelector('.modal-body');
    this.modalFullArticleLink = this.modal.querySelector('.full-article');
  }

  init() {
    this.updateTexts();
    this.input.focus();
  }

  updateTexts() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.dataset.i18n;
      element.textContent = this.i18n.t(key);
    });
  }

  render({ feeds, posts }) {
    this.renderFeeds(feeds);
    this.renderPosts(posts);
  }

  renderFeeds(feeds) {
    this.feedsContainer.innerHTML = '';

    if (feeds.length === 0) return;

    const card = document.createElement('div');
    card.className = 'card border-0';
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    const title = document.createElement('h2');
    title.className = 'card-title h4';
    title.textContent = this.i18n.t('feeds');
    
    cardBody.append(title);
    card.append(cardBody);
    
    const listGroup = document.createElement('ul');
    listGroup.className = 'list-group border-0 rounded-0';
    
    feeds.forEach(feed => {
      const item = document.createElement('li');
      item.className = 'list-group-item border-0 border-end-0';
      
      const feedTitle = document.createElement('h3');
      feedTitle.className = 'h6 m-0';
      feedTitle.textContent = feed.title;
      
      const description = document.createElement('p');
      description.className = 'm-0 small text-black-50';
      description.textContent = feed.description;
      
      item.append(feedTitle, description);
      listGroup.append(item);
    });
    
    card.append(listGroup);
    this.feedsContainer.append(card);
  }

  renderPosts(posts) {
    this.postsContainer.innerHTML = '';

    if (posts.length === 0) return;

    const card = document.createElement('div');
    card.className = 'card border-0';
    
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    
    const title = document.createElement('h2');
    title.className = 'card-title h4';
    title.textContent = this.i18n.t('posts');
    
    cardBody.append(title);
    card.append(cardBody);
    
    const listGroup = document.createElement('ul');
    listGroup.className = 'list-group border-0 rounded-0';
    
    posts.forEach(post => {
      const item = document.createElement('li');
      item.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';
      
      const link = document.createElement('a');
      link.href = post.link;
      // Обновляем классы в зависимости от просмотра
      link.className = post.viewed ? 'fw-normal' : 'fw-bold';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = post.title;
      
      // Добавляем кнопку предпросмотра
      const previewButton = document.createElement('button');
      previewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      previewButton.textContent = this.i18n.t('preview');
      previewButton.setAttribute('data-id', post.feedId);
      previewButton.setAttribute('data-bs-toggle', 'modal');
      previewButton.setAttribute('data-bs-target', '#modal');
      // previewButton.type = 'button';
      // previewButton.className = 'btn btn-outline-primary btn-sm';
      // previewButton.textContent = this.i18n.t('preview');
      previewButton.dataset.id = post.id;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'ms-2';
      buttonContainer.append(previewButton);
      
      const wrapper = document.createElement('div');
      wrapper.className = 'd-flex justify-content-between w-100';
      wrapper.append(link, buttonContainer);
      
      item.append(wrapper);
      listGroup.append(item);
    });
    
    card.append(listGroup);
    this.postsContainer.append(card);
  }

  showPostModal(post) {
    this.modalTitle.textContent = post.title;
    this.modalBody.textContent = post.description;
    this.modalFullArticleLink.href = post.link;

    modal.show();
  }

  showError(key) {
    this.input.classList.add('is-invalid');
    this.feedback.textContent = this.i18n.t(key);
  }

  clearForm() {
    this.input.value = '';
    this.input.classList.remove('is-invalid');
    this.feedback.textContent = '';
    this.input.focus();
  }

  disableForm() {
    this.input.disabled = true;
    this.submitButton.disabled = true;
  }

  enableForm() {
    this.input.disabled = false;
    this.submitButton.disabled = false;
  }
}