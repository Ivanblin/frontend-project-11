import i18next from 'i18next'
import resources from './locales/index.js'

export default async () => {
  const i18nInstance = i18next.createInstance()
  await i18nInstance.init({
    lng: 'ru',
    fallbackLng: 'en',
    debug: false,
    resources,
  })
  return i18nInstance
}
