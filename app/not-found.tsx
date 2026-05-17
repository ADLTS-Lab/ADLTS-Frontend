import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8 text-center">
        <p className="text-sm font-semibold text-[#6B7280] mb-2">404</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] mb-3">
          Page not found / ገጹ አልተገኘም
        </h1>
        <p className="text-[#4B5563] mb-6">
          The page you are looking for does not exist or has moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-[#1E3A8A] text-white px-5 py-3 font-semibold hover:bg-[#1E40AF] transition"
        >
          Back to home / ወደ መነሻ
        </Link>
      </div>
    </div>
  );
}
