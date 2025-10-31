import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import Sidebar from "../components/Sidebar";
import {
  FolderOpen,
  Eye,
  Trash2,
  Download,
  Upload,
  X,
  Loader2,
  Search,
} from "lucide-react";

export default function DaftarBerkasPage() {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const dokumenList = [
    "SK CPNS",
    "SK PNS",
    "KTP",
    "KARTU KELUARGA",
    "NPWP",
    "KARTU PEGAWAI",
    "SERTIFIKAT",
    "SK BERKALA",
    "SK FUNGSIONAL",
    "BPJS",
    "AKTE",
  ];

  // 🧭 Ambil data pegawai dari Supabase
  const fetchPegawai = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pegawai")
      .select("nama, nip, email, jabatan, berkas_url");

    if (error) {
      console.error("❌ Gagal memuat data:", error.message);
      setLoading(false);
      return;
    }

    const normalized = data.map((p) => {
      let parsed = {};
      try {
        parsed =
          typeof p.berkas_url === "string"
            ? JSON.parse(p.berkas_url)
            : p.berkas_url || {};
      } catch {
        parsed = {};
      }
      return { ...p, berkas_url: parsed };
    });

    setPegawaiList(normalized);
    setFilteredList(normalized);
    setLoading(false);
  };

  useEffect(() => {
    fetchPegawai();
  }, []);

  // 🔍 Filter pencarian berdasarkan nama
  useEffect(() => {
    const filtered = pegawaiList.filter((p) =>
      p.nama?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredList(filtered);
  }, [searchTerm, pegawaiList]);

  // 🧾 Buka modal dokumen pegawai
  const handleLihatDokumen = async (pegawai) => {
    try {
      const { data, error } = await supabase
        .from("pegawai")
        .select("berkas_url")
        .eq("email", pegawai.email)
        .maybeSingle();

      if (error) throw error;
      if (!data) return alert("Data tidak ditemukan.");

      let parsed = {};
      try {
        parsed =
          typeof data.berkas_url === "string"
            ? JSON.parse(data.berkas_url)
            : data.berkas_url || {};
      } catch {
        parsed = {};
      }

      setSelectedPegawai({ ...pegawai, berkas_url: parsed });
      setShowModal(true);
    } catch (err) {
      console.error("❌ Gagal memuat dokumen:", err.message);
      alert("Terjadi kesalahan saat membuka dokumen.");
    }
  };

  // 📤 Upload dokumen baru
  const handleUpload = async (pegawai, field, file) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${pegawai.email}/${field.replace(/\s+/g, "_")}.${fileExt}`;

      // Upload ke storage Supabase
      const { error: uploadError } = await supabase.storage
        .from("berkas_pegawai")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Ambil public URL
      const { data: publicUrlData } = supabase.storage
        .from("berkas_pegawai")
        .getPublicUrl(filePath);

      const newUrl = publicUrlData.publicUrl;

      // Update ke tabel pegawai
      const updatedUrls = {
        ...pegawai.berkas_url,
        [field]: { url: newUrl, uploaded_at: new Date().toISOString() },
      };

      const { error: updateError } = await supabase
        .from("pegawai")
        .update({ berkas_url: updatedUrls })
        .eq("email", pegawai.email);

      if (updateError) throw updateError;

      alert(`✅ Dokumen ${field} berhasil diupload!`);
      fetchPegawai();
      setSelectedPegawai({
        ...pegawai,
        berkas_url: updatedUrls,
      });
    } catch (error) {
      console.error("❌ Gagal upload:", error.message);
      alert("Gagal mengupload dokumen. Coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  // 🗑️ Hapus dokumen pegawai
  const handleDelete = async (pegawai, field) => {
    const fileEntry = pegawai.berkas_url?.[field];
    const fileUrl = typeof fileEntry === "object" ? fileEntry.url : fileEntry;

    if (!fileUrl) return alert("Tidak ada file untuk dihapus.");

    const confirmDelete = window.confirm(`Hapus dokumen ${field}?`);
    if (!confirmDelete) return;

    try {
      const path = decodeURIComponent(
        fileUrl.split("/object/public/berkas_pegawai/")[1]
      );
      if (!path) throw new Error("Gagal menemukan path file.");

      await supabase.storage.from("berkas_pegawai").remove([path]);

      const updatedUrls = { ...pegawai.berkas_url };
      delete updatedUrls[field];

      const { error: updateError } = await supabase
        .from("pegawai")
        .update({ berkas_url: updatedUrls })
        .eq("email", pegawai.email);

      if (updateError) throw updateError;

      alert(`🗑️ Dokumen ${field} berhasil dihapus.`);
      fetchPegawai();
      setShowModal(false);
    } catch (error) {
      console.error("❌ Gagal menghapus dokumen:", error.message);
      alert("Gagal menghapus dokumen.");
    }
  };

  // 📥 Download file dokumen pegawai
  const handleDownload = (pegawai, field) => {
    const fileEntry = pegawai.berkas_url?.[field];
    const fileUrl = typeof fileEntry === "object" ? fileEntry.url : fileEntry;

    if (!fileUrl) return alert(`❌ Dokumen ${field} tidak ditemukan.`);

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `${field}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <FolderOpen className="text-blue-600" /> Daftar Berkas Pegawai
          </h1>
        </div>

        {/* 🔍 Kolom Pencarian */}
        <div className="relative mb-6 w-full max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama pegawai..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* 🧾 Tabel Pegawai */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-6 animate-pulse">
              Memuat data...
            </p>
          ) : filteredList.length === 0 ? (
            <p className="text-center text-gray-500 italic py-6">
              Tidak ada pegawai ditemukan.
            </p>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-blue-600 text-white text-sm">
                  <th className="py-3 px-4 text-left rounded-tl-lg">
                    Nama Pegawai
                  </th>
                  <th className="py-3 px-4 text-left">NIP</th>
                  <th className="py-3 px-4 text-left">Jabatan</th>
                  <th className="py-3 px-4 text-center rounded-tr-lg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((pegawai) => (
                  <tr
                    key={pegawai.email || pegawai.nip || pegawai.nama}
                    className="border-b hover:bg-blue-50 transition text-sm"
                  >
                    <td className="py-3 px-4 font-medium">{pegawai.nama}</td>
                    <td className="py-3 px-4">{pegawai.nip || "-"}</td>
                    <td className="py-3 px-4">{pegawai.jabatan || "-"}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleLihatDokumen(pegawai)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition"
                      >
                        📂 Lihat Dokumen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 🪟 Modal Dokumen */}
        {showModal && selectedPegawai && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-2xl relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>

              <h2 className="text-lg font-semibold text-blue-700 mb-4">
                📁 Dokumen {selectedPegawai.nama}
              </h2>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                {dokumenList.map((field, i) => {
                  const fileEntry = selectedPegawai.berkas_url?.[field];
                  const fileUrl =
                    typeof fileEntry === "object" ? fileEntry.url : fileEntry;

                  return (
                    <div
                      key={`${field}-${i}`}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <p className="text-sm font-medium text-gray-700">
                        {field}
                      </p>

                      {fileUrl ? (
                        <div className="flex gap-2">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md text-xs transition"
                          >
                            <Eye size={14} /> Lihat
                          </a>
                          <button
                            onClick={() =>
                              handleDownload(selectedPegawai, field)
                            }
                            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs transition"
                          >
                            <Download size={14} /> Unduh
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(selectedPegawai, field)
                            }
                            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs transition"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            id={`upload-${field}-${i}`}
                            className="hidden"
                            onChange={(e) =>
                              handleUpload(
                                selectedPegawai,
                                field,
                                e.target.files[0]
                              )
                            }
                          />
                          <label
                            htmlFor={`upload-${field}-${i}`}
                            className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-md text-xs transition cursor-pointer"
                          >
                            <Upload size={14} /> Upload
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {uploading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center rounded-xl">
                  <Loader2
                    className="animate-spin text-blue-600 mb-2"
                    size={32}
                  />
                  <p className="text-sm text-blue-600">
                    Mengupload dokumen...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}