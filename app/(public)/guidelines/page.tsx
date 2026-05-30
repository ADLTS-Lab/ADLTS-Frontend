export default function GuidelinesPage() {
  return (
    <div className="min-h-[60vh] bg-[#F5F7FA] rounded-2xl border border-[#E5E7EB] p-6 sm:p-10 space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Public Guidelines</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">ADLTS Guidelines</h1>
        <p className="text-[#4B5563] leading-relaxed max-w-3xl">
          The Automated Driving License Testing System (ADLTS) helps candidates register, obtain institution approval,
          complete payment, take the examination, and review results through a clear digital workflow.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-sm">
          <h2 className="text-lg font-bold text-[#1F2937] mb-3">Overview</h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
            ADLTS is designed to make the driving test process more transparent and easier to manage. Candidates can
            submit a request, wait for institution review, pay required fees, and track their examination outcome in
            one place.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-sm">
          <h2 className="text-lg font-bold text-[#1F2937] mb-3">Requirements</h2>
          <ul className="space-y-2 text-sm sm:text-base text-[#4B5563] leading-relaxed list-disc pl-5">
            <li>Valid national identification or Fayida ID</li>
            <li>Approved training institution enrollment</li>
            <li>Candidate profile with accurate contact information</li>
            <li>Completed training and readiness for the selected license category</li>
            <li>Any documents required by the reviewing institution or transport authority</li>
          </ul>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-sm">
        <h2 className="text-lg font-bold text-[#1F2937] mb-4">Booking Process</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            'Select a driving institution',
            'Submit a booking request',
            'Wait for institution review',
            'Receive approval notification',
            'Complete payment',
            'Schedule and take the examination',
          ].map((step, index) => (
            <div key={step} className="flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white text-sm font-bold">
                {index + 1}
              </div>
              <div>
                <p className="font-semibold text-[#1F2937]">{step}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-sm">
          <h2 className="text-lg font-bold text-[#1F2937] mb-3">Institution Approval Process</h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
            Institutions review each candidate request to confirm eligibility, training completion, and scheduling
            readiness. Depending on the candidate record and institution policy, the request may be approved or
            rejected before payment and examination scheduling continue.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-sm">
          <h2 className="text-lg font-bold text-[#1F2937] mb-3">Payment Information</h2>
          <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
            Payment is required before the examination can be scheduled. For now, ADLTS uses placeholder payment
            information while backend payment integration is being completed. Candidates should follow the on-screen
            instructions and keep any confirmation details for their records.
          </p>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-sm">
        <h2 className="text-lg font-bold text-[#1F2937] mb-4">Testing Process</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'Practical examination',
              text: 'Candidates complete the required driving assessment under supervised conditions.',
            },
            {
              title: 'Test tracks (Medebs)',
              text: 'Examinations are conducted on approved test tracks and controlled driving environments.',
            },
            {
              title: 'Evaluation process',
              text: 'Examiners review performance, rule compliance, and safe driving behavior.',
            },
            {
              title: 'Result publication',
              text: 'Results are published online after review and approval are completed.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <h3 className="font-semibold text-[#1F2937] mb-2">{item.title}</h3>
              <p className="text-sm text-[#4B5563] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-sm">
        <h2 className="text-lg font-bold text-[#1F2937] mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {[
            {
              q: 'How do I book a driving test?',
              a: 'Create your candidate profile, choose an institution, and submit a booking request through ADLTS.',
            },
            {
              q: 'How long does approval take?',
              a: 'Approval times depend on the institution review workflow and current request volume.',
            },
            {
              q: 'Can I change my institution?',
              a: 'Institution changes depend on the approval state and the policies of the reviewing institution.',
            },
            {
              q: 'How do I check my results?',
              a: 'Log in to your account and open the results area after the examination review is completed.',
            },
            {
              q: 'What happens if I fail the exam?',
              a: 'You can review the published outcome and follow the institution guidance for next steps or retesting.',
            },
            {
              q: 'Can I retake the test?',
              a: 'Retake eligibility depends on the institution policy and the official testing schedule.',
            },
          ].map((item) => (
            <details key={item.q} className="group rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <summary className="cursor-pointer list-none font-semibold text-[#1F2937] flex items-center justify-between gap-4">
                <span>{item.q}</span>
                <span className="text-blue-600 text-lg transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm sm:text-base text-[#4B5563] leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
