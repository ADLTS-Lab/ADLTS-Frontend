import { InvitationManagementPage } from "@/components/InvitationManagementPage";

export default function AdminInvitationsPage() {
  return (
    <InvitationManagementPage
      title="Invitation management"
      description="Invite experts and institutions using the backend-supported admin invitation workflow."
      createDescription="Admin invitations are limited by the backend to expert and institution accounts."
      entityOptions={["expert", "institute"]}
    />
  );
}
