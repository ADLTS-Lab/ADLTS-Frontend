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
    <div className="rounded-3xl border border-slate-100 bg-white p-4 sm:p-5">
      <p className="mb-3 text-sm font-semibold text-slate-900">{title}</p>
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
          {(previewUrl || imageUrl) ? (
            <img
              src={previewUrl ?? imageUrl ?? ""}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <Camera className="h-9 w-9 text-slate-400" />
          )}
        </div>

        <div className="space-y-2">
          <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer">
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
          <p className="text-xs text-slate-500">Use a square image. File field must be named <span className="font-semibold">file</span>.</p>
        </div>
      </div>

      {errorMessage ? <p className="mb-2 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p> : null}
      {successMessage ? <p className="mb-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p> : null}
    </div>
  );
}
