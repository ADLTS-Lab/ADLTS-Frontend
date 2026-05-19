export default function ContactPage() {
  return (
    <div className="min-h-[60vh] bg-[#F5F7FA] rounded-2xl border border-[#E5E7EB] p-6 sm:p-10 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Get in touch</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">አግኙን / Contact</h1>
      </div>

      <p className="text-[#4B5563] leading-relaxed max-w-3xl">
        Need help with registration, password reset, invitation links, or account access? Contact the ADLTS support team and we&apos;ll point you to the right place.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email</p>
          <p className="font-semibold text-[#1F2937]">support@adlts.et</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</p>
          <p className="font-semibold text-[#1F2937]">+251 11 000 0000</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Office</p>
          <p className="font-semibold text-[#1F2937]">Addis Ababa, Ethiopia</p>
        </div>
      </div>

      <p className="text-[#4B5563] leading-relaxed max-w-3xl">
        ለድጋፍ ወይም ጠቅላላ ጥያቄዎች በላይ ባሉት መረጃዎች ያግኙን።
      </p>
    </div>
  );
}
