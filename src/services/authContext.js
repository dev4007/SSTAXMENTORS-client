import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  const isTokenExpired = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; // in seconds
      return decodedToken.exp < currentTime;
    } catch (error) {
      console.error('Invalid token or failed to decode', error);
      return true; // treat as expired if invalid
    }
  };

  const logoutData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserRole("");
  };

  const scheduleTokenExpiration = (token) => {
    const decodedToken = jwtDecode(token);
    const expirationTime = decodedToken.exp * 1000 - Date.now(); // Convert to milliseconds

    if (expirationTime > 0) {
      setTimeout(() => {
        logoutData();
      }, expirationTime);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && !isTokenExpired(token)) {
      setIsLoggedIn(true);
      setUserRole(role);
      scheduleTokenExpiration(token); // Schedule token expiration
    } else {
      logoutData(); // Log out if token is expired or invalid
    }
  }, []); // Empty dependency array to run once on mount

  const loginData = (token, role) => {
    if (!isTokenExpired(token)) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      setIsLoggedIn(true);
      setUserRole(role);
      scheduleTokenExpiration(token); // Schedule token expiration
    } else {
      alert('Token is expired. Please login again.');
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, loginData, logoutData }}>
      {children}
    </AuthContext.Provider>
  );
};
