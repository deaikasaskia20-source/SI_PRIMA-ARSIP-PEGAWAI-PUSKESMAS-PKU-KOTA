import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";

export default function LoginPegawaiPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // 🔐 Login ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email atau password salah!");
      return;
    }

    // 🧭 Cek data pegawai dari tabel
    const { data: userData, error: fetchError } = await supabase
      .from("pegawai")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError || !userData) {
      setError("Akun tidak ditemukan di sistem pegawai!");
      return;
    }

    // 💾 Simpan data pegawai ke localStorage
    localStorage.setItem("user", JSON.stringify(userData));

    // 🚀 Arahkan ke dashboard pegawai
    navigate("/pegawai-dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          LOGIN PEGAWAI
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <label className="text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 rounded-lg shadow-md hover:opacity-90 transition duration-300"
        >
          LOGIN
        </button>

        <div className="mt-4 text-center">
          <span className="text-gray-600 text-sm">Belum punya akun?</span>{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Daftar di sini
          </Link>
        </div>
      </form>
    </div>
  );
}