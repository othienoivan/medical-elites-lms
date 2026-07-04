import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import CoursePage from "../pages/CoursePage";
import CourseDetailsPage from "../pages/CourseDetailsPage";
import LessonPage from "../pages/LessonPage";
import TutorDashboardPage from "../pages/TutorDashboardPage";
import CreateCoursePage from "../pages/CreateCoursePage";
import CreateProgrammePage from "../pages/CreateProgrammePage";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route path="/courses" element={<CoursePage />} />

        <Route path="/courses/:slug" element={<CourseDetailsPage />} />

        {/* Student Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Lesson Player */}
        <Route
          path="/lesson/:moduleId"
          element={
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          }
        />

        {/* Tutor Dashboard */}
        <Route
          path="/tutor"
          element={
            <ProtectedRoute>
              <TutorDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Create Programme */}
        <Route
          path="/tutor/programmes/new"
          element={
            <ProtectedRoute>
              <CreateProgrammePage />
            </ProtectedRoute>
          }
        />

        {/* Create Course */}
        <Route
          path="/tutor/courses/new"
          element={
            <ProtectedRoute>
              <CreateCoursePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}