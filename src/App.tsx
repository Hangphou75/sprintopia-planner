import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleProtectedRoute } from "./components/auth/RoleProtectedRoute";
import { WorkoutDetails } from "./pages/athlete/WorkoutDetails";

// General pages
import { Profile } from './pages/Profile';
import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { Contact } from './pages/Contact';
import { Legal } from './pages/Legal';

// Athlete pages
import { Programs as AthletePrograms } from './pages/athlete/Programs';
import { Planning as AthletePlanning } from './pages/athlete/Planning';
import { ProgramWorkouts as AthleteProgramWorkouts } from './pages/athlete/ProgramWorkouts';
import { EditWorkout as IndividualEditWorkout } from './pages/individual-athlete/EditWorkout';

// Admin pages
import { Home as AdminHome } from './pages/admin/Home';
import { Users as AdminUsers } from './pages/admin/Users';
import { UserAthletes } from './pages/admin/UserAthletes';
import { EditUser } from './pages/admin/EditUser';
import { Competitions as AdminCompetitions } from './pages/admin/Competitions';

// Coach pages
import { Profile as CoachProfile } from './pages/coach/Profile';
import { Home as CoachHome } from './pages/coach/Home';
import { Athletes } from './pages/coach/Athletes';
import { Programs } from './pages/coach/Programs';
import { CreateProgram } from './pages/coach/CreateProgram';
import { EditProgram } from './pages/coach/EditProgram';
import { ProgramWorkouts } from './pages/coach/ProgramWorkouts';
import { CreateWorkout } from './pages/coach/CreateWorkout';
import { EditWorkout } from './pages/coach/EditWorkout';
import { Planning as CoachPlanning } from './pages/coach/Planning';
import { WorkoutFeedbacks } from './pages/coach/WorkoutFeedbacks';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* General routes */}
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/profile" element={<RoleProtectedRoute />} >
              <Route index element={<Profile />} />
            </Route>

            {/* Athlete routes */}
            <Route path="/athlete" element={<RoleProtectedRoute role="athlete" />} >
              <Route path="programs" element={<AthletePrograms />} />
              <Route path="planning" element={<AthletePlanning />} />
              <Route path="programs/:programId/workouts" element={<AthleteProgramWorkouts />} />
              <Route path="programs/:programId/workouts/:workoutId" element={<WorkoutDetails />} />
            </Route>

            {/* Individual Athlete routes */}
            <Route path="/individual-athlete" element={<RoleProtectedRoute role="individual_athlete" />} >
              <Route path="programs" element={<AthletePrograms />} />
              <Route path="planning" element={<AthletePlanning />} />
              <Route path="programs/:programId/workouts" element={<AthleteProgramWorkouts />} />
              <Route path="programs/:programId/workouts/:workoutId/edit" element={<IndividualEditWorkout />} />
              <Route path="programs/:programId/workouts/:workoutId" element={<WorkoutDetails />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<RoleProtectedRoute role="admin" />} >
              <Route index element={<AdminHome />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:id" element={<UserAthletes />} />
              <Route path="users/:id/edit" element={<EditUser />} />
              <Route path="users/:id/competitions" element={<AdminCompetitions />} />
            </Route>
            
            {/* Coach routes */}
            <Route path="/coach" element={<RoleProtectedRoute role="coach" />}>
              <Route index element={<CoachHome />} />
              <Route path="profile" element={<CoachProfile />} />
              <Route path="athletes" element={<Athletes />} />
              <Route path="programs" element={<Programs />} />
              <Route path="programs/new" element={<CreateProgram />} />
              <Route path="programs/:programId/edit" element={<EditProgram />} />
              <Route path="programs/:programId/workouts" element={<ProgramWorkouts />} />
              <Route path="programs/:programId/workouts/new" element={<CreateWorkout />} />
              <Route path="programs/:programId/workouts/:workoutId/edit" element={<EditWorkout />} />
              <Route path="programs/:programId/workouts/:workoutId" element={<WorkoutDetails />} />
              <Route path="planning" element={<CoachPlanning />} />
              <Route path="feedback" element={<WorkoutFeedbacks />} />
            </Route>
            
            {/* No match route */}
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
