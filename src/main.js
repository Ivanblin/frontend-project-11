import 'normalize.css'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import initI18n from './scripts/i18n.js'
import initApp from './scripts/app.js'

(async () => {
  try {
    const i18nInstance = await initI18n()
    initApp(i18nInstance)
  }
  catch (e) {
    console.error('Application initialization failed:', e)
  }
})()
