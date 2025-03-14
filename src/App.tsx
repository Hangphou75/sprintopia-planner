
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import { Register } from "@/pages/auth/Register";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { ResetPassword } from "@/pages/auth/ResetPassword";
import Contact from "@/pages/Contact";
import Legal from "@/pages/Legal";
import Pricing from "@/pages/Pricing";
import { Profile } from "@/pages/Profile";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";
import AdminHome from "@/pages/admin/Home";
import { UsersList } from "@/pages/admin/UsersList";
import EditUser from "@/pages/admin/EditUser";
import { UserAthletes } from "@/pages/admin/UserAthletes";
import UserPrograms from "@/pages/admin/UserPrograms";
import Competitions from "@/pages/admin/Competitions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<Index />} />
          <Route path="home" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="contact" element={<Contact />} />
          <Route path="legal" element={<Legal />} />
          <Route path="pricing" element={<Pricing />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
            
            {/* Admin routes */}
            <Route path="admin" element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
              <Route index element={<Navigate to="/admin/users" replace />} />
              <Route path="home" element={<AdminHome />} />
              <Route path="users" element={<UsersList />} />
              <Route path="users/:id/edit" element={<EditUser />} />
              <Route path="users/:id/athletes" element={<UserAthletes />} />
              <Route path="users/:id/programs" element={<UserPrograms />} />
              <Route path="competitions" element={<Competitions />} />
            </Route>

            {/* Individual Athlete routes */}
            <Route path="individual-athlete" element={<RoleProtectedRoute allowedRoles={["individual_athlete"]} />}>
              <Route path="planning" element={<div>Individual Athlete Planning</div>} />
              {/* Add more individual athlete routes here */}
            </Route>

            {/* Coach routes */}
            <Route path="coach" element={<RoleProtectedRoute allowedRoles={["coach"]} />}>
              <Route path="dashboard" element={<div>Coach Dashboard</div>} />
              {/* Add more coach routes here */}
            </Route>

            {/* Athlete routes */}
            <Route path="athlete" element={<RoleProtectedRoute allowedRoles={["athlete"]} />}>
              <Route path="planning" element={<div>Athlete Planning</div>} />
              {/* Add more athlete routes here */}
            </Route>
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
