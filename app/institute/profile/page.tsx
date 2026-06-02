"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  Input,
  PageContainer,
  PageHeader,
  StatusBadge,
  Textarea,
} from "@/app/components/ui";
import { User as UserIcon, Mail, Phone, MapPin, Save, RefreshCw, CheckCircle, AlertCircle, Building, Lock, FileText } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";
import { changePassword } from "@/services/auth.service";
import { getInstituteProfile, updateInstituteProfile, uploadInstituteLogo, type InstituteProfile } from "@/services/institute.service";
import { extractApiError } from "@/services/api-utils";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";

export default function InstituteProfilePage() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<InstituteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [institutionName, setInstitutionName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // UI feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const res = await getInstituteProfile();
        if (!isMounted) return;

        if (res.success && res.data) {
          setProfile(res.data);
          setInstitutionName(res.data.institutionName);
          setContactPerson(res.data.contactPerson);
          setPhone(res.data.phone);
          setAddress(res.data.address);
          setDescription(res.data.description);
          setEmail(res.data.email);
          setInstitutionId(res.data.institutionId);
          setLogoUrl(res.data.logoUrl || "");
          setErrorMessage("");
        } else {
          setErrorMessage("Failed to load institute profile.");
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(extractApiError(err, "Unable to load institute profile."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      const res = await updateInstituteProfile({
        institutionName,
        contactPerson,
        phone,
        address,
        description,
      });

      if (res.success && res.data) {
        setProfile(res.data);
        setSuccessMessage("Profile updated successfully.");
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage("Failed to update profile.");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 5000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Unable to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await uploadInstituteLogo(file);
      const nextLogoUrl = res.data?.logoUrl;

      if (!nextLogoUrl) {
        throw new Error("Upload response did not include a logo URL.");
      }

      setLogoUrl(nextLogoUrl);
      setProfile((nextProfile) => {
        if (!nextProfile) return nextProfile;
        return {
          ...nextProfile,
          logoUrl: nextLogoUrl,
        };
      });
      setSuccessMessage("Institute logo uploaded successfully.");
      setTimeout(() => setSuccessMessage(""), 5000);

      return { photoUrl: nextLogoUrl };
    } catch (err) {
      const nextMessage = err instanceof Error ? err.message : extractApiError(err, "Unable to upload logo.");
      setErrorMessage(nextMessage);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <PageContainer width="narrow">
        <Card padding="lg" className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-[var(--adlts-surface-soft)]" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-11 rounded bg-[var(--adlts-surface-soft)]" />
            <div className="h-11 rounded bg-[var(--adlts-surface-soft)]" />
          </div>
        </Card>
      </PageContainer>
    );
  }

  const initials = institutionName.substring(0, 2).toUpperCase() || "IN";

  return (
    <PageContainer width="narrow" className="space-y-6">
      <PageHeader
        eyebrow="Institute"
        title={institutionName || "Institute profile"}
        description={`${contactPerson || "Institute account"} · ${institutionId ? `ID: ${institutionId}` : ""}`}
        action={<StatusBadge label="Active" tone="success" />}
      />

      <Card>
        <CardHeader title="Institute logo" description="Upload and manage profile branding assets for portal clarity." />

        <ProfilePhotoUpload
          title="Institute Logo"
          imageUrl={logoUrl}
          onUpload={handleLogoUpload}
          onUploadError={(message) => setErrorMessage(message)}
        />
      </Card>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

      <Card>
        <CardHeader
          title={t("personalInfo")}
          description="Update institution identity details used by candidates and coordinators."
          action={<Building size={18} className="text-[var(--adlts-blue-700)]" />}
        />

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Input
                label="Institution Name"
                required
                value={institutionName}
                onChange={(event) => setInstitutionName(event.target.value)}
              />
            </div>
            <div>
              <Input
                label="Contact Person"
                required
                value={contactPerson}
                onChange={(event) => setContactPerson(event.target.value)}
                suffix={<UserIcon className="h-4 w-4 text-[var(--adlts-ink-400)]" />}
              />
            </div>
          </div>

            <Textarea
              label="Description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Phone Number"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              suffix={<Phone className="h-4 w-4 text-[var(--adlts-ink-400)]" />}
            />
            <Input
              label="Address"
              required
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              suffix={<MapPin className="h-4 w-4 text-[var(--adlts-ink-400)]" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Email Address"
              disabled
              value={email}
              suffix={<Mail className="h-4 w-4 text-[var(--adlts-ink-400)]" />}
            />
            <Input
              label="Institution ID"
              disabled
              value={institutionId}
              suffix={<FileText className="h-4 w-4 text-[var(--adlts-ink-400)]" />}
            />
          </div>

          <Button type="submit" disabled={isSaving} className="w-full md:w-auto" state={isSaving ? { loading: true } : undefined}>
            {isSaving ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> {t("saving")}</> : <><Save className="mr-2 h-4 w-4" /> {t("updateProfileButton")}</>}
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader title={t("changePassword")} description="Use a strong password and keep credentials private." />

        {passwordSuccess ? (
          <Alert variant="success">
            <CheckCircle className="inline-block h-4 w-4 mr-2" />
            {passwordSuccess}
          </Alert>
        ) : null}
        {passwordError ? (
          <Alert variant="error">
            <AlertCircle className="inline-block h-4 w-4 mr-2" />
            {passwordError}
          </Alert>
        ) : null}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t("currentPassword")}
              required
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            <Input
              label={t("newPassword")}
              required
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <Input
              label={t("confirmPassword")}
              required
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
            state={isChangingPassword ? { loading: true } : undefined}
            className="w-full md:w-auto"
          >
            {isChangingPassword ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Updating...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                {t("updatePassword")}
              </>
            )}
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
}
