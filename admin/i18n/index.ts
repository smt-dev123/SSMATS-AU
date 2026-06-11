import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import globalEn from '@/locales/en.json'
import globalKm from '@/locales/km.json'

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    lng: 'km',
    resources: {
      en: {
        translation: globalEn,
      },
      km: {
        translation: globalKm,
      },
    },
  })

export default i18n
