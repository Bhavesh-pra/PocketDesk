import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ImagesPage from "./pages/ImagesPage";
import VideosPage from "./pages/VideosPage";
import TodoPage from "./pages/TodoPage";

import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import PdfPage from "./pages/PdfPage";
import AlbumPage from "./pages/AlbumPage";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/chat/:sessionId" element={<Chat />} />
            <Route path="/pdfs" element={<PdfPage />} />
            <Route path="/images" element={<ImagesPage />} />
            <Route path="/videos" element={<VideosPage />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="/images/:albumId" element={<AlbumPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}