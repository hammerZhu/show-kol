import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 导入翻译文件
import enTranslation from './locales/en.json';
import zhTranslation from './locales/zh.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      zh: {
        translation: zhTranslation
      }
    },
    lng: 'en', // 默认语言
    fallbackLng: 'en', // 当前语言没有对应翻译时的后备语言
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 