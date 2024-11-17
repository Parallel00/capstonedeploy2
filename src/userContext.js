// UserContext.js
import React, { createContext, useContext, useState } from 'react';

// Create a context for the user
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => {
  return useContext(UserContext);
};

// UserProvider component to provide the user state globally
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Check localStorage for a saved user
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const updateUser = (newUser) => {
    setUser(newUser);
    // Optionally, persist the user data in localStorage
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, updateUser, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
};

