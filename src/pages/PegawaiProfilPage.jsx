import { useState } from "react";
import { User, PencilLine, Save } from "lucide-react";
import { supabase } from "../integrations/supabase/client";

export default function PegawaiProfilPage() {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [user, setUser] = useState(storedUser);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(storedUser);
  const [loading, setLoading] = useState(false);

  // 🧠 Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 💾 Simpan perubahan ke Supabase (berdasarkan email)
  const handleSave = async () => {
    if (!formData?.email) {
      alert("❌ Email pengguna tidak ditemukan!");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("pegawai")
        .update({
          nama: formData.nama,
          nip: formData.nip,
          jabatan: formData.jabatan,
          pangkat: formData.pangkat,
          pendidikan_terakhir: formData.pendidikan_terakhir,
          jenis_kelamin: formData.jenis_kelamin,
          tempat_lahir: formData.tempat_lahir,
          tanggal_lahir: formData.tanggal_lahir,
          tmt_cpns: formData.tmt_cpns,
          tmt_pns: formData.tmt_pns,
        })
        .eq("email", formData.email); // 🔥 update berdasarkan email, bukan uuid

      if (error) throw error;

      localStorage.setItem("user", JSON.stringify(formData));
      setUser(formData);
      setEditMode(false);
      alert("✅ Data berhasil diperbarui!");
    } catch (err) {
      console.error("❌ Gagal update:", err.message);
      alert("Terjadi kesalahan saat menyimpan data pegawai!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center py-10 px-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden">
        {/* Header Profil */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white flex flex-col md:flex-row items-center gap-4">
          <div className="bg-white/20 p-4 rounded-full">
            <User size={60} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-wide">
              {user?.nama || "Nama Pegawai"}
            </h1>
            <p className="text-sm opacity-90 mt-1">{user?.jabatan}</p>
            <p className="text-sm text-indigo-100 mt-1">
              {user?.email || "Email belum tersedia"}
            </p>
          </div>
        </div>

        {/* Isi Profil */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-xl font-semibold text-indigo-700">
              📋 Informasi Pegawai
            </h2>

            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
              >
                <PencilLine size={16} /> Edit Data
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
              >
                <Save size={16} /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            )}
          </div>

          {/* Grid Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            {[
              { label: "Nama Lengkap", key: "nama" },
              { label: "NIP", key: "nip" },
              { label: "Jabatan", key: "jabatan" },
              { label: "Pangkat", key: "pangkat" },
              { label: "Jenis Kelamin", key: "jenis_kelamin" },
              { label: "Pendidikan Terakhir", key: "pendidikan_terakhir" },
              { label: "Tempat Lahir", key: "tempat_lahir" },
              { label: "Tanggal Lahir", key: "tanggal_lahir", type: "date" },
              { label: "TMT CPNS", key: "tmt_cpns", type: "date" },
              { label: "TMT PNS", key: "tmt_pns", type: "date" },
            ].map((field) => (
              <div key={field.key} className="space-y-1">
                <p className="text-sm text-gray-500">{field.label}</p>
                {editMode ? (
                  <input
                    type={field.type || "text"}
                    name={field.key}
                    value={formData[field.key] || ""}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                ) : (
                  <p className="font-medium">
                    {user?.[field.key] || "-"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-indigo-50 text-center py-4 border-t border-indigo-100">
          <p className="text-sm text-gray-500">
            💻 Sistem SI PRIMA | Dikembangkan oleh <b>Dea Ika Saskia</b>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            🕒 Terakhir diperbarui:{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}