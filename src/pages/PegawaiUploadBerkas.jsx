import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { FileText, UploadCloud, Eye, Download, RefreshCcw, Trash2 } from "lucide-react";

export default function PegawaiUploadBerkas() {
  const [user, setUser] = useState(null);
  const [berkas, setBerkas] = useState({});
  const [loading, setLoading] = useState(false);

  const jenisBerkas = [
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
    "IJAZAH PENDIDIKAN TERAKHIR", // ✅ tambahan kolom baru
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    fetchBerkas(parsedUser.email);
  }, []);

  const fetchBerkas = async (email) => {
    const { data, error } = await supabase
      .from("pegawai")
      .select("berkas_url")
      .eq("email", email)
      .single();

    if (!error && data?.berkas_url) {
      try {
        const parsed =
          typeof data.berkas_url === "string"
            ? JSON.parse(data.berkas_url)
            : data.berkas_url;
        setBerkas(parsed || {});
      } catch {
        setBerkas({});
      }
    } else {
      setBerkas({});
    }
  };

  const handleUpload = async (jenis, file) => {
    if (!user || !file) return alert("❌ Harap pilih file terlebih dahulu.");
    setLoading(true);

    try {
      const cleanJenis = jenis.replace(/\s+/g, "_");
      const filePath = `${user.email}/${cleanJenis}_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("berkas_pegawai")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("berkas_pegawai")
        .getPublicUrl(filePath);
      const fileUrl = publicData.publicUrl;

      const updated = { ...berkas, [jenis]: { name: file.name, url: fileUrl } };
      const { error: updateError } = await supabase
        .from("pegawai")
        .update({ berkas_url: updated })
        .eq("email", user.email);
      if (updateError) throw updateError;

      setBerkas(updated);
      alert(`✅ ${jenis} berhasil diunggah!`);
    } catch (err) {
      alert("❌ Gagal upload: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl, jenis) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `${jenis}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleHapus = async (jenis) => {
    if (!confirm(`Yakin ingin menghapus ${jenis}?`)) return;

    const updated = { ...berkas };
    delete updated[jenis];
    const { error } = await supabase
      .from("pegawai")
      .update({ berkas_url: updated })
      .eq("email", user.email);

    if (error) alert("❌ Gagal menghapus berkas.");
    else {
      setBerkas(updated);
      alert(`🗑️ ${jenis} berhasil dihapus.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full text-3xl">📁</div>
        <h1 className="text-3xl font-bold text-blue-700">Dokumen Pegawai</h1>
      </div>

      {/* Daftar Dokumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {jenisBerkas.map((jenis, i) => {
          const file = berkas[jenis];
          const isUploaded = !!file?.url;

          return (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all p-6 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`p-3 rounded-full ${
                    isUploaded ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <FileText size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">{jenis}</h3>
              </div>

              {isUploaded ? (
                <>
                  <p className="text-xs text-gray-500 mb-4 truncate">
                    📄 {file.name}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-auto">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs transition"
                    >
                      <Eye size={14} /> Lihat
                    </a>
                    <button
                      onClick={() => handleDownload(file.url, jenis)}
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs transition"
                    >
                      <Download size={14} /> Unduh
                    </button>
                    <label className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs cursor-pointer transition">
                      <RefreshCcw size={14} /> Update
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleUpload(jenis, e.target.files[0])}
                      />
                    </label>
                    <button
                      onClick={() => handleHapus(jenis)}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs transition"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 mt-6">
                  <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer transition">
                    <UploadCloud size={16} /> Upload
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleUpload(jenis, e.target.files[0])}
                    />
                  </label>
                  <p className="text-gray-400 italic text-xs">Belum diunggah</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Loading indicator */}
      {loading && (
        <p className="text-center text-gray-500 py-4 italic">
          ⏳ Mengunggah file...
        </p>
      )}
    </div>
  );
}