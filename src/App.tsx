import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import AthleteHome from "./pages/athlete/Home";
import AthletePlanning from "./pages/athlete/Planning";
import AthleteProfile from "./pages/athlete/Profile";
import CoachHome from "./pages/coach/Home";
import CoachPlanning from "./pages/coach/Planning";
import CoachProfile from "./pages/coach/Profile";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route element={<Layout />}>
                <Route path="athlete">
                  <Route path="home" element={<AthleteHome />} />
                  <Route path="planning" element={<AthletePlanning />} />
                  <Route path="profile" element={<AthleteProfile />} />
                  <Route index element={<Navigate to="home" replace />} />
                </Route>
                <Route path="coach">
                  <Route path="home" element={<CoachHome />} />
                  <Route path="planning" element={<CoachPlanning />} />
                  <Route path="profile" element={<CoachProfile />} />
                  <Route index element={<Navigate to="home" replace />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
            <Toaster />
            <Sonner />
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;