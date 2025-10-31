import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PegawaiDashboard from "./pages/PegawaiDashboard";
import PegawaiUploadBerkas from "./pages/PegawaiUploadBerkas";
import PegawaiProfilPage from "./pages/PegawaiProfilPage";
import PegawaiDaftarBerkas from "./pages/PegawaiDaftarBerkas";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPegawaiPage from "./pages/AdminPegawaiPage";
import DaftarBerkasPage from "./pages/DaftarBerkasPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PegawaiLayout from "./layouts/PegawaiLayout";
import AdminUpdatePegawaiPage from "./pages/AdminUpdatePegawaiPage"; // ✅ Tambahan baru

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman Umum */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* 🔹 Halaman Admin */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-pegawai" element={<AdminPegawaiPage />} />
          <Route path="/admin-berkas" element={<DaftarBerkasPage />} />
          <Route path="/admin-update/:id" element={<AdminUpdatePegawaiPage />} /> {/* ✅ Menu Update */}
        </Route>

        {/* 🔹 Halaman Pegawai */}
        <Route
          element={
            <ProtectedRoute allowedRole="pegawai">
              <PegawaiLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/pegawai-dashboard" element={<PegawaiDashboard />} />
          <Route path="/pegawai-profil" element={<PegawaiProfilPage />} />
          <Route path="/pegawai-upload" element={<PegawaiUploadBerkas />} />
          <Route path="/pegawai-berkas" element={<PegawaiDaftarBerkas />} />
        </Route>
      </Routes>
    </Router>
  );
}


export default App;