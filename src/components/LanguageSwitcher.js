import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
    >
      {i18n.language === 'zh' ? 'English' : '中文'}
    </button>
  );
}

export default LanguageSwitcher; 