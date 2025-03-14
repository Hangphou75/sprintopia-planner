
import {
  Routes,
  Route,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProtectedRoute } from "./components/auth/RoleProtectedRoute";
import { WorkoutDetails } from "./pages/athlete/WorkoutDetails";

// General pages
import { Profile } from './pages/Profile';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Legal from './pages/Legal';

// Athlete pages
import Programs from './pages/athlete/Programs';
import Planning from './pages/athlete/Planning';
import { ProgramWorkouts as AthleteProgramWorkouts } from './pages/athlete/ProgramWorkouts';
import EditWorkout from "./pages/individual-athlete/EditWorkout";

// Admin pages
import AdminHome from './pages/admin/Home';
import AdminUsers from './pages/admin/Users';
import { UserAthletes } from './pages/admin/UserAthletes';
import { EditUser } from './pages/admin/EditUser';
import AdminCompetitions from './pages/admin/Competitions';

// Coach pages
import CoachProfile from './pages/coach/Profile';
import CoachHome from './pages/coach/Home';
import Athletes from './pages/coach/Athletes';
import CoachPrograms from './pages/coach/Programs';
import CreateProgram from './pages/coach/CreateProgram';
import { EditProgram } from './pages/coach/EditProgram';
import { ProgramWorkouts as CoachProgramWorkouts } from './pages/coach/ProgramWorkouts';
import { CreateWorkout } from './pages/coach/CreateWorkout';
import { EditWorkout as CoachEditWorkout } from './pages/coach/EditWorkout';
import CoachPlanning from './pages/coach/Planning';
import { WorkoutFeedbacks } from './pages/coach/WorkoutFeedbacks';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          {/* General routes */}
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/profile" element={<RoleProtectedRoute allowedRoles={["admin", "coach", "athlete", "individual_athlete"]} />} >
            <Route index element={<Profile />} />
          </Route>

          {/* Athlete routes */}
          <Route path="/athlete" element={<RoleProtectedRoute allowedRoles={["athlete", "admin"]} />} >
            <Route path="programs" element={<Programs />} />
            <Route path="planning" element={<Planning />} />
            <Route path="programs/:programId/workouts" element={<AthleteProgramWorkouts />} />
            <Route path="programs/:programId/workouts/:workoutId" element={<WorkoutDetails />} />
          </Route>

          {/* Individual Athlete routes */}
          <Route path="/individual-athlete" element={<RoleProtectedRoute allowedRoles={["individual_athlete", "admin"]} />} >
            <Route path="programs" element={<Programs />} />
            <Route path="planning" element={<Planning />} />
            <Route path="programs/:programId/workouts" element={<AthleteProgramWorkouts />} />
            <Route path="programs/:programId/workouts/:workoutId/edit" element={<EditWorkout />} />
            <Route path="programs/:programId/workouts/:workoutId" element={<WorkoutDetails />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<RoleProtectedRoute allowedRoles={["admin"]} />} >
            <Route index element={<AdminHome />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<UserAthletes />} />
            <Route path="users/:id/edit" element={<EditUser />} />
            <Route path="users/:id/competitions" element={<AdminCompetitions />} />
          </Route>
          
          {/* Coach routes */}
          <Route path="/coach" element={<RoleProtectedRoute allowedRoles={["coach", "admin"]} />}>
            <Route index element={<CoachHome />} />
            <Route path="profile" element={<CoachProfile />} />
            <Route path="athletes" element={<Athletes />} />
            <Route path="programs" element={<CoachPrograms />} />
            <Route path="programs/new" element={<CreateProgram />} />
            <Route path="programs/:programId/edit" element={<EditProgram />} />
            <Route path="programs/:programId/workouts" element={<CoachProgramWorkouts />} />
            <Route path="programs/:programId/workouts/new" element={<CreateWorkout />} />
            <Route path="programs/:programId/workouts/:workoutId/edit" element={<CoachEditWorkout />} />
            <Route path="programs/:programId/workouts/:workoutId" element={<WorkoutDetails />} />
            <Route path="planning" element={<CoachPlanning />} />
            <Route path="feedback" element={<WorkoutFeedbacks />} />
          </Route>
          
          {/* No match route */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
