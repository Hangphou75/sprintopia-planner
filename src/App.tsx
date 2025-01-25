import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const currentPath = window.location.pathname;
  const userRole = user?.role;
  const isCorrectRole = currentPath.startsWith(`/${userRole}`);

  if (!isCorrectRole) {
    return <Navigate to={`/${userRole}/home`} />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/athlete"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/athlete/home" />} />
              <Route path="home" element={<AthleteHome />} />
              <Route path="planning" element={<AthletePlanning />} />
              <Route path="profile" element={<AthleteProfile />} />
            </Route>

            <Route
              path="/coach"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/coach/home" />} />
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

            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;