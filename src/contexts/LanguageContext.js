import { createContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('tajik');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'tajik'; // Fallback
    setLanguage(savedLang);
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    setShowModal(false);
    window.location.reload();
  };

  return (
    <LanguageContext.Provider value={{ language, handleLanguageChange, showModal, setShowModal }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageProvider, LanguageContext };