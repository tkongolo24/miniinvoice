// frontend/src/contexts/LanguageContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { translations, getTranslation } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Function to detect browser/system language
const detectSystemLanguage = () => {
  // Get browser language (e.g., "en-US", "fr-FR", "rw")
  const browserLang = navigator.language || navigator.userLanguage;
  
  // Extract the language code (first 2 letters)
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Check if we support this language
  if (translations[langCode]) {
    return langCode;
  }
  
  // Default to English if we don't support the detected language
  return 'en';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Priority: 1. Saved preference, 2. System language, 3. Default English
    const savedLanguage = localStorage.getItem('appLanguage');
    if (savedLanguage && translations[savedLanguage]) {
      return savedLanguage;
    }
    
    // Detect system language
    const systemLang = detectSystemLanguage();
    localStorage.setItem('appLanguage', systemLang);
    return systemLang;
  });

  useEffect(() => {
    // Save language preference to localStorage whenever it changes
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const t = (key) => getTranslation(language, key);

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLanguage(newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};