"use client";

import { useAuthStore } from "@/store/authStore";
import { Card, CardHeader, StatBlock, StatusBadge } from "@/app/components/ui";

type RoleProfileViewProps = {
  avatarUrl?: string | null;
};

type ProfileImageSource = {
  photo?: string | null;
  photoUrl?: string | null;
  photo_url?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  profile_image?: string | null;
};

function readStringField(source: unknown, key: keyof ProfileImageSource): string | null {
  if (!source || typeof source !== "object") {
    return null;
  }

  const value = Reflect.get(source, key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

function getAvatarUrl(user: unknown, avatarUrl?: string | null): string | null {
  return (
    avatarUrl ??
    readStringField(user, "photoUrl") ??
    readStringField(user, "photo") ??
    readStringField(user, "photo_url") ??
    readStringField(user, "avatar") ??
    readStringField(user, "avatar_url") ??
    readStringField(user, "profile_image") ??
    null
  );
}

function formatRole(value?: string | null) {
  return value ? value.replace(/_/g, " ") : "-";
}

export default function RoleProfileView({ avatarUrl }: RoleProfileViewProps) {
  const { user } = useAuthStore();
  const displayAvatar = getAvatarUrl(user, avatarUrl);
  const displayName =
    user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "-";

  return (
    <Card className="max-w-[720px] space-y-4 p-0">
      <CardHeader
        title="Profile summary"
        description="Profile details help ADLTS show the correct identity and contact information across role-based workflows."
        action={<StatusBadge status={formatRole(user?.role)} tone="neutral" />}
      />

      <div className="space-y-4 px-6 pb-6">
        {displayAvatar ? (
          <div className="h-16 w-16 overflow-hidden rounded-[50%] border border-[var(--border)] bg-[var(--surface-2)]">
            <img
              src={displayAvatar}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <StatBlock label="Name" value={displayName} />
          <StatBlock label="Email" value={user?.email || "-"} />
          <StatBlock label="Role" value={formatRole(user?.role)} />
        </div>

        <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <p className="text-[14px] leading-6 text-[var(--text-secondary)]">
            Keep your profile accurate so account actions can be associated with the correct identity.
          </p>
        </div>
      </div>
    </Card>
  );
}
