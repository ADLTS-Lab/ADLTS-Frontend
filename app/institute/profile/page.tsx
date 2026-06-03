"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Building, CheckCircle, FileText, Lock, Mail, MapPin, Phone, RefreshCw, Save, User as UserIcon } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  Input,
  PageContainer,
  PageHeader,
  StatBlock,
  StatusBadge,
  Textarea,
} from "@/app/components/ui";
import { changePassword } from "@/services/auth.service";
import { getInstituteProfile, updateInstituteProfile, uploadInstituteLogo } from "@/services/institute.service";
import { extractApiError } from "@/services/api-utils";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";

export default function InstituteProfilePage() {
  const [isLoading, setIsLoading] = useState(true);

  const [institutionName, setInstitutionName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

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
      <PageContainer width="wide">
        <Card padding="lg" className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded-[6px] bg-[var(--surface-2)]" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-11 rounded-[6px] bg-[var(--surface-2)]" />
            <div className="h-11 rounded-[6px] bg-[var(--surface-2)]" />
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="wide" className="space-y-6">
      <PageHeader
        title="Institute profile"
        description="Update institution identity details used by candidates and coordinators."
        action={<StatusBadge status="Active" tone="success" />}
      />

      {successMessage ? <Alert variant="success">{successMessage}</Alert> : null}
      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Institution identity"
              description="Core profile details shown across the ADLTS institute workflow."
            />
            <div className="grid gap-4">
              <StatBlock label="Institution" value={institutionName || "-"} />
              <StatBlock label="Contact person" value={contactPerson || "-"} />
              <StatBlock label="Institution ID" value={institutionId || "-"} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Logo upload" description="Keep the institution identity recognizable to candidates and coordinators." />
            <ProfilePhotoUpload
              title="Institute logo"
              imageUrl={logoUrl}
              onUpload={handleLogoUpload}
              onUploadError={(message) => setErrorMessage(message)}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Contact and location details"
              description="Maintain official contact, address, and public institution description."
              action={<Building size={18} className="text-[var(--accent)]" />}
            />

            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Institution name"
                  required
                  value={institutionName}
                  onChange={(event) => setInstitutionName(event.target.value)}
                />
                <Input
                  label="Contact person"
                  required
                  value={contactPerson}
                  onChange={(event) => setContactPerson(event.target.value)}
                  suffix={<UserIcon className="h-4 w-4 text-[var(--text-tertiary)]" />}
                />
              </div>

              <Textarea
                label="Description"
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Phone number"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  suffix={<Phone className="h-4 w-4 text-[var(--text-tertiary)]" />}
                />
                <Input
                  label="Address"
                  required
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  suffix={<MapPin className="h-4 w-4 text-[var(--text-tertiary)]" />}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Email address"
                  disabled
                  value={email}
                  suffix={<Mail className="h-4 w-4 text-[var(--text-tertiary)]" />}
                />
                <Input
                  label="Institution ID"
                  disabled
                  value={institutionId}
                  suffix={<FileText className="h-4 w-4 text-[var(--text-tertiary)]" />}
                />
              </div>

              <div className="border-t border-[var(--border)] pt-5">
                <Button type="submit" disabled={isSaving} className="w-full md:w-auto" state={isSaving ? { loading: true } : undefined}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader title="Security" description="Use a strong password and keep institute credentials private." />

            {passwordSuccess ? (
              <Alert variant="success">
                <CheckCircle className="mr-2 inline-block h-4 w-4" />
                {passwordSuccess}
              </Alert>
            ) : null}
            {passwordError ? (
              <Alert variant="error">
                <AlertCircle className="mr-2 inline-block h-4 w-4" />
                {passwordError}
              </Alert>
            ) : null}

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <Input
                  label="Current password"
                  required
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
                <Input
                  label="New password"
                  required
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
                <Input
                  label="Confirm password"
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </div>

              <div className="border-t border-[var(--border)] pt-5">
                <Button
                  type="submit"
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  state={isChangingPassword ? { loading: true } : undefined}
                  className="w-full md:w-auto"
                >
                  {isChangingPassword ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Updating
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Update password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
