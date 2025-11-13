import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../api/protectedroute";

// Authentication Components
import Register from "../components/Authentication/registration";
import Login from "../components/Authentication/login";
import FirstTimeLogin from "../components/Authentication/first_time_login";
import SetFirstTimePassword from "../components/Authentication/set_first_time_pass";

// Password Management Components
import ChangePassword from "../components/password/changepassword";
import ForgotPassword from "../components/password/forgotpassword";
import VerifyOtp from "../components/password/verifyOtp";
import ResetPassword from "../components/password/resetpassword";

// Domain Scanning Components
import SearchDomain from "../components/scan domain/searchdomain";
import SslReportDetails from "../components/scan domain/ssldetails";
import SslReportsAnalysis from "../components/scan domain/ssllist";

// User Management Components
import User from "../components/pages/user/user_manager";

// Role Management Components
import RoleManager from "../components/pages/role permission/role_manager";
import AddRole from "../components/pages/role permission/add_role";
import EditRole from "../components/pages/role permission/edit_role";

// Common Components
import Profile from "../components/common/profile";
import BackButton from "../components/common/backbutton";

function AllRoutes() {
  return (
    <Routes>
      {/* Public Routes - Authentication */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/first-time-login" element={<FirstTimeLogin />} />
      <Route path="/set-first-time-password" element={<SetFirstTimePassword />} />

      {/* Public Routes - Password Recovery */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes - Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SearchDomain />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - SSL Scanning */}
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
            <SslReportDetails
              backButton={
                <BackButton label="Back" to="/scan" variant="primary" />
              }
            />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - User Management */}
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <User />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Role Management */}
      <Route
        path="/role"
        element={
          <ProtectedRoute>
            <RoleManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/role/add"
        element={
          <ProtectedRoute>
            <AddRole />
          </ProtectedRoute>
        }
      />
      <Route
        path="/role/edit/:id"
        element={
          <ProtectedRoute>
            <EditRole />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes - Profile & Settings */}
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
    </Routes>
  );
}

export default AllRoutes;
