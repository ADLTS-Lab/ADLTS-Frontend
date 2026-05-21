import PublicLayout from "@/components/PublicLayout";

/** Registration uses public chrome (not the candidate portal sidebar). */
export default function CandidateRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
