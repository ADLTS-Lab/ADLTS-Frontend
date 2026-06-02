"use client";

import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/useI18n";

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
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t("roleProfile_title")}</h1>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4 text-sm">
        {Boolean(displayAvatar) ? (
          <div className="mb-2">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
              <img
                src={displayAvatar || ""}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ) : null}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            {t("roleProfile_name")}
          </p>
          <p className="font-semibold text-slate-900">{displayName}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            {t("roleProfile_email")}
          </p>
          <p className="text-slate-700">{user?.email || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            {t("roleProfile_role")}
          </p>
          <p className="text-slate-700">{user?.role || "—"}</p>
        </div>
      </div>
    </div>
  );
}
