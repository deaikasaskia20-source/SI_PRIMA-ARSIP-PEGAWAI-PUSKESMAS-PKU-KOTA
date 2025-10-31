import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

export default function PegawaiDaftarBerkas() {
  const [berkas, setBerkas] = useState({});
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [editValue, setEditValue] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email;

  // 🟢 Ambil data berkas dari Supabase
  useEffect(() => {
    const fetchBerkas = async () => {
      if (!email) {
        console.warn("⚠️ Email user tidak ditemukan di localStorage!");
        setLoading(false);
        return;
      }

      console.log("📨 Memuat berkas untuk:", email);

      const { data, error } = await supabase
        .from("pegawai")
        .select("berkas_url")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        console.error("❌ Gagal memuat berkas:", error.message);
        setBerkas({});
      } else if (data?.berkas_url) {
        try {
          const parsed =
            typeof data.berkas_url === "string"
              ? JSON.parse(data.berkas_url)
              : data.berkas_url;

          if (parsed && typeof parsed === "object") {
            setBerkas(parsed);
            console.log("📦 Data berkas ditemukan:", parsed);
          } else {
            console.warn("⚠️ Format berkas_url tidak sesuai, dikosongkan.");
            setBerkas({});
          }
        } catch (err) {
          console.error("⚠️ Gagal parse JSON:", err.message);
          setBerkas({});
        }
      } else {
        console.log("ℹ️ Tidak ada berkas_url untuk user ini.");
        setBerkas({});
      }

      setLoading(false);
    };

    fetchBerkas();
  }, [email]);

  // 🟣 Klik tombol Edit
  const handleEdit = (nama, url) => {
    setEditItem(nama);
    setEditValue(url || "");
  };

  // 🟢 Simpan perubahan ke Supabase
  const handleSave = async () => {
    if (!editItem) return;

    const updatedBerkas = { ...berkas, [editItem]: { url: editValue } };

    const { error } = await supabase
      .from("pegawai")
      .update({ berkas_url: updatedBerkas })
      .eq("email", email);

    if (error) {
      console.error("❌ Gagal menyimpan perubahan:", error.message);
      alert("Gagal memperbarui berkas!");
    } else {
      alert("✅ Berkas berhasil diperbarui!");
      setBerkas(updatedBerkas);
      setEditItem(null);
      setEditValue("");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500 animate-pulse">
        🔄 Memuat data berkas...
      </p>
    );

  return (
    <div className="p-8 bg-gradient-to-br from-indigo-50 to-blue-100 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">
        📂 Daftar Berkas Anda
      </h1>

      {berkas && Object.keys(berkas).length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(berkas).map(([nama, data]) => {
            const url = data?.url || data;
            return (
              <div
                key={nama}
                className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition"
              >
                <p className="font-semibold text-gray-700 mb-2">{nama}</p>

                <div className="flex items-center gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                  >
                    👁️ Lihat File
                  </a>
                  <button
                    onClick={() => handleEdit(nama, url)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
                  >
                    ✏️ Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 italic">
          Anda belum mengunggah berkas apa pun.
        </p>
      )}

      {/* 🟠 Modal Edit */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold text-blue-700 mb-4">
              ✏️ Edit Berkas - {editItem}
            </h2>

            <label className="block text-sm mb-2 text-gray-600">
              URL File:
            </label>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Masukkan URL baru..."
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditItem(null);
                  setEditValue("");
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}