import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import AthleteHome from "@/pages/athlete/Home";
import AthletePlanning from "@/pages/athlete/Planning";
import AthleteProfile from "@/pages/athlete/Profile";
import CoachHome from "@/pages/coach/Home";
import CoachPlanning from "@/pages/coach/Planning";
import CoachProfile from "@/pages/coach/Profile";
import { ProgramWorkouts } from "@/pages/coach/ProgramWorkouts";
import { CreateWorkout } from "@/pages/coach/CreateWorkout";
import { EditWorkout } from "@/pages/coach/EditWorkout";
import { EditProgram } from "@/pages/coach/EditProgram";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Athlete Routes */}
            <Route path="/athlete" element={<Layout />}>
              <Route index element={<Navigate to="/athlete/home" replace />} />
              <Route path="home" element={<AthleteHome />} />
              <Route path="planning" element={<AthletePlanning />} />
              <Route path="profile" element={<AthleteProfile />} />
            </Route>

            {/* Protected Coach Routes */}
            <Route path="/coach" element={<Layout />}>
              <Route index element={<Navigate to="/coach/home" replace />} />
              <Route path="home" element={<CoachHome />} />
              <Route path="planning" element={<CoachPlanning />} />
              <Route path="programs/:programId">
                <Route path="workouts" element={<ProgramWorkouts />} />
                <Route path="workouts/new" element={<CreateWorkout />} />
                <Route path="workouts/:workoutId/edit" element={<EditWorkout />} />
                <Route path="edit" element={<EditProgram />} />
              </Route>
              <Route path="profile" element={<CoachProfile />} />
            </Route>

            {/* Default Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;