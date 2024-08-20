import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token) {
      setIsLoggedIn(true); // Automatically set to true if token is found
      setUserRole(role); // Assuming the role is in the token
    }
  }, []);

  const loginData = (token,role) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    setIsLoggedIn(true);
    setUserRole(role); // Assuming the role is in the token

  };

  const logoutData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserRole(""); // Assuming the role is in the token

  };

  return (
    <AuthContext.Provider value={{ isLoggedIn,userRole, loginData, logoutData }}>
      {children}
    </AuthContext.Provider>
  );
};
