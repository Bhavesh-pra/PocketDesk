import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import PDFPage from "./pages/PdfPage";
import ImagesPage from "./pages/ImagesPage";
import VideosPage from "./pages/VideosPage";
import TodoPage from "./pages/TodoPage";

import AppLayout from "./layout/AppLayout";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import PdfPage from "./pages/PdfPage";
import AlbumPage from "./pages/AlbumPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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

      </Routes>
    </BrowserRouter>
  );
}