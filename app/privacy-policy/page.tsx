export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[60vh] bg-[#F5F7FA] rounded-2xl border border-[#E5E7EB] p-6 sm:p-10 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3">Privacy & security</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">የግላዊነት ፖሊሲ / Privacy Policy</h1>
      </div>

      <p className="text-[#4B5563] leading-relaxed max-w-3xl">
        This page explains, in plain language, how ADLTS handles account details, login data, and contact information. It is a placeholder policy for the current frontend workflow.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <h2 className="font-bold text-[#1F2937] mb-2">What we store</h2>
          <p className="text-sm text-[#4B5563] leading-relaxed">Basic profile information, role, and session token data needed to keep users signed in.</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <h2 className="font-bold text-[#1F2937] mb-2">How it is used</h2>
          <p className="text-sm text-[#4B5563] leading-relaxed">To authenticate users, route them to the right dashboard, and support account recovery flows.</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <h2 className="font-bold text-[#1F2937] mb-2">Your choice</h2>
          <p className="text-sm text-[#4B5563] leading-relaxed">You can log out at any time, and any future policy changes should be reflected here before release.</p>
        </div>
      </div>

      <p className="text-[#4B5563] leading-relaxed max-w-3xl">
        ይህ ለ ADLTS የግላዊነት ፖሊሲ ጊዜያዊ ገጽ ነው። የተጠቃሚ መረጃ እንዴት እንደሚሰበሰብ፣ እንዴት እንደሚጠቀም እና
        እንዴት እንደሚጠበቅ ያብራራል።
      </p>
    </div>
  );
}
