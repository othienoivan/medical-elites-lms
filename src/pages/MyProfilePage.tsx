import { Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import ProfileImageUpload from "../components/upload/ProfileImageUpload";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { updateOwnStudentProfile } from "../firebase/studentProfile";
import { deleteFileFromStorage } from "../firebase/storage";
import useAuth from "../hooks/useAuth";

export default function MyProfilePage() {
  const { currentUser, userProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profilePhotoPath, setProfilePhotoPath] = useState("");
  const [originalPhotoPath, setOriginalPhotoPath] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const profile = userProfile as Record<string, unknown> | null;

    setFullName(String(profile?.fullName ?? ""));
    setPhoneNumber(String(profile?.phoneNumber ?? profile?.phone ?? ""));
    setAddress(String(profile?.address ?? ""));
    setEmergencyContact(String(profile?.emergencyContact ?? ""));

    const photo = String(profile?.profilePhoto ?? currentUser?.photoURL ?? "");
    const photoPath = String(profile?.profilePhotoPath ?? "");

    setProfilePhoto(photo);
    setProfilePhotoPath(photoPath);
    setOriginalPhotoPath(photoPath);
  }, [currentUser?.photoURL, userProfile]);

  async function replacePhoto(file: {
    downloadUrl: string;
    filePath: string;
  }) {
    const previousPendingPath =
      profilePhotoPath && profilePhotoPath !== originalPhotoPath
        ? profilePhotoPath
        : "";

    setProfilePhoto(file.downloadUrl);
    setProfilePhotoPath(file.filePath);

    if (previousPendingPath && previousPendingPath !== file.filePath) {
      await deleteFileFromStorage(previousPendingPath).catch((error) =>
        console.warn("Previous unsaved profile picture could not be deleted.", error),
      );
    }
  }

  async function removePhoto() {
    const pendingPath =
      profilePhotoPath && profilePhotoPath !== originalPhotoPath
        ? profilePhotoPath
        : "";

    setProfilePhoto("");
    setProfilePhotoPath("");

    if (pendingPath) {
      await deleteFileFromStorage(pendingPath).catch((error) =>
        console.warn("Unsaved profile picture could not be deleted.", error),
      );
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setMessage("");

    try {
      await updateOwnStudentProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        emergencyContact: emergencyContact.trim(),
        profilePhoto,
        profilePhotoPath,
      });

      if (originalPhotoPath && originalPhotoPath !== profilePhotoPath) {
        await deleteFileFromStorage(originalPhotoPath).catch((error) =>
          console.warn("Previous profile picture could not be deleted.", error),
        );
      }

      setOriginalPhotoPath(profilePhotoPath);
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Profile could not be updated. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-10">
        <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-7 text-white">
          <div className="flex items-center gap-4">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Student profile"
                className="h-20 w-20 rounded-2xl border-2 border-white/50 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15">
                <UserRound size={42} />
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="mt-2 text-blue-100">
                Review and update your personal and contact information.
              </p>
            </div>
          </div>
        </section>

        <Card className="mt-6">
          <form onSubmit={save} className="space-y-5">
            <div>
              <h2 className="mb-3 text-lg font-bold text-slate-950">
                Profile picture
              </h2>

              {profilePhoto && (
                <div className="mb-4 flex items-center gap-4 rounded-2xl border bg-slate-50 p-4">
                  <img
                    src={profilePhoto}
                    alt="Current profile"
                    className="h-24 w-24 rounded-full object-cover"
                  />

                  <button
                    type="button"
                    className="text-sm font-bold text-red-600"
                    onClick={() => void removePhoto()}
                  >
                    Remove profile picture
                  </button>
                </div>
              )}

              <ProfileImageUpload
                label={
                  profilePhoto
                    ? "Replace Profile Picture"
                    : "Upload Profile Picture"
                }
                onUploaded={(file) => void replacePhoto(file)}
              />

              <p className="mt-2 text-xs text-slate-500">
                JPEG, PNG or WebP. Maximum 10 MB.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="font-semibold">
                Full name
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </label>

              <label className="font-semibold">
                Email
                <Input value={currentUser?.email ?? ""} disabled />
              </label>

              <label className="font-semibold">
                Telephone
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </label>

              <label className="font-semibold">
                Emergency contact
                <Input
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                />
              </label>
            </div>

            <label className="block font-semibold">
              Address
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>

            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-2">
              <p><strong>Programme:</strong> {(userProfile as any)?.programmeTitle || "Not assigned"}</p>
              <p><strong>Registration number:</strong> {(userProfile as any)?.registrationNumber || "Not assigned"}</p>
              <p><strong>Year of study:</strong> {(userProfile as any)?.yearOfStudy || "Not assigned"}</p>
              <p><strong>Semester:</strong> {(userProfile as any)?.semester || "Not assigned"}</p>
            </div>

            {message && (
              <p className="rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">
                {message}
              </p>
            )}

            <Button type="submit" disabled={saving}>
              <Save size={18} />
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </Card>
    </main>
  );
}