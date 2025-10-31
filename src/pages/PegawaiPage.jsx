import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Eye } from "lucide-react";

export default function PegawaiPage() {
  const [pegawai, setPegawai] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 🔹 Ambil kolom yang ada di tabel pegawai (tanpa id)
        let query = supabase
          .from("pegawai")
          .select("nama, email, nip, jabatan, berkas_url");

        // 🔹 Jika role pegawai → tampilkan hanya datanya sendiri
        if (role === "pegawai" && email) {
          query = query.eq("email", email);
        }

        const { data, error } = await query;
        if (error) throw error;

        setPegawai(data || []);
      } catch (err) {
        console.error("Gagal memuat data pegawai:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [role, email]);

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Memuat data...</p>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Data Pegawai</h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">Nama</th>
              <th className="p-3">Email</th>
              <th className="p-3">NIP</th>
              <th className="p-3">Jabatan</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pegawai.length > 0 ? (
              pegawai.map((p) => {
                // Pastikan JSON bisa dibaca
                let urls = {};
                try {
                  urls =
                    typeof p.berkas_url === "string"
                      ? JSON.parse(p.berkas_url)
                      : p.berkas_url || {};
                } catch {
                  urls = {};
                }

                return (
                  <tr key={p.nip} className="border-b hover:bg-blue-50 transition">
                    <td className="p-3">{p.nama}</td>
                    <td className="p-3">{p.email}</td>
                    <td className="p-3">{p.nip}</td>
                    <td className="p-3">{p.jabatan}</td>
                    <td className="p-3 text-center">
                      {urls && Object.keys(urls).length > 0 ? (
                        <a
                          href={Object.values(urls)[0]}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-xs transition"
                        >
                          <Eye size={14} /> Lihat Berkas
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs italic">
                          Tidak ada berkas
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-6 italic">
                  Tidak ada data pegawai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}