
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "./components/auth/RoleProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import { Register } from "./pages/auth/Register";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import AthleteHome from "./pages/athlete/Home";
import AthletePlanning from "./pages/athlete/Planning";
import AthleteProfile from "./pages/athlete/Profile";
import CoachHome from "./pages/coach/Home";
import Programs from "./pages/coach/Programs";
import { ProgramWorkouts } from "./pages/coach/ProgramWorkouts";
import CreateProgram from "./pages/coach/CreateProgram";
import { EditProgram } from "./pages/coach/EditProgram";
import { CreateWorkout } from "./pages/coach/CreateWorkout";
import { EditWorkout } from "./pages/coach/EditWorkout";
import Athletes from "./pages/coach/Athletes";
import CoachProfile from "./pages/coach/Profile";
import { WorkoutDetails } from "./pages/athlete/WorkoutDetails";
import CoachPlanning from "./pages/coach/Planning";
import IndividualAthleteHome from "./pages/individual-athlete/Home";
import IndividualAthletePlanning from "./pages/individual-athlete/Planning";
import IndividualAthleteProfile from "./pages/individual-athlete/Profile";
import { IndividualCreateWorkout } from "./pages/individual-athlete/CreateWorkout";
import { IndividualEditWorkout } from "./pages/individual-athlete/EditWorkout";
import { IndividualProgramWorkouts } from "./pages/individual-athlete/ProgramWorkouts";
import Programs from "./pages/individual-athlete/Programs";
import GenerateProgram from "./pages/individual-athlete/GenerateProgram";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route element={<RoleProtectedRoute allowedRoles={["athlete"]} />}>
              <Route path="/athlete" element={<AthleteHome />} />
              <Route path="/athlete/planning" element={<AthletePlanning />} />
              <Route path="/athlete/profile" element={<AthleteProfile />} />
              <Route path="/athlete/programs/:programId/workouts" element={<ProgramWorkouts />} />
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
              <Route path="/coach/programs/:programId/workouts/:workoutId" element={<WorkoutDetails />} />
              <Route path="/coach/athletes" element={<Athletes />} />
              <Route path="/coach/planning" element={<CoachPlanning />} />
              <Route path="/coach/profile" element={<CoachProfile />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={["individual_athlete"]} />}>
              <Route path="/individual-athlete" element={<IndividualAthleteHome />} />
              <Route path="/individual-athlete/planning" element={<Programs />} />
              <Route path="/individual-athlete/planning/:programId" element={<IndividualAthletePlanning />} />
              <Route path="/individual-athlete/profile" element={<IndividualAthleteProfile />} />
              <Route path="/individual-athlete/programs/:programId/workouts" element={<IndividualProgramWorkouts />} />
              <Route path="/individual-athlete/programs/:programId/workouts/:workoutId" element={<WorkoutDetails />} />
              <Route path="/individual-athlete/programs/new" element={<CreateProgram />} />
              <Route path="/individual-athlete/programs/:programId/edit" element={<EditProgram />} />
              <Route path="/individual-athlete/programs/:programId/workouts/new" element={<IndividualCreateWorkout />} />
              <Route path="/individual-athlete/programs/:programId/workouts/:workoutId/edit" element={<IndividualEditWorkout />} />
              <Route path="/individual-athlete/programs/generate" element={<GenerateProgram />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
