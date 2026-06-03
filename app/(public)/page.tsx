import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Bot,
  CalendarCheck,
  CarFront,
  ClipboardCheck,
  Database,
  FileCheck2,
  FileText,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";

import { ButtonLink, Card, PageContainer, PageHeader } from "@/app/components/ui";

import manualEvaluationImage from "./images/manual eval image.jpg";
import paperScoreSheetImage from "./images/paper eval.jpg";
import drivingVehicleImage from "./images/solo driving image.jpg";

const problemCards = [
  {
    title: "Manual Paper Records",
    body: "Results may be delayed due to administrative processing.",
    icon: FileText,
  },
  {
    title: "Subjective Evaluation",
    body: "Assessment consistency can vary between evaluators.",
    icon: ClipboardCheck,
  },
  {
    title: "Limited Transparency",
    body: "Candidates may not easily understand how scores were determined.",
    icon: SearchCheck,
  },
  {
    title: "Administrative Overhead",
    body: "Managing records and reporting requires significant effort.",
    icon: Database,
  },
];

const solutionCards = [
  {
    title: "AI-Assisted Evaluation",
    body: "Computer vision and telemetry assist with objective scoring.",
    icon: Bot,
  },
  {
    title: "Expert Validation",
    body: "Qualified experts review and validate assessments.",
    icon: ShieldCheck,
  },
  {
    title: "Instant Digital Records",
    body: "All results and reports are stored digitally.",
    icon: Database,
  },
  {
    title: "Transparent Reporting",
    body: "Candidates receive detailed breakdowns of their performance.",
    icon: BarChart3,
  },
];

const processSteps = [
  {
    title: "Book Driving Test",
    body: "Schedule and manage test appointments.",
    icon: CalendarCheck,
  },
  {
    title: "Take Examination",
    body: "Complete practical driving assessment.",
    icon: CarFront,
  },
  {
    title: "AI Analysis",
    body: "Driving performance is analyzed automatically.",
    icon: Bot,
  },
  {
    title: "Expert Review",
    body: "Human experts validate and confirm results.",
    icon: ShieldCheck,
  },
  {
    title: "Receive Results",
    body: "Access reports, appeals, and licensing information.",
    icon: FileCheck2,
  },
];

