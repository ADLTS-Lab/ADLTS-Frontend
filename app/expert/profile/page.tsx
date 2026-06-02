"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useI18n } from "@/i18n/useI18n";
import { Alert } from "@/app/components/ui";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import { extractApiError } from "@/services/api-utils";
import { uploadExpertPhoto } from "@/services/expert.service";
import RoleProfileView from "@/components/RoleProfileView";

type ProfileImageSource = Record<string, unknown> | null | undefined;

function readProfileImage(user: ProfileImageSource): string {
  const record = user || {};
  const source =
    record.photoUrl ??
    record.photo ??
    record.photo_url ??
    record.avatar ??
    record.avatar_url ??
    record.profile_image ??
    record.profileImage ??
    "";

  return typeof source === "string" ? source : "";
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
