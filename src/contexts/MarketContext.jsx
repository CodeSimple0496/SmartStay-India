import React, { createContext, useContext, useState, useEffect } from 'react';

const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'INR');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'EN');
  
  // Static conversion rates (1 USD = 83 INR, 1 EUR = 90 INR as example)
  const rates = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011
  };

  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€'
  };

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const convertPrice = (priceInINR) => {
    if (priceInINR === undefined || priceInINR === null || isNaN(Number(priceInINR))) {
      return `${currencySymbols[currency] || '₹'}0`;
    }
    const rate = rates[currency] || 1;
    const symbol = currencySymbols[currency] || '₹';
    const converted = (Number(priceInINR) * rate).toFixed(0);
    return `${symbol}${Number(converted).toLocaleString()}`;
  };

  const toggleCurrency = (cur) => setCurrency(cur);
  const toggleLanguage = (lang) => setLanguage(lang);

  return (
    <MarketContext.Provider value={{ 
      currency, 
      language, 
      toggleCurrency, 
      toggleLanguage, 
      convertPrice,
      currencySymbols 
    }}>
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
