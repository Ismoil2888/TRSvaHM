import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../translations';

const useTranslation = () => {
  const { language } = useContext(LanguageContext);
  
  const t = (key) => {
    return translations[language][key] || key;
  };

  return t;
};

export default useTranslation;