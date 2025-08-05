import * as yup from 'yup';

export const setupYup = (i18nInstance) => {
  yup.setLocale({
    mixed: {
      required: () => i18nInstance.t('errors.required'),
      notOneOf: () => i18nInstance.t('errors.notOneOf'),
    },
    string: {
      url: () => i18nInstance.t('errors.url'),
    },
  });
};

export const validateUrl = (url, feeds) => {
  const schema = yup.string()
    .required()
    .url()
    .notOneOf(feeds);
  return schema.validate(url);
};