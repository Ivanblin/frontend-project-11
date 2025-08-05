export const fetchRss = async (url) => {
  const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
  
  try {
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error('NetworkError');
    }
    
    const data = await response.json();
    return data.contents;
  } catch (error) {
    throw new Error('NetworkError');
  }
};

export const parseRss = (xmlString) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Проверка на ошибки парсинга
    const errorNode = xmlDoc.querySelector('parsererror');
    if (errorNode) {
      throw new Error('ParseError');
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
    throw new Error('ParseError');
  }
};