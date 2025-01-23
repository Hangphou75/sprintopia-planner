import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import AthleteHome from "./pages/athlete/Home";
import AthletePlanning from "./pages/athlete/Planning";
import AthleteProfile from "./pages/athlete/Profile";
import CoachHome from "./pages/coach/Home";
import CoachPlanning from "./pages/coach/Planning";
import CoachProfile from "./pages/coach/Profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/athlete" element={<Layout />}>
              <Route path="home" element={<AthleteHome />} />
              <Route path="planning" element={<AthletePlanning />} />
              <Route path="profile" element={<AthleteProfile />} />
            </Route>
            <Route path="/coach" element={<Layout />}>
              <Route path="home" element={<CoachHome />} />
              <Route path="planning" element={<CoachPlanning />} />
              <Route path="profile" element={<CoachProfile />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;