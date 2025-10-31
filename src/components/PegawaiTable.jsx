function PegawaiTable() {
  const dataPegawai = [
    { id: 1, nama: "Siti Aminah", nip: "19830412 200501 2 001", jabatan: "Perawat", unit: "Puskesmas Kota" },
    { id: 2, nama: "Ahmad Zulfikar", nip: "19810623 200703 1 002", jabatan: "Dokter Umum", unit: "Puskesmas Sukajadi" },
    { id: 3, nama: "Rina Marlina", nip: "19891204 201001 2 003", jabatan: "Administrasi", unit: "Puskesmas Lima Puluh" },
    { id: 4, nama: "Budi Hartono", nip: "19800322 200401 1 004", jabatan: "Apoteker", unit: "Puskesmas Payung Sekaki" },
  ];

  return (
    <table className="min-w-full bg-white border border-gray-300 rounded shadow">
      <thead className="bg-blue-600 text-white">
        <tr>
          <th className="py-2 px-4 border">No</th>
          <th className="py-2 px-4 border">Nama</th>
          <th className="py-2 px-4 border">NIP</th>
          <th className="py-2 px-4 border">Jabatan</th>
          <th className="py-2 px-4 border">Unit Kerja</th>
        </tr>
      </thead>
      <tbody>
        {dataPegawai.map((p, index) => (
          <tr key={p.id} className="hover:bg-gray-100">
            <td className="py-2 px-4 border text-center">{index + 1}</td>
            <td className="py-2 px-4 border">{p.nama}</td>
            <td className="py-2 px-4 border">{p.nip}</td>
            <td className="py-2 px-4 border">{p.jabatan}</td>
            <td className="py-2 px-4 border">{p.unit}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default PegawaiTable;