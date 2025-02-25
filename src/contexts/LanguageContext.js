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
    setShowModal(false);
    setLanguage(lang);
    window.location.reload();
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, handleLanguageChange, showModal, setShowModal }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageProvider, LanguageContext };