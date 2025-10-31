import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Login ke Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        console.warn("⚠️ Auth error:", authError.message);
        toast.error("Email atau password salah!");
        return;
      }

      // 2️⃣ Ambil data pegawai berdasarkan email (tanpa .single)
      const { data: pegawaiRows, error: pegawaiError } = await supabase
        .from("pegawai")
        .select("*")
        .ilike("email", email.trim().toLowerCase());

      console.log("📦 Semua data pegawai ditemukan:", pegawaiRows);
      console.log("⚠️ Error (jika ada):", pegawaiError);

      if (pegawaiError) {
        toast.error("Gagal mengambil data pegawai: " + pegawaiError.message);
        return;
      }

      // 3️⃣ Cek apakah data pegawai ditemukan
      if (!pegawaiRows || pegawaiRows.length === 0) {
        toast.error("Data pegawai tidak ditemukan di tabel!");
        return;
      }

      // 4️⃣ Kalau ada duplikat, ambil baris pertama
      const pegawaiData = pegawaiRows[0];

      // 5️⃣ Validasi kolom 'role'
      if (!pegawaiData.role || pegawaiData.role.trim() === "") {
        toast.error("Kolom 'role' kosong di data pegawai!");
        return;
      }

      // 6️⃣ Simpan ke localStorage
      localStorage.setItem("user", JSON.stringify(pegawaiData));
      toast.success(`Selamat datang, ${pegawaiData.nama || "Pegawai"}!`);

      // 7️⃣ Arahkan sesuai role
      setTimeout(() => {
        if (pegawaiData.role.toLowerCase() === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/pegawai-dashboard");
        }
      }, 800);
    } catch (err) {
      console.error("❌ Login Error:", err);
      toast.error("Terjadi kesalahan saat menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(to bottom right, rgba(255,240,230,0.3), rgba(245,222,179,0.3)),
          url('/bg-pkm.jpg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <Toaster position="top-right" reverseOrder={false} />

      <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/10 via-orange-600/10 to-yellow-500/10"></div>

      <div
        className={`relative z-10 bg-gradient-to-br from-amber-50/50 via-white/30 to-amber-100/40 backdrop-blur-lg p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] w-full max-w-xs md:max-w-sm border border-white/30 text-center transform transition-all duration-700 ease-out ${
          fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        } hover:shadow-amber-200/50 hover:scale-[1.02]`}
      >
        <img
          src="/logo-pkm.png"
          alt="Logo Puskesmas"
          className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 drop-shadow-md transition-transform duration-500 hover:scale-110"
        />

        <h2 className="text-xl md:text-2xl font-extrabold mb-6 bg-gradient-to-r from-amber-800 via-orange-700 to-amber-600 bg-clip-text text-transparent tracking-wide">
          LOGIN SI PRIMA
        </h2>

        <form onSubmit={handleLogin} className="space-y-5 text-left">
          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-900">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-amber-200 rounded-md p-2.5 bg-white/60 focus:ring-2 focus:ring-amber-400 outline-none transition-all placeholder:text-gray-500"
              placeholder="Masukkan email anda"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-amber-900">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-amber-200 rounded-md p-2.5 bg-white/60 focus:ring-2 focus:ring-amber-400 outline-none transition-all placeholder:text-gray-500"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-md text-white text-base font-semibold shadow-md transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg hover:shadow-amber-300/50"
            }`}
          >
            {loading ? "Memproses..." : "LOGIN"}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-amber-900/90">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-amber-700 font-semibold hover:underline hover:text-orange-600 transition"
          >
            Daftar di sini
          </Link>
        </p>

        <p className="mt-5 text-xs text-amber-800/80 italic">
          Sistem Informasi Kepegawaian Puskesmas Pekanbaru Kota © 2025
        </p>
      </div>
    </div>
  );
}