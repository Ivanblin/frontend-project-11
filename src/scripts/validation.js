import * as yup from 'yup';

const validateUrl = (url, feeds) => {
  const schema = yup.string()
    .required('Не должно быть пустым')
    .url('Ссылка должна быть валидным URL')
    .notOneOf(feeds, 'RSS уже существует');

  return schema.validate(url);
};

export default validateUrl;