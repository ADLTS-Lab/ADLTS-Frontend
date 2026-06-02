"use client";

import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/useI18n";
import { Card } from "@/app/components/ui/Card";
import { CardHeader } from "@/app/components/ui/Card";

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

export default function RoleProfileView({ avatarUrl }: RoleProfileViewProps) {
  const { user } = useAuthStore();
  const { t } = useI18n();
  const displayAvatar = getAvatarUrl(user, avatarUrl);

  const displayName =
    user?.name || `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "—";

  return (
    <Card className="max-w-lg space-y-4 p-0">
      <CardHeader
        title={t("roleProfile_title")}
        description={t("profile") || "Profile overview"}
      />

      <div className="px-6 pb-6 space-y-4">
        {Boolean(displayAvatar) ? (
          <div className="mb-2">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)]">
              <img
                src={displayAvatar || ""}
                alt={t("profilePhoto") || "Profile"}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}
        <dl className="grid gap-3 text-sm">
          <div className="grid gap-1 rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--adlts-ink-500)]">{t("roleProfile_name")}</dt>
            <dd className="font-medium text-[var(--adlts-ink-900)]">{displayName}</dd>
          </div>
          <div className="grid gap-1 rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--adlts-ink-500)]">{t("roleProfile_email")}</dt>
            <dd className="font-medium text-[var(--adlts-ink-900)]">{user?.email || "—"}</dd>
          </div>
          <div className="grid gap-1 rounded-md border border-[var(--adlts-border)] bg-[var(--adlts-surface-soft)] p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--adlts-ink-500)]">{t("roleProfile_role")}</dt>
            <dd className="font-medium text-[var(--adlts-ink-900)]">{user?.role || "—"}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
