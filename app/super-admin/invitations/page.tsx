import { InvitationManagementPage } from "@/components/InvitationManagementPage";

export default function SuperAdminInvitationsPage() {
  return (
    <InvitationManagementPage
      title="Platform invitations"
      description="Invite institutions and experts using the current super-admin invitation APIs."
      createDescription="Create an invitation for an institution account or expert reviewer account."
      entityOptions={["institute", "expert"]}
    />
  );
}
