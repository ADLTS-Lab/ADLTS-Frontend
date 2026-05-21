export default function AboutPage() {
  return (
    <div className="min-h-[60vh] bg-[#F5F7FA] rounded-2xl border border-[#E5E7EB] p-6 sm:p-10 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">About ADLTS</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">ስለ ADLTS / About ADLTS</h1>
      </div>

      <p className="text-[#4B5563] leading-relaxed max-w-3xl">
        ADLTS is a modern driving-license testing platform built to make registration, verification, testing,
        and reporting clearer for applicants, examiners, and transport offices.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <h2 className="font-bold text-[#1F2937] mb-2">Trusted process</h2>
          <p className="text-sm text-[#4B5563] leading-relaxed">We aim for a predictable, auditable workflow that reduces manual follow-up and confusion.</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <h2 className="font-bold text-[#1F2937] mb-2">Role-based access</h2>
          <p className="text-sm text-[#4B5563] leading-relaxed">Each user sees the tools they need, whether they are a candidate, admin, or reviewer.</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <h2 className="font-bold text-[#1F2937] mb-2">Built for scale</h2>
          <p className="text-sm text-[#4B5563] leading-relaxed">The product is designed to support future invitation, approval, and reporting workflows.</p>
        </div>
      </div>

      <p className="text-[#4B5563] leading-relaxed max-w-3xl">
        ADLTS የመንጃ ፈቃድ ፈተናዎችን በዲጂታል ለማዘመን የተዘጋጀ ስርዓት ሲሆን፣ ግልጽነትን እና ቅልጥፍናን ያረጋግጣል።
      </p>
    </div>
  );
}
