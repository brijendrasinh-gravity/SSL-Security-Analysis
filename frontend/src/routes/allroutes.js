import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../api/protectedroute";
import PermissionGuard from "../components/common/PermissionGuard";
import Register from "../components/Authentication/registration";
import Login from "../components/Authentication/login";
import FirstTimeLogin from "../components/Authentication/first_time_login";
import SetFirstTimePassword from "../components/Authentication/set_first_time_pass";
import ChangePassword from "../components/password/changepassword";
import ForgotPassword from "../components/password/forgotpassword";
import VerifyOtp from "../components/password/verifyOtp";
import ResetPassword from "../components/password/resetpassword";
import SearchDomain from "../components/scan domain/searchdomain";
import SslReportDetails from "../components/scan domain/ssldetails";
import SslReportsAnalysis from "../components/scan domain/ssllist";
import User from "../components/pages/user/user_manager";
import RoleManager from "../components/pages/role permission/role_manager";
import AddRole from "../components/pages/role permission/add_role";
import EditRole from "../components/pages/role permission/edit_role";
import BlockedIPManager from "../components/pages/blocked_ip/BlockedIPManager";
import VirusTotalScanner from "../components/pages/virus_total/VirusTotalScanner";
import VirusTotalReport from "../components/pages/virus_total/VirusTotalReport";
import Profile from "../components/common/profile";
import Settings from "../components/pages/settings/Settings";
import BackButton from "../components/common/backbutton";

function AllRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/first-time-login" element={<FirstTimeLogin />} />
      <Route
        path="/set-first-time-password"
        element={<SetFirstTimePassword />}
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PermissionGuard moduleName="ssl_security">
              <SearchDomain />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/scan"
        element={
          <ProtectedRoute>
            <PermissionGuard moduleName="ssl_security" requiredPermission="canList">
              <SslReportsAnalysis />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/scan/details/:id"
        element={
          <ProtectedRoute>
            <PermissionGuard moduleName="ssl_security" requiredPermission="canList">
              <SslReportDetails
                backButton={
                  <BackButton label="Back" to="/scan" variant="primary" />
                }
              />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <PermissionGuard moduleName="user" requiredPermission="canList">
              <User />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/role"
        element={
          <ProtectedRoute>
            <PermissionGuard moduleName="role_permission" requiredPermission="canList">
              <RoleManager />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/role/add"
        element={
          <ProtectedRoute>
            <PermissionGuard moduleName="role_permission" requiredPermission="canCreate">
              <AddRole />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/role/edit/:id"
        element={
          <ProtectedRoute>
            <PermissionGuard moduleName="role_permission" requiredPermission="canModify">
              <EditRole />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/blocked-ip"
        element={
          <ProtectedRoute>
            <PermissionGuard moduleName="blocked_ip" requiredPermission="canList">
              <BlockedIPManager />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/virus-total"
        element={
          <ProtectedRoute>
            <PermissionGuard moduleName="virus_total" requiredPermission="canList">
              <VirusTotalScanner />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/virus-total/report/:id"
        element={
          <ProtectedRoute>
            <PermissionGuard moduleName="virus_total" requiredPermission="canList">
              <VirusTotalReport />
            </PermissionGuard>
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
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
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
