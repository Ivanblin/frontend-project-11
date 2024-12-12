import onChange from 'on-change';
import i18next from 'i18next';

let visitedLinksPost = new Set()

const renderModal = (event, currentPost) => {
  visitedLinksPost.add(currentPost.link)
  const modalTitle = document.querySelector('.modal-title');
  const modalDescription = document.querySelector('.modal-body');
  const modalPreviewBtn = document.querySelector('.modal-btn-preview');
  const modalCloseBtn = document.querySelector('.modal-btn-close');


  const targetPost = event.target.parentElement.querySelector('a');

  targetPost.classList.remove('fw-bold');
  targetPost.classList.add('fw-normal', 'text-secondary');
  modalCloseBtn.textContent = 'Закрыть';
  modalCloseBtn.src = currentPost.link;
  modalPreviewBtn.textContent = 'Читать';
  modalTitle.innerHTML = currentPost.title;
  modalDescription.innerHTML = currentPost.description;

  modalPreviewBtn.addEventListener('click', () => {
    window.open(currentPost.link, '_blank');
  });
}

const buildStateWatcher = (state) => {
  const stateWatcher = onChange(state, (path, value) => {
    const urlInput = document.querySelector('[name="url"]');
    const statusBlock = document.getElementById('status');
    const submitButton = document.getElementById('add-rss');
    const channelsContainer = document.getElementById('channels');
    const feedContainer = document.getElementById('feed');

    if (path === 'form.state') {
      switch (value) {
        case 'filling': {
          break;
        }

        case 'invalid': {
          urlInput.classList.add('border', 'border-danger');
          statusBlock.classList.add('text-danger');
          statusBlock.innerHTML = i18next.t(`errors.${state.form.errorsMessages}`);
          break;
        }

        case 'valid': {
          urlInput.classList.remove('text-danger');
          statusBlock.classList.remove('border', 'border-danger');
          break;
        }

        default:
          throw new Error(`invalid value: ${value}`);
      }
    }

    if (path === 'feedLoader.state') {
      switch (value) {
        case 'loading': {
          submitButton.disabled = true;
          const spinner = `<div class="spinner-border text-info" role="status"></div><span class="load-message text-primary ml-3">${i18next.t('loading')}</span>`;
          statusBlock.innerHTML = spinner;
          break;
        }

        case 'loaded': {
          urlInput.value = '';
          urlInput.classList.remove('border', 'border-danger');
          statusBlock.classList.remove('text-danger');
          submitButton.disabled = false;
          statusBlock.innerHTML = i18next.t('rssStatus.success');
          statusBlock.classList.add('text-success');

          const lastAddedFeedNumber = state.feeds.length - 1;
          // const { feedId, name: feedName } = state.feeds[lastAddedFeedNumber];
          const { feedId } = state.feeds[lastAddedFeedNumber];
          const postBlock = document.createElement('div');

          postBlock.setAttribute('id', feedId);

          // const feedTitle = document.createElement('h2');

          // feedTitle.innerHTML = feedName;
          // postBlock.append(feedTitle);

          const linksForFeed = state.posts.filter((post) => post.feedId === feedId);

          linksForFeed.forEach((singleLink) => {
            const linkContainer = document.createElement('div');
            const link = document.createElement('a');
            const btnOpenNews = document.createElement('button');

            btnOpenNews.textContent = 'Посмотреть'
            btnOpenNews.classList.add('btn', 'btn-outline-primary', 'btn-sm');
            btnOpenNews.setAttribute('data-id', singleLink.feedId);
            btnOpenNews.setAttribute('data-bs-toggle', 'modal');
            btnOpenNews.setAttribute('data-bs-target', '#modal');

            btnOpenNews.addEventListener('click', (event) => renderModal(event, singleLink));

            linkContainer.classList.add(
              'list-group-item',
              'd-flex',
              'justify-content-between',
              'align-items-start',
              'border-0',
              'border-end-0',
              'fw-bold'
            );

            link.setAttribute('href', `${singleLink.link}`);
            link.setAttribute('target', '_blank');
            link.addEventListener('click', (event) => {
              event.target.classList.remove('fw-bold');
              event.target.classList.add('fw-normal', 'text-secondary');
            });
            link.innerHTML = `${singleLink.title}`;
            linkContainer.append(link);
            linkContainer.append(btnOpenNews);
            postBlock.append(linkContainer);
          });

          channelsContainer.append(postBlock);
          break;
        }

        case 'error': {
          submitButton.disabled = false;
          statusBlock.classList.remove('text-success');
          statusBlock.classList.add('text-danger');
          statusBlock.innerHTML = i18next.t(`${state.feedLoader.errorsMessages}`);
          break;
        }

        default:
          throw new Error(`Incorrect value: ${value}`);
      }
    }

    
    if (path === 'feeds') {
      feedContainer.innerHTML = `<div class="card-body"><h2 class="card-title h4 fw-bold">Фиды</h2></div><ul class="list-group border-0 rounded-0"></ul>`;

      const feedsList = feedContainer.querySelector('ul');

      state.feeds.forEach((feed) => {
        const listElement = document.createElement('li');
        const feedHeader = document.createElement('h3');
        const feedParagraph = document.createElement('p');
  
        listElement.classList.add('list-group-item', 'border-0', 'border-end-0');
        feedHeader.classList.add('h6', 'm-0');
        feedHeader.textContent = feed.name;
        feedParagraph.classList.add('m-0', 'small', 'text-black-50');
        feedParagraph.textContent = feed.description;
        listElement.append(feedHeader, feedParagraph);
        feedsList.append(listElement);
      });
    }

    if (path === 'posts') {
      const lastAddedPostNumber = state.posts.length - 1;
      const lastAddedFeedId = state.posts[lastAddedPostNumber].feedId;

      const postBlock = document.getElementById(lastAddedFeedId);

      postBlock.innerHTML = '';

      // const postTitleBlock = document.createElement('h2');

      // const lastFeedName = state.feeds
      //   .filter((feed) => feed.feedId === lastAddedFeedId)
      //   .map((feed) => feed.name);

      // const [feedTitle] = lastFeedName;

      // postTitleBlock.innerHTML = feedTitle;
      // postBlock.append(postTitleBlock);

      const linkForFeed = state.posts.filter((post) => post.feedId === lastAddedFeedId);

      linkForFeed.forEach((singleLink) => {
        const linkContainer = document.createElement('div');
        const link = document.createElement('a');
        link.classList.add('fw-bold');
        const btnOpenNews = document.createElement('button');

        btnOpenNews.textContent = 'Посмотреть'
        btnOpenNews.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        btnOpenNews.setAttribute('data-bs-toggle', 'modal');
        btnOpenNews.setAttribute('data-bs-target', '#modal');

        linkContainer.classList.add(
          'list-group-item',
          'd-flex',
          'justify-content-between',
          'align-items-start',
          'border-0',
          'border-end-0',
        );

        visitedLinksPost.forEach((value) => {
          if (value == singleLink.link) {
            link.classList.remove('fw-bold');
            link.classList.add('fw-normal', 'text-secondary');
          }
        });

        link.setAttribute('href', `${singleLink.link}`);
        link.setAttribute('target', '_blank');
        link.innerHTML = `${singleLink.title}`;
        btnOpenNews.addEventListener('click', (event) => renderModal(event, singleLink));
        link.addEventListener('click', (event) => {
          event.target.classList.remove('fw-bold');
          event.target.classList.add('fw-normal', 'text-secondary');
        });
        linkContainer.append(link);
        linkContainer.append(btnOpenNews);
        postBlock.append(linkContainer);
      });
    }
  });
  return stateWatcher;
};

export default buildStateWatcher;