const resources = {
  ru: {
    translation: {
      header: 'RSS агрегатор',
      description: 'RSS - самый быстрый способ отслеживать темы и новости, которые вас интересуют',
      button: 'Добавить',
      label: 'Вставьте сюда RSS-ссылку',
      feedback: {
        success: 'RSS успешно загружен',
        emptyField: 'Не должно быть пустым',
        invalidUrl: 'Ссылка должна быть валидным URL',
        noValidRss: 'Ресурс не содержит валидный RSS',
        rssAlreadyAdded: 'RSS уже существует',
        connectionError: 'Ошибка сети',
      },
      rss: {
        feeds: 'Фиды',
        posts: 'Посты',
        linkBtn: 'Просмотр',
      },
      modal: {
        openEntire: 'Читать полностью',
        close: 'Закрыть',
      },
    },
  },
};

export default resources;
