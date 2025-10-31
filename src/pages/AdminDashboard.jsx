import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { Users, UserCheck, FileText, BarChart3, Activity, Info } from "lucide-react";

export default function AdminDashboard() {
  const [totalPegawai, setTotalPegawai] = useState(0);
  const [pegawaiAktif, setPegawaiAktif] = useState(0);
  const [pegawaiPensiun, setPegawaiPensiun] = useState(0);
  const [totalBerkas, setTotalBerkas] = useState(0);

  const fetchData = async () => {
    const { data: pegawai } = await supabase.from("pegawai").select("*, berkas_url");
    if (!pegawai) return;

    setTotalPegawai(pegawai.length);
    setPegawaiAktif(pegawai.filter((p) => p.role === "pegawai").length);
    setPegawaiPensiun(pegawai.filter((p) => p.role === "pensiun").length);

    let total = 0;
    pegawai.forEach((p) => {
      try {
        const files =
          typeof p.berkas_url === "string"
            ? JSON.parse(p.berkas_url)
            : p.berkas_url;
        total += Object.keys(files || {}).length;
      } catch {
        total += 0;
      }
    });
    setTotalBerkas(total);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 text-sm">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Dashboard Admin SI PRIMA</h1>
        <p className="text-gray-600 mb-8">Selamat datang di sistem kepegawaian Puskesmas Pekanbaru Kota</p>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { title: "Total Pegawai", value: totalPegawai, color: "from-blue-500 to-blue-600", icon: <Users /> },
            { title: "Pegawai Aktif", value: pegawaiAktif, color: "from-green-500 to-green-600", icon: <UserCheck /> },
            { title: "Pegawai Pensiun", value: pegawaiPensiun, color: "from-red-500 to-red-600", icon: <FileText /> },
            { title: "Total Berkas", value: totalBerkas, color: "from-yellow-400 to-yellow-500", icon: <BarChart3 /> },
          ].map((item, i) => (
            <div
              key={i}
              className={`bg-gradient-to-r ${item.color} text-white p-6 rounded-2xl shadow-lg flex items-center justify-between hover:scale-105 transition`}
            >
              <div>
                <p className="text-sm opacity-80">{item.title}</p>
                <h3 className="text-3xl font-bold">{item.value}</h3>
              </div>
              <div className="opacity-80">{item.icon}</div>
            </div>
          ))}
        </div>

        {/* Aktivitas Terakhir */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2 mb-3">
            <Activity className="text-blue-500" size={20} /> Aktivitas Terakhir
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✅ Dea Ika Saskia mengunggah dokumen SK CPNS</li>
            <li>🕓 Admin Utama menambahkan data pegawai baru</li>
            <li>📄 Pegawai memperbarui data pendidikan</li>
          </ul>
        </div>

        {/* Informasi Sistem */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2 mb-3">
            <Info className="text-blue-500" size={20} /> Informasi Sistem
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            🏥 <strong>SI PRIMA</strong> membantu manajemen pegawai agar efisien dan transparan.
            <br />
            ⚙️ Versi: <strong>1.0.0</strong> | 👩‍💻 Pengembang: <strong>Dea Ika Saskia</strong>
            <br />
            📅 Terakhir diperbarui: <strong>{new Date().toLocaleDateString()}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}