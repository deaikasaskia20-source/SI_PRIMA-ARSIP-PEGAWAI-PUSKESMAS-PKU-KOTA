import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import Sidebar from "../components/Sidebar";
import { UploadCloud, FileUp, Loader2, CheckCircle2 } from "lucide-react";

export default function UploadBerkasPage() {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [files, setFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [loadingField, setLoadingField] = useState(null);

  useEffect(() => {
    const fetchPegawai = async () => {
      const { data, error } = await supabase
        .from("pegawai")
        .select("nama, nip, jabatan, berkas_url");
      if (!error) setPegawaiList(data || []);
    };
    fetchPegawai();
  }, []);

  // Tutup dropdown saat klik di luar area pencarian
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".pegawai-search")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fields = [
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

  const handleFileChange = (e, field) => {
    setFiles({ ...files, [field]: e.target.files[0] });
  };

  const handleSingleUpload = async (field) => {
    if (!selectedPegawai) return alert("⚠️ Pilih pegawai dulu!");
    const file = files[field];
    if (!file) return alert("⚠️ Pilih file terlebih dahulu!");

    setLoadingField(field);
    try {
      const filePath = `${selectedPegawai.nip}/${field}_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("berkas_pegawai")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("berkas_pegawai")
        .getPublicUrl(filePath);

      const oldUrls = selectedPegawai.berkas_url || {};
      const { error: updateError } = await supabase
        .from("pegawai")
        .update({ berkas_url: { ...oldUrls, [field]: publicUrlData.publicUrl } })
        .eq("nip", selectedPegawai.nip);
      if (updateError) throw updateError;

      setUploadStatus((prev) => ({ ...prev, [field]: "success" }));
    } catch (error) {
      console.error(error);
      setUploadStatus((prev) => ({ ...prev, [field]: "failed" }));
    } finally {
      setLoadingField(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white w-full max-w-4xl mx-auto rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6 border-b pb-3">
            <UploadCloud size={28} className="text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-700">
              Upload Berkas Pegawai
            </h1>
          </div>

          {/* 🔍 Pencarian Pegawai */}
          <div className="relative mb-6 pegawai-search">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cari Nama Pegawai
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={search}
                placeholder="Ketik nama pegawai..."
                className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onFocus={() => setShowDropdown(true)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
              />
            </div>

            {/* 🩵 Dropdown animasi dengan Framer Motion */}
            <AnimatePresence>
              {showDropdown && search.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 bg-white border border-gray-200 rounded-lg mt-1 w-full shadow-lg max-h-48 overflow-y-auto"
                >
                  {pegawaiList
                    .filter((p) =>
                      p.nama.toLowerCase().includes(search.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((p) => (
                      <div
                        key={p.nip}
                        onClick={() => {
                          setSelectedPegawai(p);
                          setSearch(p.nama);
                          setShowDropdown(false);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-100 text-sm text-gray-700 transition"
                      >
                        {p.nama}
                      </div>
                    ))}

                  {pegawaiList.filter((p) =>
                    p.nama.toLowerCase().includes(search.toLowerCase())
                  ).length === 0 && (
                    <p className="px-4 py-2 text-sm text-gray-400 italic">
                      Tidak ada pegawai ditemukan
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 🧾 Biodata Pegawai */}
          {selectedPegawai && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm"
            >
              <p>
                <strong>Nama:</strong> {selectedPegawai.nama}
              </p>
              <p>
                <strong>NIP:</strong> {selectedPegawai.nip}
              </p>
              <p>
                <strong>Jabatan:</strong> {selectedPegawai.jabatan}
              </p>
            </motion.div>
          )}

          {/* 📁 Upload Berkas */}
          <div className="space-y-4">
            {fields.map((field) => (
              <div
                key={field}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border hover:border-blue-400 hover:shadow-sm transition"
              >
                <div className="flex-1 mr-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {field} (PDF)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="text-sm text-gray-600 w-full"
                    onChange={(e) => handleFileChange(e, field)}
                  />
                </div>

                <button
                  onClick={() => handleSingleUpload(field)}
                  disabled={loadingField === field}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    loadingField === field
                      ? "bg-blue-400 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {loadingField === field ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <FileUp size={16} /> Upload
                    </>
                  )}
                </button>

                {uploadStatus[field] === "success" && (
                  <CheckCircle2
                    size={20}
                    className="text-green-500 ml-2 animate-pulse"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}