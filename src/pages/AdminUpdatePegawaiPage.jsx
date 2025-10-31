import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";

export default function AdminUpdatePegawaiPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    nip: "",
    jabatan: "",
    jenis_kelamin: "",
    pangkat: "",
    pendidikan_terakhir: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    TMT_CPNS: "",
    TMT_PNS: "",
    role: "pegawai",
  });
  const [loading, setLoading] = useState(true);

  // 🔹 Ambil data pegawai berdasarkan ID
  useEffect(() => {
    const fetchPegawai = async () => {
      const { data, error } = await supabase
        .from("pegawai")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("❌ Gagal memuat data pegawai.");
        navigate("/admin-pegawai");
      } else {
        setForm(data);
      }
      setLoading(false);
    };

    fetchPegawai();
  }, [id, navigate]);

  // 🔹 Update data ke Supabase
  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("pegawai").update(form).eq("id", id);

    if (error) {
      alert("❌ Gagal memperbarui data: " + error.message);
    } else {
      alert("✅ Data pegawai berhasil diperbarui!");
      navigate("/admin-pegawai");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 animate-pulse">Memuat data pegawai...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-3xl border border-gray-200">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
          ✏️ Update Data Pegawai
        </h2>

        <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4 text-sm">
          {[
            ["Nama Lengkap", "nama", "text"],
            ["Email", "email", "email"],
            ["NIP", "nip", "text"],
            ["Jabatan", "jabatan", "text"],
            ["Pangkat / Golongan", "pangkat", "text"],
            ["Pendidikan Terakhir", "pendidikan_terakhir", "text"],
            ["Tempat Lahir", "tempat_lahir", "text"],
            ["Tanggal Lahir", "tanggal_lahir", "date"],
            ["TMT CPNS", "TMT_CPNS", "date"],
            ["TMT PNS", "TMT_PNS", "date"],
          ].map(([label, key, type]) => (
            <div key={key}>
              <label className="block font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={form[key] || ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          ))}

          {/* Jenis Kelamin */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Jenis Kelamin
            </label>
            <select
              value={form.jenis_kelamin || ""}
              onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Pilih</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role || ""}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="pegawai">Pegawai</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Tombol Simpan */}
          <div className="col-span-2 mt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}