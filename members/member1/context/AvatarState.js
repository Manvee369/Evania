import React, { createContext, useState, useContext } from 'react';
export const AvatarContext = createContext();

export const AvatarProvider = ({ children }) => {
  const [mood, setMood] = useState('neutral');
  const [theme, setTheme] = useState('light');

  const updateMood = (newMood) => setMood(newMood);
  const updateTheme = (newTheme) => setTheme(newTheme);

  return (
    <AvatarContext.Provider value={{ mood, theme, updateMood, updateTheme }}>
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => useContext(AvatarContext);
