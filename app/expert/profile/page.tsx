"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/useI18n";
import { Alert } from "@/app/components/ui";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import { extractApiError } from "@/services/api-utils";
import { uploadExpertPhoto } from "@/services/expert.service";
import RoleProfileView from "@/components/RoleProfileView";

type ProfileImageSource = {
  photoUrl?: string | null;
  photo?: string | null;
  photo_url?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  profile_image?: string | null;
  profileImage?: string | null;
};

function readStringField(source: unknown, key: keyof ProfileImageSource): string | null {
  if (!source || typeof source !== "object") {
    return null;
  }

  const value = Reflect.get(source, key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readProfileImage(user: unknown): string {
  return (
    readStringField(user, "photoUrl") ??
    readStringField(user, "photo") ??
    readStringField(user, "photo_url") ??
    readStringField(user, "avatar") ??
    readStringField(user, "avatar_url") ??
    readStringField(user, "profile_image") ??
    readStringField(user, "profileImage") ??
    ""
  );
}

export default function ExpertProfilePage() {
  const { t } = useI18n();
  const { user, setUser, token, role } = useAuthStore();
  const [photoUrl, setPhotoUrl] = useState(() => readProfileImage(user));
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const handlePhotoUpload = async (file: File) => {
    setUploadError("");
    setUploadSuccess("");

    try {
      const upload = await uploadExpertPhoto(file);
      const nextPhotoUrl = upload.data?.photoUrl;

      if (!nextPhotoUrl) {
        throw new Error("Upload response did not include an image URL.");
      }

      if (user) {
        const nextUser = {
          ...user,
          photoUrl: nextPhotoUrl,
          photo: nextPhotoUrl,
        };
        setUser(nextUser as typeof user, token ?? undefined, role || undefined);
      }

      setPhotoUrl(nextPhotoUrl);
      setUploadSuccess("Profile photo uploaded successfully.");
      setTimeout(() => {
        setUploadSuccess("");
      }, 5000);

      return { photoUrl: nextPhotoUrl };
    } catch (err) {
      const message = err instanceof Error ? err.message : extractApiError(err, "Unable to upload profile photo.");
      setUploadError(message);
      throw err;
    }
  };

  return (
    <main className="max-w-4xl mx-auto space-y-6 md:space-y-8">
      <RoleProfileView avatarUrl={photoUrl || undefined} />

      {uploadSuccess ? (
        <Alert variant="success">{uploadSuccess}</Alert>
      ) : null}
      {uploadError ? (
        <Alert variant="error">{uploadError}</Alert>
      ) : null}

      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {t("profilePhoto") || "Profile Photo"}
        </h2>
        <ProfilePhotoUpload
          title={t("uploadProfilePhoto") || "Upload profile photo"}
          imageUrl={photoUrl}
          onUpload={handlePhotoUpload}
          onUploadError={(message) => setUploadError(message)}
        />
      </div>
    </main>
  );
}
