
export default function DataPegawaiPage() {
  const [pegawai, setPegawai] = useState([]);
  const [filteredPegawai, setFilteredPegawai] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedPegawai, setSelectedPegawai] = useState(null);

  // 🔍 Filter/Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterJabatan, setFilterJabatan] = useState("");
  const [filterGender, setFilterGender] = useState("");

  // 🧭 Ambil Data Pegawai
  const fetchPegawai = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pegawai")
        .select("*")
        .order("nama", { ascending: true });

      if (error) throw error;

      setPegawai(data);
      setFilteredPegawai(data);
    } catch (err) {
      console.error("❌ Gagal memuat data:", err.message);
      alert("Gagal memuat data pegawai!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPegawai();
  }, []);

  // 🧮 Filter data ketika search/filter berubah
  useEffect(() => {
    let hasil = [...pegawai];

    if (searchTerm.trim()) {
      hasil = hasil.filter((p) =>
        p.nama?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole) hasil = hasil.filter((p) => p.role === filterRole);
    if (filterJabatan)
      hasil = hasil.filter((p) =>
        p.jabatan?.toLowerCase().includes(filterJabatan.toLowerCase())
      );
    if (filterGender)
      hasil = hasil.filter((p) => p.jenis_kelamin === filterGender);

    setFilteredPegawai(hasil);
  }, [searchTerm, filterRole, filterJabatan, filterGender, pegawai]);

  // ➕ Tambah Pegawai
  const handleAdd = () => {
    setSelectedPegawai({
      nama: "",
      email: "",
      password: "",
      role: "pegawai",
      jabatan: "",
      nip: "",
      jenis_kelamin: "",
      pangkat: "",
      pendidikan_terakhir: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      TMT_CPNS: "",
      TMT_PNS: "",
    });
    setModalType("add");
  };

  // ✏️ Edit Pegawai
  const handleEdit = (p) => {
    setSelectedPegawai({ ...p });
    setModalType("edit");
  };

  // 🗑️ Hapus Pegawai
  const handleDelete = async (no) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    const { error } = await supabase.from("pegawai").delete().eq("No", no);

    if (error) {
      console.error(error);
      alert("❌ Gagal menghapus data!");
    } else {
      alert("✅ Data pegawai berhasil dihapus!");
      fetchPegawai();
    }
  };

  // 💾 Simpan Pegawai (Tambah / Edit)
  const handleSave = async () => {
    if (!selectedPegawai.nama || !selectedPegawai.email) {
      alert("⚠️ Nama dan Email wajib diisi!");
      return;
    }

    let result;
    if (modalType === "add") {
      result = await supabase.from("pegawai").insert([selectedPegawai]);
    } else if (modalType === "edit") {
      result = await supabase
        .from("pegawai")
        .update(selectedPegawai)
        .eq("No", selectedPegawai.No);
    }

    if (result.error) {
      console.error(result.error);
      alert("❌ Terjadi kesalahan saat menyimpan data!");
    } else {
      alert("✅ Data berhasil disimpan!");
      setModalType(null);
      fetchPegawai();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">
            Daftar Pegawai SI PRIMA
          </h1>
          <button
            onClick={handleAdd}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow"
          >
            ➕ Tambah Pegawai
          </button>
        </div>

        {/* 🔍 Search & Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-lg shadow">
          <input
            type="text"
            placeholder="Cari nama pegawai..."
            className="border p-2 rounded w-full sm:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border p-2 rounded w-full sm:w-1/5"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="pegawai">Pegawai</option>
          </select>
        </div>

        {/* Tabel Data */}
        {loading ? (
          <p className="text-center text-gray-500">Memuat data...</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
            <table className="w-full border-collapse text-sm text-left">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3">Nama</th>
                  <th className="p-3">NIP</th>
                  <th className="p-3">Jabatan</th>
                  <th className="p-3">Jenis Kelamin</th>
                  <th className="p-3">Pangkat</th>
                  <th className="p-3">Pendidikan</th>
                  <th className="p-3">TTL</th>
                  <th className="p-3">TMT CPNS</th>
                  <th className="p-3">TMT PNS</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPegawai.length > 0 ? (
                  filteredPegawai.map((p) => (
                    <tr key={p.No} className="border-b hover:bg-gray-100">
                      <td className="p-3">{p.nama}</td>
                      <td className="p-3">{p.nip}</td>
                      <td className="p-3">{p.jabatan}</td>
                      <td className="p-3">{p.jenis_kelamin}</td>
                      <td className="p-3">{p.pangkat}</td>
                      <td className="p-3">{p.pendidikan_terakhir}</td>
                      <td className="p-3">
                        {p.tempat_lahir}, {p.tanggal_lahir}
                      </td>
                      <td className="p-3">{p.TMT_CPNS}</td>
                      <td className="p-3">{p.TMT_PNS}</td>
                      <td className="p-3">{p.email}</td>
                      <td className="p-3 capitalize">{p.role}</td>
                      <td className="p-3 flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(p)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(p.No)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="12"
                      className="text-center text-gray-500 p-4 italic"
                    >
                      Tidak ada data yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit */}
      {modalType && (
        <ModalPegawai
          modalType={modalType}
          selectedPegawai={selectedPegawai}
          setSelectedPegawai={setSelectedPegawai}
          handleSave={handleSave}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}

// 💬 Komponen Modal
function ModalPegawai({
  modalType,
  selectedPegawai,
  setSelectedPegawai,
  handleSave,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl w-[800px] shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {modalType === "add" ? "➕ Tambah Pegawai" : "✏️ Edit Pegawai"}
        </h2>

        <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          <InputField label="Nama" name="nama" value={selectedPegawai.nama} onChange={setSelectedPegawai} />
          <InputField label="NIP" name="nip" value={selectedPegawai.nip} onChange={setSelectedPegawai} />
          <InputField label="Jabatan" name="jabatan" value={selectedPegawai.jabatan} onChange={setSelectedPegawai} />
          <SelectField label="Jenis Kelamin" name="jenis_kelamin" value={selectedPegawai.jenis_kelamin} options={["Laki-laki", "Perempuan"]} onChange={setSelectedPegawai} />
          <InputField label="Pangkat" name="pangkat" value={selectedPegawai.pangkat} onChange={setSelectedPegawai} />
          <InputField label="Pendidikan Terakhir" name="pendidikan_terakhir" value={selectedPegawai.pendidikan_terakhir} onChange={setSelectedPegawai} />
          <InputField label="Tempat Lahir" name="tempat_lahir" value={selectedPegawai.tempat_lahir} onChange={setSelectedPegawai} />
          <InputField label="Tanggal Lahir" name="tanggal_lahir" type="date" value={selectedPegawai.tanggal_lahir} onChange={setSelectedPegawai} />
          <InputField label="TMT CPNS" name="TMT_CPNS" type="date" value={selectedPegawai.TMT_CPNS} onChange={setSelectedPegawai} />
          <InputField label="TMT PNS" name="TMT_PNS" type="date" value={selectedPegawai.TMT_PNS} onChange={setSelectedPegawai} />
          <InputField label="Email" name="email" value={selectedPegawai.email} onChange={setSelectedPegawai} />
          <SelectField label="Role" name="role" value={selectedPegawai.role} options={["pegawai", "admin"]} onChange={setSelectedPegawai} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
            Batal
          </button>
          <button onClick={handleSave} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}