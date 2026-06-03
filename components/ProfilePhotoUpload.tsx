"use client";

import { ChangeEvent, useState } from "react";
import { Camera, Upload } from "lucide-react";

type ProfilePhotoUploadProps = {
  title?: string;
  imageUrl?: string | null;
  disabled?: boolean;
  onUpload: (file: File) => Promise<{ photoUrl?: string } | void>;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (message: string) => void;
};

export default function ProfilePhotoUpload({
  title = "Profile Image",
  imageUrl,
  disabled,
  onUpload,
  onUploadSuccess,
  onUploadError,
}: ProfilePhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsUploading(true);

    const localUrl = URL.createObjectURL(selected);
    setPreviewUrl(localUrl);

    try {
      const result = await onUpload(selected);
      const nextUrl = result && "photoUrl" in result ? result.photoUrl : undefined;

      if (nextUrl) {
        setPreviewUrl(nextUrl);
        onUploadSuccess?.(nextUrl);
        setSuccessMessage("Profile image updated.");
        setTimeout(() => setSuccessMessage(""), 2500);
      }
    } catch (error) {
      setPreviewUrl((imageUrl ?? null));
      const nextError = error instanceof Error ? error.message : "Upload failed.";
      setErrorMessage(nextError);
      onUploadError?.(nextError);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[50%] border border-[var(--border)] bg-[var(--surface-2)]">
          {(previewUrl || imageUrl) ? (
            <img
              src={previewUrl ?? imageUrl ?? ""}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <Camera className="h-9 w-9 text-[var(--text-tertiary)]" />
          )}
        </div>

        <div className="space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-[6px] border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--surface-2)]">
            <Upload size={16} />
            <span>{isUploading ? "Uploading..." : "Upload new image"}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading || disabled}
              onChange={handleFileChange}
            />
          </label>
          <p className="text-xs text-[var(--text-secondary)]">Use a square image. File field must be named <span className="font-semibold">file</span>.</p>
        </div>
      </div>

      {errorMessage ? <p className="mb-2 rounded-md bg-[var(--danger-subtle)] px-3 py-2 text-sm text-[var(--danger)]">{errorMessage}</p> : null}
      {successMessage ? <p className="mb-2 rounded-md bg-[var(--success-subtle)] px-3 py-2 text-sm text-[var(--success)]">{successMessage}</p> : null}
    </div>
  );
}
