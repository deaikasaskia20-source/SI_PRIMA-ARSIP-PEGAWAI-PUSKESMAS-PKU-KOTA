import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import Sidebar from "../components/Sidebar";
import { Users, Search, FileSpreadsheet, Pencil, Trash2, Plus } from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminPegawaiPage() {
  const [pegawaiList, setPegawaiList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  const [form, setForm] = useState({});
  const [newForm, setNewForm] = useState({});

  // 🚀 Ambil data pegawai dari Supabase
  const fetchPegawai = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("pegawai").select("*").order("nama");
      if (error) throw error;
      setPegawaiList(data || []);
      setFilteredList(data || []);
    } catch (err) {
      console.error("❌ Gagal mengambil data pegawai:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPegawai();
  }, []);

  // 🔍 Filter pencarian
  useEffect(() => {
    const filtered = pegawaiList.filter((p) => {
      const name = (p.nama || "").toLowerCase();
      const nip = (p.nip || "").toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || nip.includes(searchTerm.toLowerCase());
    });
    setFilteredList(filtered);
  }, [searchTerm, pegawaiList]);

  // ✏️ Edit data pegawai
  const handleEditClick = (pegawai) => {
    setSelectedPegawai(pegawai);
    setForm({ ...pegawai });
    setShowEditModal(true);
  };

  // 🧠 Ubah input form (edit)
  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🧠 Ubah input form (tambah)
  const handleChangeNewForm = (e) => {
    const { name, value } = e.target;
    setNewForm((prev) => ({ ...prev, [name]: value }));
  };

  // 💾 Update data pegawai ke Supabase
  const handleUpdatePegawai = async (e) => {
    e.preventDefault();

    if (!selectedPegawai) {
      alert("⚠️ Pilihan pegawai tidak ditemukan!");
      return;
    }

    // 🔍 Deteksi otomatis nama kolom primary key
    const pkName = selectedPegawai.hasOwnProperty("no")
      ? "no"
      : selectedPegawai.hasOwnProperty("No")
      ? "No"
      : null;

    const pkValue = pkName ? selectedPegawai[pkName] : null;

    if (!pkName || !pkValue) {
      alert("❌ Kolom primary key tidak ditemukan!");
      console.warn("Data pegawai:", selectedPegawai);
      return;
    }

    const formatDate = (date) => (date ? new Date(date).toISOString().split("T")[0] : null);

    const updatePayload = {
      nama: form.nama || null,
      email: form.email || null,
      nip: form.nip || null,
      jabatan: form.jabatan || null,
      role: form.role || "pegawai",
      jenis_kelamin: form.jenis_kelamin || null,
      pangkat: form.pangkat || null,
      pendidikan_terakhir: form.pendidikan_terakhir || null,
      tempat_lahir: form.tempat_lahir || null,
      tanggal_lahir: formatDate(form.tanggal_lahir),
      tmt_cpns: formatDate(form.tmt_cpns),
      tmt_pns: formatDate(form.tmt_pns),
    };

    const { error } = await supabase.from("pegawai").update(updatePayload).eq(pkName, pkValue);

    if (error) {
      alert("❌ Gagal memperbarui data: " + error.message);
      return;
    }

    alert("✅ Data pegawai berhasil diperbarui!");
    setShowEditModal(false);
    setSelectedPegawai(null);
    fetchPegawai();
  };

  // ➕ Tambah pegawai baru
  const handleAddPegawai = async (e) => {
    e.preventDefault();

    const formatDate = (date) => (date ? new Date(date).toISOString().split("T")[0] : null);

    const newPayload = {
      nama: newForm.nama || null,
      email: newForm.email || null,
      nip: newForm.nip || null,
      jabatan: newForm.jabatan || null,
      role: newForm.role || "pegawai",
      jenis_kelamin: newForm.jenis_kelamin || null,
      pangkat: newForm.pangkat || null,
      pendidikan_terakhir: newForm.pendidikan_terakhir || null,
      tempat_lahir: newForm.tempat_lahir || null,
      tanggal_lahir: formatDate(newForm.tanggal_lahir),
      tmt_cpns: formatDate(newForm.tmt_cpns),
      tmt_pns: formatDate(newForm.tmt_pns),
    };

    const { error } = await supabase.from("pegawai").insert([newPayload]);

    if (error) {
      alert("❌ Gagal menambahkan pegawai: " + error.message);
      return;
    }

    alert("✅ Pegawai baru berhasil ditambahkan!");
    setShowAddModal(false);
    setNewForm({});
    fetchPegawai();
  };

  // 🗑️ Hapus data pegawai
  const handleDeletePegawai = async (pegawai) => {
    if (!confirm(`Hapus data pegawai ${pegawai.nama}?`)) return;

    const pkName = pegawai.hasOwnProperty("no")
      ? "no"
      : pegawai.hasOwnProperty("No")
      ? "No"
      : null;

    const pkValue = pkName ? pegawai[pkName] : null;

    const { error } = await supabase.from("pegawai").delete().eq(pkName, pkValue);
    if (error) {
      alert("❌ Gagal menghapus data: " + error.message);
      return;
    }

    alert("🗑️ Data berhasil dihapus!");
    fetchPegawai();
  };

  // 📊 Download Excel
  const handleDownloadExcel = () => {
    if (filteredList.length === 0) return alert("Tidak ada data untuk diunduh.");
    const ws = XLSX.utils.json_to_sheet(filteredList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pegawai");
    XLSX.writeFile(wb, "Data_Pegawai_SI_PRIMA.xlsx");
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <div className="md:w-64 w-full">
        <Sidebar />
      </div>

      <div className="flex-1 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-blue-700 flex items-center gap-2">
            <Users className="text-blue-600" /> Data Pegawai
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm shadow-md transition"
            >
              <FileSpreadsheet size={16} /> Excel
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm shadow-md transition"
            >
              <Plus size={16} /> Tambah
            </button>
          </div>
        </div>

        {/* Pencarian */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama atau NIP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-3 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Tabel Data */}
        <div className="bg-white shadow-md rounded-xl p-4 overflow-x-auto text-sm">
          {loading ? (
            <p className="text-center text-gray-500 py-4 animate-pulse">Memuat data...</p>
          ) : filteredList.length === 0 ? (
            <p className="text-center text-gray-500 italic py-4">Tidak ada data pegawai.</p>
          ) : (
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-blue-600 text-white text-xs sm:text-sm">
                  <th className="py-2 px-3 text-left rounded-tl-lg">Nama</th>
                  <th className="py-2 px-3 text-left">Email</th>
                  <th className="py-2 px-3 text-left">NIP</th>
                  <th className="py-2 px-3 text-left">Jabatan</th>
                  <th className="py-2 px-3 text-left">Role</th>
                  <th className="py-2 px-3 text-center rounded-tr-lg">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((pegawai, idx) => (
                  <tr key={pegawai.no || pegawai.No || idx} className="border-b hover:bg-blue-50 transition text-xs sm:text-sm">
                    <td className="py-2 px-3 font-medium">{pegawai.nama}</td>
                    <td className="py-2 px-3">{pegawai.email}</td>
                    <td className="py-2 px-3">{pegawai.nip}</td>
                    <td className="py-2 px-3">{pegawai.jabatan || "-"}</td>
                    <td className="py-2 px-3 capitalize">{pegawai.role}</td>
                    <td className="py-2 px-3 flex justify-center gap-1 flex-wrap">
                      <button
                        onClick={() => handleEditClick(pegawai)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeletePegawai(pegawai)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ✏️ Modal Edit */}
        {showEditModal && selectedPegawai && (
          <ModalForm
            title="✏️ Edit Data Pegawai"
            form={form}
            onChange={handleChangeForm}
            onSubmit={handleUpdatePegawai}
            onClose={() => setShowEditModal(false)}
          />
        )}

        {/* ➕ Modal Tambah */}
        {showAddModal && (
          <ModalForm
            title="➕ Tambah Pegawai Baru"
            form={newForm}
            onChange={handleChangeNewForm}
            onSubmit={handleAddPegawai}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// 🧩 Reusable Modal Component (Tambah/Edit)
function ModalForm({ title, form, onChange, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-2">
      <div className="bg-white rounded-xl w-full max-w-lg p-5 shadow-2xl overflow-y-auto max-h-[90vh] relative">
        <button onClick={onClose} className="absolute right-5 top-4 text-gray-400 hover:text-red-500">
          ✕
        </button>

        <h2 className="text-lg font-semibold text-blue-600 mb-4 text-center">{title}</h2>

        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            ["Nama Lengkap", "nama", "text"],
            ["Email", "email", "email"],
            ["NIP", "nip", "text"],
            ["Jabatan", "jabatan", "text"],
            ["Pangkat", "pangkat", "text"],
            ["Pendidikan Terakhir", "pendidikan_terakhir", "text"],
            ["Tempat Lahir", "tempat_lahir", "text"],
            ["Tanggal Lahir", "tanggal_lahir", "date"],
            ["TMT CPNS", "tmt_cpns", "date"],
            ["TMT PNS", "tmt_pns", "date"],
          ].map(([label, key, type]) => (
            <div key={key}>
              <label className="text-gray-700">{label}</label>
              <input
                type={type}
                name={key}
                value={form[key] ?? ""}
                onChange={onChange}
                className="w-full border rounded-md p-2 mt-1"
              />
            </div>
          ))}

          <div>
            <label className="text-gray-700">Jenis Kelamin</label>
            <select
              name="jenis_kelamin"
              value={form.jenis_kelamin ?? ""}
              onChange={onChange}
              className="w-full border rounded-md p-2 mt-1"
            >
              <option value="">Pilih</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="text-gray-700">Role</label>
            <select
              name="role"
              value={form.role ?? "pegawai"}
              onChange={onChange}
              className="w-full border rounded-md p-2 mt-1"
            >
              <option value="pegawai">Pegawai</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="col-span-2 mt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}