const impactStats = [
  {
    value: "70%",
    label: "Faster Processing",
    detail: "Demonstration metric for reduced administrative turnaround.",
  },
  {
    value: "90%",
    label: "Reduced Paperwork",
    detail: "Demonstration metric for digitized assessment records.",
  },
  {
    value: "100%",
    label: "Digital Record Coverage",
    detail: "Demonstration metric for structured result storage.",
  },
  {
    value: "24/7",
    label: "Transparent Audit Trail",
    detail: "Demonstration metric for continuous system traceability.",
  },
];

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-4 py-20 sm:px-6 lg:px-8 ${className}`}>
      <PageContainer width="wide" className="mx-auto">
        {children}
      </PageContainer>
    </section>
  );
}

function FeatureCard({
  title,
  body,
  icon: Icon,
}: {
  title: string;
  body: string;
  icon: React.ElementType;
}) {
  return (
    <Card padding="md" className="h-full">
      <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-[6px] border border-[var(--border)] bg-[var(--accent-subtle)] text-[var(--accent)]">
        <Icon size={18} aria-hidden="true" />
      </div>
      <h3 className="text-[15px] font-semibold leading-6 text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">{body}</p>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <main className="bg-[var(--bg)]">
      <Section className="bg-[var(--surface)]">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.92fr] lg:items-center">
          <div className="max-w-3xl">
            <h1 className="text-[48px] font-bold leading-[1.08] tracking-normal text-[var(--text-primary)] max-md:text-[36px]">
              Modernizing Driving License Testing in Ethiopia
            </h1>
            <p className="mt-5 max-w-2xl text-[19px] leading-8 text-[var(--text-primary)]">
              From paper-based assessments and manual scoring to transparent, technology-assisted driver evaluation.
            </p>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[var(--text-secondary)]">
              ADLTS streamlines the driving test process through digital assessments, AI-assisted scoring, expert review, and real-time result management.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/login" size="lg">
                Get Started
              </ButtonLink>
              <ButtonLink href="#problem" variant="outline" size="lg">
                Learn More
              </ButtonLink>
            </div>
          </div>

          <Card padding="sm" className="shadow-[var(--shadow-resting)]">
            <div className="overflow-hidden rounded-[6px] border border-[var(--border)] bg-[var(--surface-2)]">
              <Image
                src={paperScoreSheetImage}
                alt="Paper driving test score sheet"
                priority
                unoptimized
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-4 px-2 py-3">
              <div>
                <p className="text-[13px] font-semibold text-[var(--text-primary)]">Manual score sheet baseline</p>
                <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">Digitized for traceable scoring and reporting.</p>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <Section id="problem" className="bg-[var(--surface-2)]">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <Card padding="sm" className="overflow-hidden">
            <Image
              src={manualEvaluationImage}
              alt="Person manually evaluating a driver"
              unoptimized
              className="aspect-[4/3] w-full rounded-[6px] object-cover"
            />
          </Card>

          <div>
            <PageHeader
              title="The Traditional Process Has Challenges"
              description="Manual evaluation methods can introduce delays, paperwork, and limited transparency."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {problemCards.map((card) => (
                <FeatureCard key={card.title} {...card} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-[var(--surface)]">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <PageHeader
              title="A Better Way to Assess Drivers"
              description="Technology supports a faster, more transparent, and more consistent evaluation process."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {solutionCards.map((card) => (
                <FeatureCard key={card.title} {...card} />
              ))}
            </div>
          </div>

          <Card padding="sm" className="overflow-hidden">
            <Image
              src={drivingVehicleImage}
              alt="Driving vehicle used for assessment"
              unoptimized
              className="aspect-[16/10] w-full rounded-[6px] object-cover"
            />
          </Card>
        </div>
      </Section>

      <Section className="bg-[var(--bg)]">
        <PageHeader title="How ADLTS Works" />
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {processSteps.map((step, index) => (
            <Card key={step.title} padding="md" className="relative text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-[6px] border border-[var(--border)] bg-[var(--accent-subtle)] text-[var(--accent)]">
                <step.icon size={20} aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-[14px] font-semibold text-[var(--text-primary)]">{step.title}</h3>
              <p className="mt-2 text-[12px] leading-5 text-[var(--text-secondary)]">{step.body}</p>
              {index < processSteps.length - 1 ? (
                <span className="pointer-events-none absolute right-[-14px] top-10 hidden h-px w-7 bg-[var(--border-strong)] md:block" />
              ) : null}
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-[var(--surface-2)]">
        <PageHeader
          title="Benefits of ADLTS"
          description="The figures below are demonstration metrics used to communicate the target impact of a fully digital assessment workflow."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {impactStats.map((stat) => (
            <Card key={stat.label} padding="md" variant="metric">
              <p className="text-[13px] font-medium text-[var(--text-secondary)]">{stat.label}</p>
              <p className="mt-3 text-[36px] font-bold leading-none text-[var(--accent)]">{stat.value}</p>
              <p className="mt-4 text-[12px] leading-5 text-[var(--text-secondary)]">{stat.detail}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-[var(--accent-hover)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[32px] font-bold leading-tight" style={{ color: "var(--surface)" }}>
              Ready for the Future of Driver Assessment?
            </h2>
            <p className="mt-4 text-[16px] leading-7 text-[var(--accent-subtle)]">
              Join the transition from manual processes to transparent, technology-assisted evaluation.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/login" variant="secondary" size="lg">
              Login
            </ButtonLink>
            <ButtonLink href="/candidate/register" size="lg" className="!border-blue-600 !bg-blue-600 !text-white hover:!border-blue-700 hover:!bg-blue-700">
              Register
            </ButtonLink>
          </div>
        </div>
      </Section>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-10 sm:px-6 lg:px-8">
        <PageContainer width="wide" className="mx-auto">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[15px] font-bold text-[var(--text-primary)]">ADLTS</p>
              <p className="mt-1 text-[13px] text-[var(--text-secondary)]">Automated Driving License Testing System</p>
            </div>
            <nav className="flex flex-wrap gap-4 text-[13px] font-medium text-[var(--text-secondary)]" aria-label="Landing footer">
              <Link href="/about" className="hover:text-[var(--accent)]">About</Link>
              <Link href="/guidelines" className="hover:text-[var(--accent)]">Documentation</Link>
              <Link href="/contact" className="hover:text-[var(--accent)]">Support</Link>
              <Link href="/contact" className="hover:text-[var(--accent)]">Contact</Link>
            </nav>
          </div>
        </PageContainer>
      </footer>
    </main>
  );
}
