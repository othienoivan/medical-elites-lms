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

import LessonManagerPage from "../pages/LessonManagerPage";
import CreateLessonPage from "../pages/CreateLessonPage";
import LessonBuilderPage from "../pages/LessonBuilderPage";
import LessonPreviewPage from "../pages/LessonPreviewPage";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/courses" element={<CourseUnitPage />} />
        <Route path="/courses/:slug" element={<CourseUnitDetailsPage />} />

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

        <Route
          path="/tutor"
          element={
            <ProtectedRoute>
              <TutorDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/curriculum"
          element={
            <ProtectedRoute>
              <CurriculumExplorerPage />
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/tutor/course-units"
          element={
            <ProtectedRoute>
              <CreateCourseUnitPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/course-units/new"
          element={
            <ProtectedRoute>
              <CreateCourseUnitPage />
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/tutor/lessons"
          element={
            <ProtectedRoute>
              <LessonManagerPage />
            </ProtectedRoute>
          }
        />

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

        <Route
          path="/tutor/lessons/:lessonId/builder"
          element={
            <ProtectedRoute>
              <LessonBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/lessons/:lessonId/preview"
          element={
            <ProtectedRoute>
              <LessonPreviewPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}