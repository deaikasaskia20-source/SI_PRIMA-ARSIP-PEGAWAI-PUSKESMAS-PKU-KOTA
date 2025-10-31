export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="flex justify-between items-center bg-white shadow-md p-4 rounded-b-2xl">
      <div className="flex items-center gap-2">
        <img src="/vite.svg" alt="logo" className="h-6" />
        <h1 className="text-xl font-bold text-blue-600">SI PRIMA</h1>
      </div>
      <div className="text-gray-700">
        {user ? user.nama : "Pengguna"} | <span className="font-semibold">{user?.role}</span>
      </div>
    </header>
  );
}