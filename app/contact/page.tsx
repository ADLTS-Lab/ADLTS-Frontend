export default function ContactPage() {
  return (
    <div className="min-h-[60vh] bg-[#F5F7FA] rounded-2xl border border-[#E5E7EB] p-6 sm:p-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] mb-4">
        አግኙን / Contact
      </h1>
      <p className="text-[#4B5563] leading-relaxed mb-4">
        For support and general inquiries, contact the ADLTS team.
      </p>
      <ul className="space-y-2 text-[#4B5563]">
        <li>Email: support@adlts.et</li>
        <li>Phone: +251 11 000 0000</li>
        <li>Address: Addis Ababa, Ethiopia</li>
      </ul>
      <p className="text-[#4B5563] leading-relaxed mt-4">
        ለድጋፍ ወይም ጠቅላላ ጥያቄዎች በላይ ባሉት መረጃዎች ያግኙን።
      </p>
    </div>
  );
}
