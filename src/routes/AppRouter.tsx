import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

import DashboardPage from "../pages/DashboardPage";

import CourseUnitPage from "../pages/CourseUnitPage";
import CourseUnitDetailsPage from "../pages/CourseUnitDetailsPage";
import LessonPage from "../pages/LessonPage";

import TutorDashboardPage from "../pages/TutorDashboardPage";
import CurriculumExplorerPage from "../pages/CurriculumExplorerPage";

import ProgrammeManagerPage from "../pages/ProgrammeManagerPage";
import CreateProgrammePage from "../pages/CreateProgrammePage";

import CreateCourseUnitPage from "../pages/CreateCourseUnitPage";

import ModuleManagerPage from "../pages/ModuleManagerPage";
import CreateModulePage from "../pages/CreateModulePage";

import CreateLessonPage from "../pages/CreateLessonPage";
import LessonBuilderPage from "../pages/LessonBuilderPage";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ====================================== */}
        {/* Public Pages */}
        {/* ====================================== */}

        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route path="/courses" element={<CourseUnitPage />} />

        <Route
          path="/courses/:slug"
          element={<CourseUnitDetailsPage />}
        />

        {/* ====================================== */}
        {/* Student Portal */}
        {/* ====================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lesson/:moduleId"
          element={
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          }
        />

        {/* ====================================== */}
        {/* Academic Management Portal */}
        {/* ====================================== */}

        <Route
          path="/tutor"
          element={
            <ProtectedRoute>
              <TutorDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Curriculum Explorer */}

        <Route
          path="/tutor/curriculum"
          element={
            <ProtectedRoute>
              <CurriculumExplorerPage />
            </ProtectedRoute>
          }
        />

        {/* ====================================== */}
        {/* Programme Management */}
        {/* ====================================== */}

        <Route
          path="/tutor/programmes"
          element={
            <ProtectedRoute>
              <ProgrammeManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/programmes/new"
          element={
            <ProtectedRoute>
              <CreateProgrammePage />
            </ProtectedRoute>
          }
        />

        {/* ====================================== */}
        {/* Course Unit Management */}
        {/* ====================================== */}

        <Route
          path="/tutor/course-units/new"
          element={
            <ProtectedRoute>
              <CreateCourseUnitPage />
            </ProtectedRoute>
          }
        />

        {/* ====================================== */}
        {/* Module Management */}
        {/* ====================================== */}

        <Route
          path="/tutor/modules"
          element={
            <ProtectedRoute>
              <ModuleManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/modules/new"
          element={
            <ProtectedRoute>
              <CreateModulePage />
            </ProtectedRoute>
          }
        />

        {/* ====================================== */}
        {/* Lesson Management */}
        {/* ====================================== */}

        <Route
          path="/tutor/lessons/new"
          element={
            <ProtectedRoute>
              <CreateLessonPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/lessons/builder"
          element={
            <ProtectedRoute>
              <LessonBuilderPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}