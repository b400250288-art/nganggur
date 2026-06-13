import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-6xl font-extrabold text-teal-600">404</h1>
      <h2 className="text-2xl font-bold">Halaman Tidak Ditemukan</h2>
      <p className="text-muted-foreground max-w-md">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-teal-600 px-6 py-2 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
