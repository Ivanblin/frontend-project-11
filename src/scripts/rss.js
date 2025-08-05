// Улучшенная обработка ошибок
export const fetchRss = async (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
  
  try {
    const response = await fetch(proxyUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = new Error('NetworkError');
      error.name = 'NetworkError';
      throw error;
    }
    
    const data = await response.json();
    return data.contents;
  } catch (error) {
    if (error.name !== 'NetworkError') {
      const networkError = new Error('NetworkError');
      networkError.name = 'NetworkError';
      throw networkError;
    }
    throw error;
  }
};

export const parseRss = (xmlString) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Проверка ошибок парсинга
    const errorNode = xmlDoc.querySelector('parsererror');
    if (errorNode) {
      const error = new Error('ParseError');
      error.name = 'ParseError';
      throw error;
    }
    
    // Извлечение данных фида
    const channel = xmlDoc.querySelector('channel');
    const feed = {
      title: channel.querySelector('title').textContent,
      description: channel.querySelector('description').textContent,
    };
    
    // Извлечение постов
    const items = xmlDoc.querySelectorAll('item');
    const posts = Array.from(items).map(item => ({
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
    }));
    
    return { feed, posts };
  } catch (error) {
    if (error.name !== 'ParseError') {
      const parseError = new Error('ParseError');
      parseError.name = 'ParseError';
      throw parseError;
    }
    throw error;
  }
};