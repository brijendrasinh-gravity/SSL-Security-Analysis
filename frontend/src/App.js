import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/layout.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import SearchDomain from "./components/scan domain/searchdomain";
import SslReportDetails from "./components/scan domain/ssldetails";
import SslReportsAnalysis from "./components/scan domain/ssllist";
import Register from "./components/Authentication/registration";
import Login from "./components/Authentication/login";
import ProtectedRoute from "./api/protectedroute";
import Profile from "./components/common/profile";
import ChangePassword from "./components/password/changepassword";
import ForgotPassword from "./components/password/forgotpassword";
import VerifyOtp from "./components/password/verifyOtp";
import ResetPassword from "./components/password/resetpassword";
import BackButton from "./components/common/backbutton";
import User from "./components/pages/user/user_manager";
import RoleManager from "./components/pages/role permission/role_manager";
import AddRole from "./components/pages/role permission/add_role";
import EditRole from "./components/pages/role permission/edit_role";

function App() {
  return (
    <Layout>
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
          path="/user"
          element={
            <ProtectedRoute>
              <User />
            </ProtectedRoute>
          }
        />
        <Route
          path="/role"
          element={
            <ProtectedRoute>
              {/* <Rolepermission /> */}
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
    </Layout>
  );
}

export default App;
