import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Upload, FileText, User, LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "../integrations/supabase/client";

export default function PegawaiLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    {
      to: "/pegawai-dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      to: "/pegawai-profil",
      label: "Profil Pegawai",
      icon: <User size={18} />,
    },
    {
      to: "/pegawai-upload",
      label: "Upload Berkas",
      icon: <Upload size={18} />,
    },
    {
      to: "/pegawai-berkas",
      label: "Daftar Berkas",
      icon: <FileText size={18} />,
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-indigo-800 to-indigo-950 text-white shadow-2xl flex flex-col justify-between rounded-r-3xl overflow-hidden">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-indigo-700 text-center backdrop-blur-sm bg-white/10">
            <h1 className="text-2xl font-extrabold tracking-wide drop-shadow-lg">
              SI PRIMA
            </h1>
            <p className="text-xs text-indigo-200 mt-1 italic">
              Sistem Informasi Pengarsipan Pegawai Puskesmas Pekanbaru Kota
            </p>
          </div>

          {/* Navigasi */}
          <nav className="mt-6 px-3 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all duration-200 ${
                  location.pathname === item.to
                    ? "bg-indigo-600 shadow-md scale-[1.02]"
                    : "hover:bg-indigo-600/70"
                }`}
              >
                <span
                  className={`${
                    location.pathname === item.to
                      ? "text-white"
                      : "text-indigo-200"
                  }`}
                >
                  {item.icon}
                </span>
                <span
                  className={`${
                    location.pathname === item.to
                      ? "text-white font-semibold"
                      : "text-indigo-100"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Tombol Keluar */}
        <div className="p-5 border-t border-indigo-700 bg-indigo-900/40 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-indigo-700 to-indigo-800 hover:from-indigo-600 hover:to-indigo-700 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Konten utama */}
      <main className="flex-1 p-10 overflow-y-auto bg-gradient-to-tr from-white/90 to-indigo-50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto animate-fade-in">
          <Outlet /> {/* Halaman dinamis tampil di sini */}
        </div>
      </main>
    </div>
  );
}