import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";
import {
  Users,
  UserCheck,
  FileText,
  BarChart3,
  Activity,
  Info,
} from "lucide-react";

export default function DashboardPage() {
  const [totalPegawai, setTotalPegawai] = useState(0);
  const [pegawaiAktif, setPegawaiAktif] = useState(0);
  const [pegawaiPensiun, setPegawaiPensiun] = useState(0);
  const [totalBerkas, setTotalBerkas] = useState(0);

  // 🔹 Ambil data dari Supabase
  const fetchData = async () => {
    const { data: pegawai, error } = await supabase
      .from("pegawai")
      .select("*, berkas_url");

    if (error) {
      console.error(error);
      return;
    }

    setTotalPegawai(pegawai.length);
    const aktif = pegawai.filter((p) => p.role === "pegawai").length;
    const pensiun = pegawai.filter((p) => p.role === "pensiun").length;
    setPegawaiAktif(aktif);
    setPegawaiPensiun(pensiun);

    // Hitung total berkas
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
        {/* 🔷 Judul */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-1">
            Dashboard SI PRIMA
          </h1>
          <p className="text-gray-600">
            Sistem Informasi Kepegawaian Puskesmas Pekanbaru Kota
          </p>
        </div>

        {/* 🔹 Kartu Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Pegawai */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between hover:scale-105 transition-all">
            <div>
              <p className="text-sm opacity-80">Total Pegawai</p>
              <h3 className="text-3xl font-bold">{totalPegawai}</h3>
            </div>
            <Users size={38} className="opacity-80" />
          </div>

          {/* Pegawai Aktif */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between hover:scale-105 transition-all">
            <div>
              <p className="text-sm opacity-80">Pegawai Aktif</p>
              <h3 className="text-3xl font-bold">{pegawaiAktif}</h3>
            </div>
            <UserCheck size={38} className="opacity-80" />
          </div>

          {/* Pegawai Pensiun */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between hover:scale-105 transition-all">
            <div>
              <p className="text-sm opacity-80">Pegawai Pensiun</p>
              <h3 className="text-3xl font-bold">{pegawaiPensiun}</h3>
            </div>
            <FileText size={38} className="opacity-80" />
          </div>

          {/* Total Berkas */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between hover:scale-105 transition-all">
            <div>
              <p className="text-sm opacity-80">Total Berkas</p>
              <h3 className="text-3xl font-bold">{totalBerkas}</h3>
            </div>
            <BarChart3 size={38} className="opacity-80" />
          </div>
        </div>

        {/* 🔸 Aktivitas Terakhir */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
          <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2 mb-3">
            <Activity className="text-blue-500" size={20} /> Aktivitas Terakhir
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✅ Dea Ika Saskia mengunggah dokumen SK CPNS</li>
            <li>🕓 Admin Utama menambahkan data pegawai baru</li>
            <li>📄 Pegawai melakukan pembaruan data pendidikan</li>
            <li>💾 Sistem melakukan sinkronisasi otomatis data ke server</li>
          </ul>
        </div>

        {/* 🔸 Informasi Sistem */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2 mb-3">
            <Info className="text-blue-500" size={20} /> Informasi Sistem
          </h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              🏥 <strong>SI PRIMA</strong> adalah sistem informasi kepegawaian
              berbasis web yang dikembangkan untuk mendukung efisiensi
              administrasi pegawai di lingkungan Puskesmas Pekanbaru Kota.
            </p>
            <p>
              ⚙️ Versi Sistem: <strong>1.0.0</strong>
            </p>
            <p>
              👩‍💻 Pengembang: <strong>Dea Ika Saskia</strong>
            </p>
            <p>
              📅 Terakhir Diperbarui:{" "}
              <strong>{new Date().toLocaleDateString()}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}