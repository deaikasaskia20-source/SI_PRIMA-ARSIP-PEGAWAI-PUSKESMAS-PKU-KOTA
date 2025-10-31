import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    nip: "",
    jenis_kelamin: "",
    pangkat: "",
    pendidikan_terakhir: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    tmt_cpns: "",
    tmt_pns: "",
    jabatan: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🟢 Handle registrasi akun
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Validasi input wajib
      if (!form.email || !form.password || !form.nama) {
        throw new Error("Semua kolom wajib diisi!");
      }

      // 2️⃣ Pastikan email belum dipakai di tabel pegawai
      const { data: existing, error: existingError } = await supabase
        .from("pegawai")
        .select("email")
        .eq("email", form.email)
        .maybeSingle();

      if (existingError) throw existingError;
      if (existing) throw new Error("Email sudah terdaftar. Silakan login.");

      // 3️⃣ Buat akun di Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: undefined, // Nonaktifkan redirect verifikasi
          data: { nama: form.nama, role: "pegawai" },
        },
      });

      if (authError) {
        console.warn("⚠️ Auth warning:", authError.message);
      }

      // 4️⃣ Simpan biodata pegawai ke tabel "pegawai"
      const { error: insertError } = await supabase.from("pegawai").insert([
        {
          nama: form.nama,
          email: form.email,
          password: form.password,
          role: "pegawai",
          jabatan: form.jabatan || null,
          nip: form.nip || null,
          jenis_kelamin: form.jenis_kelamin || null,
          pangkat: form.pangkat || null,
          pendidikan_terakhir: form.pendidikan_terakhir || null,
          tempat_lahir: form.tempat_lahir || null,
          tanggal_lahir: form.tanggal_lahir
            ? new Date(form.tanggal_lahir).toISOString()
            : null,
          tmt_cpns: form.tmt_cpns
            ? new Date(form.tmt_cpns).toISOString()
            : null,
          tmt_pns: form.tmt_pns
            ? new Date(form.tmt_pns).toISOString()
            : null,
          berkas_url: {}, // ✅ JSONB kosong default
        },
      ]);

      if (insertError) {
        console.error("Insert error:", insertError);
        throw new Error("Gagal menyimpan data pegawai ke database.");
      }

      alert("✅ Akun pegawai berhasil dibuat! Silakan login.");
      navigate("/login");
    } catch (err) {
      console.error("❌ Error:", err.message);
      setError(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(to bottom right, rgba(255,245,230,0.85), rgba(250,235,210,0.8)),
          url('/bg-pkm.jpg')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        filter: "brightness(1.05)",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/15 via-orange-600/15 to-yellow-500/15 backdrop-blur-[1px]" />

      <div
        className={`relative z-10 bg-gradient-to-br from-amber-50/60 via-white/40 to-amber-100/40 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-3xl border border-white/30 transition-all duration-700 ${
          fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        } hover:shadow-amber-200/50`}
      >
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-amber-800 to-orange-600 bg-clip-text text-transparent tracking-wide">
          Form Registrasi Pegawai SI PRIMA
        </h2>

        {error && (
          <p className="text-red-600 text-center mb-4 bg-red-100/60 p-2 rounded-md text-sm">
            {error}
          </p>
        )}

        <form
          onSubmit={handleRegister}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm"
        >
          {[
            ["Nama Lengkap", "nama", "text"],
            ["NIP", "nip", "text"],
            ["Email", "email", "email"],
            ["Password", "password", "password"],
            ["Pangkat/Golongan", "pangkat", "text"],
            ["Pendidikan Terakhir", "pendidikan_terakhir", "text"],
            ["Tempat Lahir", "tempat_lahir", "text"],
            ["Tanggal Lahir", "tanggal_lahir", "date"],
            ["TMT CPNS", "tmt_cpns", "date"],
            ["TMT PNS", "tmt_pns", "date"],
            ["Jabatan", "jabatan", "text"],
          ].map(([label, name, type]) => (
            <div key={name}>
              <label className="block font-semibold mb-1 text-amber-900">
                {label}
              </label>
              <input
                name={name}
                type={type}
                className="w-full border border-amber-200 rounded-md p-2.5 bg-white/70 focus:ring-2 focus:ring-amber-400 outline-none"
                value={form[name]}
                onChange={handleChange}
                required={["nama", "email", "password", "jabatan"].includes(name)}
              />
            </div>
          ))}

          <div>
            <label className="block font-semibold mb-1 text-amber-900">
              Jenis Kelamin
            </label>
            <select
              name="jenis_kelamin"
              className="w-full border border-amber-200 rounded-md p-2.5 bg-white/70 focus:ring-2 focus:ring-amber-400 outline-none"
              value={form.jenis_kelamin}
              onChange={handleChange}
              required
            >
              <option value="">Pilih</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-md text-white font-semibold shadow-md transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg hover:shadow-amber-300/50"
              }`}
            >
              {loading ? "Mendaftarkan..." : "DAFTAR AKUN"}
            </button>
          </div>
        </form>

        <p className="text-center text-sm mt-5 text-amber-900/90">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-amber-700 font-semibold hover:underline hover:text-orange-600 transition"
          >
            Login di sini
          </Link>
        </p>

        <p className="mt-4 text-xs text-amber-700/80 italic text-center">
          Sistem Informasi Kepegawaian Puskesmas Pekanbaru Kota © 2025
        </p>
      </div>
    </div>
  );
}