import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route } from "react-router-dom";
import Header from "./components/navbar";
import SearchDomain from "./components/searchdomain";
import SslReportDetails from "./components/pages/ssldetails";
import SslReportsAnalysis from "./components/pages/ssllist";
import Register from "./components/registration";
import Login from "./components/login";
import ProtectedRoute from "./api/protectedroute";
import Profile from "./components/profile";
import ChangePassword from "./components/changepassword";
import ForgotPassword from "./components/pages/forgotpassword";
import VerifyOtp from "./components/pages/verifyOtp";
import ResetPassword from "./components/pages/resetpassword";
import BackButton from "./components/common/backbutton";

function App() {
  return (
    <div className="bg-secondary min-vh-100">
      <Header />

      <div className="bg-secondary min-vh-100">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SearchDomain />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <SslReportsAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan/details/:id"
            element={
              <ProtectedRoute>
                <SslReportDetails backButton={<BackButton label="Back" to="/profile" variant="dark" />}/>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
