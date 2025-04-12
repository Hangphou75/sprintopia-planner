import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "@/contexts/AuthContext";
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
import IndividualAthleteHome from "@/pages/individual-athlete/Home";
import CoachHome from "@/pages/coach/Home";
import CoachPlanning from "@/pages/coach/Planning";
import { CreateWorkout } from "@/pages/coach/CreateWorkout";
import { EditWorkout } from "@/pages/coach/EditWorkout";
import CoachProfile from "@/pages/coach/Profile";
import { ProgramWorkouts } from "@/pages/coach/ProgramWorkouts";
import { ManagedAthletes } from "@/components/coach/ManagedAthletes";
import WorkoutDetails from "@/pages/coach/WorkoutDetails";
import Athletes from "@/pages/coach/Athletes";
import AthleteDetail from "@/pages/coach/AthleteDetail";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="contact" element={<Contact />} />
          <Route path="legal" element={<Legal />} />
          <Route path="pricing" element={<Pricing />} />
          
          {/* Layout wrapper for authenticated routes */}
          <Route element={<Layout />}>
            <Route index element={<Index />} />
            <Route path="home" element={<Home />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<Profile />} />
              
              {/* Admin routes */}
              <Route path="admin">
                <Route element={<RoleProtectedRoute allowedRoles={["admin"]} />}>
                  <Route index element={<Navigate to="/admin/users" replace />} />
                  <Route path="home" element={<AdminHome />} />
                  <Route path="users" element={<UsersList />} />
                  <Route path="users/:id/edit" element={<EditUser />} />
                  <Route path="users/:id/athletes" element={<UserAthletes />} />
                  <Route path="users/:id/programs" element={<UserPrograms />} />
                  <Route path="competitions" element={<Competitions />} />
                </Route>
              </Route>

              {/* Individual Athlete routes */}
              <Route path="individual-athlete">
                <Route element={<RoleProtectedRoute allowedRoles={["individual_athlete"]} />}>
                  <Route index element={<Navigate to="/individual-athlete/planning" replace />} />
                  <Route path="home" element={<IndividualAthleteHome />} />
                  <Route path="planning" element={<div>Individual Athlete Planning</div>} />
                  <Route path="stats" element={<div>Individual Athlete Statistics</div>} />
                  <Route path="programs/:programId/workouts/:workoutId/edit" element={<EditWorkout />} />
                </Route>
              </Route>

              {/* Coach routes */}
              <Route path="coach">
                <Route element={<RoleProtectedRoute allowedRoles={["coach", "admin"]} />}>
                  <Route index element={<Navigate to="/coach/dashboard" replace />} />
                  <Route path="dashboard" element={<CoachHome />} />
                  <Route path="athletes" element={<Athletes />} />
                  <Route path="athletes/:id" element={<AthleteDetail />} /> {/* Nouvelle route pour les détails d'athlète */}
                  <Route path="planning" element={<CoachPlanning />} />
                  <Route path="programs/*" element={<CoachPlanning />} />
                  <Route path="programs/:programId/workouts" element={<ProgramWorkouts />} />
                  <Route path="programs/:programId/workouts/:workoutId" element={<WorkoutDetails />} />
                  <Route path="feedback" element={<div>Coach Feedback</div>} />
                  <Route path="profile" element={<CoachProfile />} />
                  <Route path="programs/:programId/workouts/new" element={<CreateWorkout />} />
                  <Route path="programs/:programId/workouts/:workoutId/edit" element={<EditWorkout />} />
                </Route>
              </Route>

              {/* Athlete routes */}
              <Route path="athlete">
                <Route element={<RoleProtectedRoute allowedRoles={["athlete"]} />}>
                  <Route index element={<Navigate to="/athlete/planning" replace />} />
                  <Route path="planning" element={<div>Athlete Planning</div>} />
                  <Route path="stats" element={<div>Athlete Statistics</div>} />
                  <Route path="programs/:programId/workouts/:workoutId" element={<div>Workout Details</div>} />
                </Route>
              </Route>
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
