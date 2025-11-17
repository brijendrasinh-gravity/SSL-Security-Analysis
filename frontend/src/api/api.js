import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:7000",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    // Automatically add token to all requests if it exists
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("sending req from api", config.url);
    return config;
  },
  (error) => {
    console.error("api request error", error);
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    console.log("response received", response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("api error", error.response.status, error.response.data);

      // Handle different error types
      if (error.response.status === 401) {
        // Unauthorized - token invalid or expired
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else if (error.response.status === 403) {
        // Check if IP is blocked
        if (error.response.data.blocked === true) {
          alert("Your IP address has been blocked. You will be redirected to login.");
          localStorage.clear();
          window.location.href = "/login";
          return;
        }

        // Forbidden - no permission (RBAC)
        const message = error.response.data.message || "You don't have permission to perform this action.";
        alert(`Access Denied: ${message}`);
      } else {
        // Other errors
        const errorMsg =
          error.response.data.error ||
          error.response.data.message ||
          "An error occurred";
        alert(`Error: ${errorMsg}`);
      }
    } else {
      console.error("network error", error.message);
      alert("Network error. Please try again later.");
    }
    return Promise.reject(error);
  }
);

export default API;
