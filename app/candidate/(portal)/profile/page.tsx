"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, RefreshCw, Save } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { changePassword, getCurrentUser, type User as AuthUser } from "@/services/auth.service";
import { updateMyCandidateProfile, uploadMyCandidatePhoto } from "@/services/candidates.service";
import { extractApiError } from "@/services/api-utils";
import {
  Alert,
  Button,
  Card,
  CardHeader,
  Input,
  PageContainer,
  PageHeader,
  Select,
  StatBlock,
  StatusBadge,
  ui,
} from "@/app/components/ui";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";

type ProfileImageSource = {
  photo_url?: string | null;
  photoUrl?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  profile_image?: string | null;
  logo?: string | null;
  image?: string | null;
};

type CandidateUser = AuthUser & {
  testCenter?: string | null;
};

function readStringField(source: unknown, key: keyof ProfileImageSource): string | null {
  if (!source || typeof source !== "object") {
    return null;
  }

  const value = Reflect.get(source, key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readProfileImage(user: CandidateUser | null | undefined): string {
  if (!user || typeof user !== "object") return "";

  return (
    readStringField(user, "photoUrl") ??
    readStringField(user, "photo_url") ??
    readStringField(user, "avatar") ??
    readStringField(user, "avatar_url") ??
    readStringField(user, "profile_image") ??
    readStringField(user, "logo") ??
    readStringField(user, "image") ??
    ""
  );
}

export default function CandidateProfile() {
  const { user: storedUser, token: storedToken, role: storedRole, isAuthenticated, setUser } = useAuthStore();
  const [profile, setProfile] = useState<CandidateUser | null>(storedUser);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const didInitRef = useRef(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [photoUrl, setPhotoUrl] = useState(readProfileImage(storedUser));

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    let isMounted = true;

    const applyProfile = (currentUser: CandidateUser) => {
      setProfile(currentUser);
      setFirstName(currentUser.first_name || "");
      setLastName(currentUser.last_name || "");
      setPhone(currentUser.phone || "");
      setEmail(currentUser.email || "");
      setBirthDate(currentUser.birth_date || "");
      setGender(currentUser.gender || "");
      setAddress(currentUser.address || "");
      setPhotoUrl(readProfileImage(currentUser));
    };

    const loadProfileOnce = async () => {
      if (storedUser) {
        applyProfile(storedUser);
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);
      try {
        const currentUser = await getCurrentUser();
        if (!isMounted) return;

        if (currentUser) {
          applyProfile(currentUser as CandidateUser);
          setUser(currentUser, storedToken || undefined, storedRole || undefined);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(extractApiError(err, "Unable to load this data right now. Refresh the page or contact support if the issue continues."));
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    void loadProfileOnce();

    return () => {
      isMounted = false;
    };
  }, [storedUser, setUser, storedToken, storedRole]);

  useEffect(() => {
    if (storedUser && !isSaving) {
      setProfile(storedUser as CandidateUser);
      setFirstName(storedUser.first_name || "");
      setLastName(storedUser.last_name || "");
      setPhone(storedUser.phone || "");
      setEmail(storedUser.email || "");
      setBirthDate(storedUser.birth_date || "");
      setGender(storedUser.gender || "");
      setAddress(storedUser.address || "");
      setPhotoUrl(readProfileImage(storedUser as CandidateUser));
    }
  }, [storedUser, isSaving]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      const updated = await updateMyCandidateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        birth_date: birthDate,
        gender,
        address,
      });

      if (updated) {
        const updatedUser: CandidateUser = {
          id: updated.id,
          email: updated.email,
          role: "candidate",
          first_name: updated.first_name,
          last_name: updated.last_name,
          phone: updated.phone,
          licenseCategory: updated.licenseCategory,
          testCenter: updated.testCenter,
          birth_date: updated.birth_date,
          gender: updated.gender,
          address: updated.address,
        };
        setProfile(updatedUser);
        setUser(updatedUser as typeof storedUser, storedToken || undefined, storedRole || undefined);
        setSuccessMessage("Profile details updated.");

        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        setErrorMessage("Unable to update profile details.");
      }
    } catch (err) {
      setErrorMessage(extractApiError(err, "Unable to update profile details."));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
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
      setPasswordError(extractApiError(err, "Unable to change password."));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setBirthDate(profile.birth_date || "");
      setGender(profile.gender || "");
      setAddress(profile.address || "");
      setSuccessMessage("");
      setErrorMessage("");
      setPhotoUrl(readProfileImage(profile));
    }
  };

  const handlePhotoUpload = async (file: File) => {
    const upload = await uploadMyCandidatePhoto(file);
    const nextPhotoUrl = upload.data?.photoUrl;

    if (nextPhotoUrl && storedUser) {
      const nextUser: CandidateUser = {
        ...storedUser,
        photo: nextPhotoUrl,
        photoUrl: nextPhotoUrl,
      } as CandidateUser;

      setUser(nextUser, storedToken || undefined, storedRole || undefined);
      setProfile(nextUser);
      setPhotoUrl(nextPhotoUrl);
      setSuccessMessage("Profile image uploaded successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
    }

    return upload.data || {};
  };

  if ((!isAuthenticated && typeof window === "undefined") || isProfileLoading) {
    return (
      <PageContainer width="narrow">
        <Card padding="lg" className="animate-pulse space-y-4">
          <div className="h-5 w-40 rounded-[6px] bg-[var(--surface-2)]" />
          <div className="h-5 w-72 rounded-[6px] bg-[var(--surface-2)]" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-11 rounded-[6px] bg-[var(--surface-2)]" />
            <div className="h-11 rounded-[6px] bg-[var(--surface-2)]" />
          </div>
        </Card>
      </PageContainer>
    );
  }

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "C";
  const displayName = `${firstName} ${lastName}`.trim() || "Candidate";

  return (
    <PageContainer width="narrow" className="space-y-6">
      <PageHeader
        title="Candidate profile"
        description="Keep your contact and identity details accurate so institutions and support teams can review your booking without delays."
        action={<StatusBadge status="Active" tone="success" />}
      />

      {successMessage ? <Alert variant="success">{successMessage}</Alert> : null}
      {errorMessage ? <Alert variant="error">{errorMessage}</Alert> : null}

      <Card>
        <CardHeader title="Profile summary" description="Profile details help ADLTS show the correct identity and contact information across role-based workflows." />
        <div className="flex flex-col items-center gap-4 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-start">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[50%] bg-[var(--accent-subtle)] text-[20px] font-semibold text-[var(--accent)]">
            {initials}
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-[20px] font-semibold text-[var(--text-primary)]">{displayName}</h2>
            <p className={`inline-flex items-center gap-2 text-[14px] ${ui.statLabel}`}>
              <Mail size={16} /> {email}
            </p>
          </div>
        </div>

        <div className="pt-4">
          <ProfilePhotoUpload
            imageUrl={photoUrl}
            onUpload={handlePhotoUpload}
            onUploadError={(message) => setErrorMessage(message)}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Account details" />
        <div className="grid gap-3 md:grid-cols-3">
          <StatBlock label="Email" value={email || "-"} />
          <StatBlock label="Role" value="Candidate" />
          <StatBlock label="Phone" value={phone || "-"} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Personal information" />

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="First name" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Last name" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <Input label="Email address (read only)" type="email" disabled value={email} />

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Phone number" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Birth date" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Gender" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
            <Input label="Address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row">
            <Button type="submit" disabled={isSaving} className="sm:flex-1" state={isSaving ? { loading: true } : undefined}>
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 inline animate-spin" size={16} />
                  Updating profile
                </>
              ) : (
                <>
                  <Save className="mr-2 inline" size={16} />
                  Update profile
                </>
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset} disabled={isSaving}>
              Reset
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Security"
          description="Use a strong password and update it immediately if you think your account has been exposed."
        />

        {passwordSuccess ? <Alert variant="success">{passwordSuccess}</Alert> : null}
        {passwordError ? <Alert variant="error">{passwordError}</Alert> : null}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Current password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="border-t border-[var(--border)] pt-4">
            <Button
              type="submit"
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
              state={isChangingPassword ? { loading: true } : undefined}
              className="sm:w-auto"
            >
              {isChangingPassword ? (
                <>
                  <RefreshCw className="mr-2 inline animate-spin" size={16} />
                  Updating
                </>
              ) : (
                <>
                  <Save className="mr-2 inline" size={16} />
                  Update password
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}
