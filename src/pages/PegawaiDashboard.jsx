import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Upload, FileText, User, BookOpen } from "lucide-react";
import { supabase } from "../integrations/supabase/client";

export default function PegawaiDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-blue-100 px-4 sm:px-6 md:px-10 py-8 md:py-10">
      {/* Header */}
      <div className="mb-10 text-center px-3">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-800 mb-3 tracking-tight leading-tight">
          Selamat Datang, {user?.nama || "Pegawai"} 👋
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          <span className="font-medium">Email:</span> {user?.email || "-"}
        </p>
        <p className="text-gray-600 text-sm sm:text-base">
          <span className="font-medium">Jabatan:</span> {user?.jabatan || "-"}
        </p>

        {/* Garis bawah animasi */}
        <div className="mt-4 h-1 w-24 sm:w-32 mx-auto bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full"></div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 mt-10">
        {/* Card Upload Berkas */}
        <div className="group relative bg-white rounded-2xl shadow-lg border border-indigo-100 hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition">
                <Upload size={22} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Upload Berkas
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Unggah dokumen pribadi seperti SK, sertifikat, atau surat tugas ke sistem.
            </p>
            <Link
              to="/pegawai-upload"
              className="inline-block w-full sm:w-auto text-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Akses Sekarang
            </Link>
          </div>
        </div>

        {/* Card Daftar Berkas */}
        <div className="group relative bg-white rounded-2xl shadow-lg border border-green-100 hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-100 text-green-600 rounded-full group-hover:scale-110 transition">
                <FileText size={22} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Daftar Berkas
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Lihat daftar berkas yang sudah kamu unggah secara lengkap di sini.
            </p>
            <Link
              to="/pegawai-berkas"
              className="inline-block w-full sm:w-auto text-center px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Lihat Berkas
            </Link>
          </div>
        </div>

        {/* Card Profil Pegawai */}
        <div className="group relative bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full group-hover:scale-110 transition">
                <User size={22} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                Profil Pegawai
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              Lihat dan perbarui informasi pribadimu agar selalu akurat dan up-to-date.
            </p>
            <Link
              to="/pegawai-profil"
              className="inline-block w-full sm:w-auto text-center px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition"
            >
              Buka Profil
            </Link>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-14 bg-white p-6 sm:p-8 rounded-2xl border-l-4 border-indigo-500 shadow-lg hover:shadow-xl transition-all">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen size={22} className="text-indigo-600" />
          <h2 className="text-base sm:text-lg font-semibold text-indigo-700">
            📘 Panduan Penggunaan
          </h2>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          Gunakan menu di sebelah kiri untuk mengunggah dokumen atau melihat berkas yang
          sudah tersimpan. Pastikan berkas berformat <b>PDF</b> dan diberi nama yang jelas
          agar mudah diidentifikasi.
        </p>
      </div>

      {/* Footer Info */}
      <footer className="text-center mt-12 text-gray-500 text-xs sm:text-sm border-t pt-6">
        <div className="flex flex-col items-center justify-center space-y-1">
          <p className="flex flex-wrap items-center justify-center gap-2 text-center">
            💻 Sistem ini dikembangkan oleh{" "}
            <span className="font-semibold text-indigo-700">
              Dea Ika Saskia
            </span>
          </p>
          <p>
            🕒 Last Update:{" "}
            <b>
              {new Date().toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </b>
          </p>
        </div>
      </footer>
    </div>
  );
}