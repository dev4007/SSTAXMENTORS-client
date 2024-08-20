import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children, role }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  console.log("🚀 ~ ProtectedRoute ~ isAuthorized:", isAuthorized)

  const getToken = () => localStorage.getItem("token");
  const getUserRole = () => localStorage.getItem("role");

  useEffect(() => {
    const token = getToken();
    const userRole = getUserRole();

    if (!token) {
      setIsAuthorized(false); // Not authorized if no token
    } else if (role && userRole !== role) {
      setIsAuthorized(false); // Not authorized if role doesn't match
    } else {
      setIsAuthorized(true); // Authorized if token exists and role matches
    }
  }, [role]);

  if (isAuthorized === null) {
    // While checking authorization, you can show a loading indicator
    return <div>Loading...</div>;
  }

  if (isAuthorized === false) {
    // Redirect based on the user's role or to login
    const userRole = getUserRole();
    if (!userRole) {
      return <Navigate to="/login" />;
    }
    if (userRole === "admin") {
      return <Navigate to="/admin/admindashboard" />;
    }
    if (userRole === "employee") {
      return <Navigate to="/employee/employeedashboard" />;
    }
    return <Navigate to="/user/userdashboard" />;
  }

  // If authorized, render the children
  return children;
};
