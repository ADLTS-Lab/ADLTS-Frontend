import { Mail, MapPin, Phone, MessageSquare } from "lucide-react";
import { Card, CardHeader, PageContainer, PageHeader, ui } from "@/app/components/ui";

const channels = [
  {
    icon: Mail,
    label: "Email support",
    value: "support@adlts.et",
    detail: "General support requests, account access, and onboarding questions.",
  },
  {
    icon: Phone,
    label: "Direct line",
    value: "+251 11 000 0000",
    detail: "Support desk is available during standard business hours.",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "Addis Ababa, Ethiopia",
    detail: "Visit during official working hours for physical document verification.",
  },
];

export default function ContactPage() {
  return (
    <PageContainer width="wide" className="space-y-8">
      <PageHeader
        eyebrow="Contact"
        title="Need help?"
        description="Use the contacts below to get support from the ADLTS team."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {channels.map((channel) => {
          const Icon = channel.icon;
          return (
            <Card key={channel.label} className="space-y-2">
              <CardHeader
                title={channel.label}
                description={channel.detail}
                action={<Icon className="h-4 w-4 text-[var(--adlts-blue-700)]" />}
              />
              <p className={ui.statLabel}>{channel.value}</p>
            </Card>
          );
        })}
      </div>

      <Card className="space-y-3">
        <CardHeader
          title="Send us a message"
          description="For implementation or integration follow-ups, include ticket details and affected role."
          action={<MessageSquare className="h-4 w-4 text-[var(--adlts-blue-700)]" />}
        />
        <p className="text-sm text-[var(--adlts-ink-600)]">
          If this is an urgent operational issue (locked account, failed booking state, or missing results),
          include your user email and request ID in your message.
        </p>
      </Card>
    </PageContainer>
  );
}
