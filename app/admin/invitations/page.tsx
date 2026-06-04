import { InvitationManagementPage } from "@/components/InvitationManagementPage";

export default function AdminInvitationsPage() {
  return (
    <InvitationManagementPage
      title="Invitation management"
      description="Invite experts and institutions for test-center operations."
      createDescription="Admin invitations are limited by the backend to expert and institution accounts."
      entityOptions={["expert", "institute"]}
    />
  );
}
