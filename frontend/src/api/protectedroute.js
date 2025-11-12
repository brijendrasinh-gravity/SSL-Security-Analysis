// import React from "react";
// import { Navigate } from "react-router-dom";

// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/usercontext";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    // If token exists but context is empty, restore user from localStorage
    if (token && !user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [token, user, setUser]);

  // Redirect if no token found
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
