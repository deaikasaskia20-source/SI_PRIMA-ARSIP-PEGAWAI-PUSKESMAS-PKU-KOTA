import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

export default function ProtectedRoute({ allowedRole, children }) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user || error) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      // 🔹 Ambil role dari metadata Supabase (lebih cepat dan aman)
      let role = user.user_metadata?.role;

      // 🔹 Jika belum ada role di metadata, coba ambil dari tabel pegawai
      if (!role) {
        const { data: pegawai } = await supabase
          .from("pegawai")
          .select("role")
          .eq("email", user.email)
          .single();

        role = pegawai?.role || null;
      }

      setUserRole(role);
      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-blue-700 font-medium">
        🔄 Memuat halaman...
      </div>
    );

  // 🔒 Jika belum login
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Jika role tidak sesuai
  if (allowedRole && userRole !== allowedRole) {
    return userRole === "admin" ? (
      <Navigate to="/admin-dashboard" replace />
    ) : (
      <Navigate to="/pegawai-dashboard" replace />
    );
  }

  // ✅ Jika role sesuai
  return children ? children : <Outlet />;
}
