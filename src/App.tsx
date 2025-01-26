import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "./components/auth/RoleProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { Home as AthleteHome } from "./pages/athlete/Home";
import { Home as CoachHome } from "./pages/coach/Home";
import { Programs } from "./pages/coach/Programs";
import { ProgramWorkouts } from "./pages/coach/ProgramWorkouts";
import { CreateProgram } from "./pages/coach/CreateProgram";
import { EditProgram } from "./pages/coach/EditProgram";
import { CreateWorkout } from "./pages/coach/CreateWorkout";
import { EditWorkout } from "./pages/coach/EditWorkout";
import { Athletes } from "./pages/coach/Athletes";
import { Profile } from "./pages/Profile";
import { WorkoutDetails } from "./pages/athlete/WorkoutDetails";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route element={<RoleProtectedRoute allowedRoles={["athlete"]} />}>
                  <Route path="/athlete" element={<AthleteHome />} />
                  <Route path="/athlete/programs/:programId/workouts/:workoutId" element={<WorkoutDetails />} />
                </Route>

                <Route element={<RoleProtectedRoute allowedRoles={["coach"]} />}>
                  <Route path="/coach" element={<CoachHome />} />
                  <Route path="/coach/programs" element={<Programs />} />
                  <Route path="/coach/programs/new" element={<CreateProgram />} />
                  <Route path="/coach/programs/:programId/edit" element={<EditProgram />} />
                  <Route path="/coach/programs/:programId/workouts" element={<ProgramWorkouts />} />
                  <Route path="/coach/programs/:programId/workouts/new" element={<CreateWorkout />} />
                  <Route path="/coach/programs/:programId/workouts/:workoutId/edit" element={<EditWorkout />} />
                  <Route path="/coach/athletes" element={<Athletes />} />
                </Route>

                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
