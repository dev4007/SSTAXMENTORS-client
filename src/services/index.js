export const saveLoginToken = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
}

export const removeLoginToken = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
}



export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const expiry = decodedToken.exp * 1000; // Token expiry time in milliseconds
    return Date.now() > expiry;
  } catch (error) {
    // Handle invalid token format
    return true;
  }
};

// utils/auth.js
export const clearLocalStorage = () => {
    localStorage.removeItem('token');
    // Clear other relevant data if needed
  };
  
  export const redirectToLogin = (navigate) => {
    clearLocalStorage();
    navigate('/login');
  };
  