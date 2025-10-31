import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, Users, Upload, FileText, LogOut, Loader2 } from "lucide-react";
import { supabase } from "../integrations/supabase/client";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔍 Ambil role user saat ini
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const email = data?.user?.email;

        if (!email) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data: pegawai } = await supabase
          .from("pegawai")
          .select("role")
          .eq("email", email)
          .single();

        setRole(pegawai?.role || "pegawai"); // default pegawai
      } catch (error) {
        console.error("Gagal ambil role:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  // 🔒 Logout
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
    if (!confirmLogout) return;

    try {
      await supabase.auth.signOut();
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      alert("Terjadi kesalahan saat logout!");
      console.error("Logout error:", error.message);
    }
  };

  // 🧭 Menu berdasarkan role
  const menuItems =
    role === "admin"
      ? [
          { to: "/admin-dashboard", label: "Dashboard", icon: <Home size={18} /> },
          { to: "/admin-pegawai", label: "Data Pegawai", icon: <Users size={18} /> },
          { to: "/admin-berkas", label: "Daftar Berkas", icon: <FileText size={18} /> },
        ]
      : [
          { to: "/pegawai-dashboard", label: "Dashboard", icon: <Home size={18} /> },
          { to: "/pegawai-upload", label: "Upload Berkas", icon: <Upload size={18} /> },
          { to: "/pegawai-berkas", label: "Daftar Berkas", icon: <FileText size={18} /> },
        ];

  // 🔄 Tampilan loading
  if (loading) {
    return (
      <div className="bg-gradient-to-b from-indigo-600 to-blue-800 text-white w-64 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="w-64 min-h-screen flex flex-col justify-between text-white shadow-2xl border-r border-indigo-800 bg-gradient-to-b from-indigo-500 via-blue-600 to-indigo-950">
      <div>
        {/* Header */}
        <div className="p-6 text-center font-bold text-2xl border-b border-indigo-700 backdrop-blur-sm bg-white/10">
          <h1 className="tracking-wide drop-shadow-lg">SI PRIMA</h1>
          <p className="text-xs font-light text-indigo-200 mt-1 italic">
            Sistem Informasi Pengarsipan Pegawai Puskesmas Pekanbaru Kota
          </p>
        </div>

        {/* Navigasi */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md scale-[1.02]"
                    : "hover:bg-white/10 hover:scale-[1.01]"
                }`}
              >
                <span className={`${isActive ? "text-white" : "text-indigo-200"}`}>
                  {item.icon}
                </span>
                <span
                  className={`text-sm ${
                    isActive ? "font-semibold text-white" : "text-indigo-100"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tombol Logout */}
      <div className="p-4 border-t border-indigo-700 bg-indigo-900/40 backdrop-blur-md">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-700 to-indigo-900 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300"
        >
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </div>
  );
}