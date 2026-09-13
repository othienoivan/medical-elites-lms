param(
  [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\package.json")) {
  throw "Run this script from the Medical Elites LMS project root."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = ".\image-upload-batch-backup-$timestamp"
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Read-Text([string]$Path) {
  return [System.IO.File]::ReadAllText((Resolve-Path $Path))
}

$ProjectRoot = (Get-Location).Path

function Resolve-ProjectPath([string]$Path) {
  $relativePath = $Path

  if ($relativePath.StartsWith(".\")) {
    $relativePath = $relativePath.Substring(2)
  }

  return Join-Path $ProjectRoot $relativePath
}

function Write-Text([string]$Path, [string]$Content) {
  $fullPath = Resolve-ProjectPath $Path
  $directory = Split-Path $fullPath -Parent

  if ($directory -and -not (Test-Path $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  $Content = $Content.TrimStart([char]0xFEFF)

  [System.IO.File]::WriteAllText(
    $fullPath,
    $Content,
    $utf8NoBom
  )
}

function Backup-File([string]$Path) {
  if (-not (Test-Path $Path)) { return }
  $relative = $Path.TrimStart(".\")
  $target = Join-Path $backupRoot $relative
  $dir = Split-Path $target -Parent
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  Copy-Item $Path $target -Force
}

$filesToBackup = @(
  ".\src\firebase\storage.tsx",
  ".\src\models\User.tsx",
  ".\src\contexts\AuthContext.tsx",
  ".\src\firebase\studentProfile.tsx",
  ".\src\pages\MyProfilePage.tsx",
  ".\src\models\Programme.tsx",
  ".\src\pages\CreateProgrammePage.tsx",
  ".\src\pages\EditProgrammePage.tsx",
  ".\src\pages\AdminProgrammesPage.tsx",
  ".\src\domains\platform\domain\tenant.ts",
  ".\src\domains\platform\domain\platformTypes.ts",
  ".\src\firebase\tenantAdmin.ts",
  ".\src\pages\platform\PlatformBrandingPage.tsx",
  ".\functions\src\index.ts"
)

$filesToBackup | ForEach-Object { Backup-File $_ }

Write-Host "Backups created at $backupRoot" -ForegroundColor Green

# 1. Student/profile uploader component
$profileUploadComponent = @'
import { CheckCircle2, Upload } from "lucide-react";
import { useRef, useState } from "react";

import {
  uploadProfileImageToStorage,
  type UploadResult,
} from "../../firebase/storage";

type Props = {
  label?: string;
  onUploaded: (result: UploadResult) => void;
};

export default function ProfileImageUpload({
  label = "Upload Profile Picture",
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState("");

  async function handleFile(file: File) {
    try {
      setUploading(true);
      setProgress(0);

      const result = await uploadProfileImageToStorage({
        file,
        onProgress: setProgress,
      });

      setUploadedFile(result.fileName);
      onUploaded(result);
    } catch (error) {
      console.error("Profile image upload failed:", error);
      alert(
        error instanceof Error && error.message
          ? error.message
          : "Profile image upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <input
        ref={inputRef}
        hidden
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = "";
          if (file) void handleFile(file);
        }}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-700 px-5 py-4 font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
      >
        <Upload size={20} />
        {uploading ? `Uploading ${progress}%` : label}
      </button>

      {uploadedFile && (
        <div className="mt-4 flex items-center gap-2 text-green-700">
          <CheckCircle2 size={18} />
          <span className="text-sm">{uploadedFile}</span>
        </div>
      )}
    </div>
  );
}
'@
Write-Text ".\src\components\upload\ProfileImageUpload.tsx" $profileUploadComponent

# 2. Add profile namespace upload helper to current central storage.tsx
$storagePath = ".\src\firebase\storage.tsx"
$storageContent = Read-Text $storagePath

if ($storageContent -notmatch "uploadProfileImageToStorage") {
  $profileHelper = @'

export async function uploadProfileImageToStorage({
  file,
  onProgress,
}: {
  file: File;
  onProgress?: (progress: number) => void;
}): Promise<UploadResult> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be signed in before uploading a profile picture.");
  }

  const contentType = inferContentType(file);

  if (file.size <= 0) {
    throw new Error("The selected image is empty.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Profile pictures must not exceed 10 MB.");
  }

  if (!contentType.startsWith("image/")) {
    throw new Error("Only image files are allowed for profile pictures.");
  }

  const safeFileName = createSafeFileName(file.name);
  const filePath = `users/${user.uid}/profile/${safeFileName}`;
  const storageRef = ref(storage, filePath);

  return new Promise<UploadResult>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType,
      customMetadata: {
        uploaderUid: user.uid,
        uploadFolder: "profile",
        originalFileName: file.name,
        imagePurpose: "profile-picture",
      },
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          snapshot.totalBytes > 0
            ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            : 0;
        onProgress?.(Math.round(progress));
      },
      reject,
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            fileName: file.name,
            filePath,
            downloadUrl,
            contentType,
            size: file.size,
          });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}
'@

  $anchor = "export async function deleteFileFromStorage"
  $index = $storageContent.IndexOf($anchor)
  if ($index -lt 0) {
    throw "Could not locate deleteFileFromStorage in src/firebase/storage.tsx."
  }

  $storageContent = $storageContent.Insert($index, $profileHelper + "`r`n")
  Write-Text $storagePath $storageContent
}

# 3. Student profile model and trusted update
$userModelPath = ".\src\models\User.tsx"
$userModel = Read-Text $userModelPath
if ($userModel -notmatch "profilePhotoPath\?: string;") {
  $userModel = $userModel.Replace(
    "  profilePhoto?: string;",
    "  profilePhoto?: string;`r`n  profilePhotoPath?: string;"
  )
  Write-Text $userModelPath $userModel
}

$authPath = ".\src\contexts\AuthContext.tsx"
$authContent = Read-Text $authPath
if ($authContent -notmatch "profilePhotoPath:") {
  $needle = @'
    profilePhoto:
      typeof data.profilePhoto === "string" ? data.profilePhoto : "",
'@
  $replacement = @'
    profilePhoto:
      typeof data.profilePhoto === "string" ? data.profilePhoto : "",
    profilePhotoPath:
      typeof data.profilePhotoPath === "string" ? data.profilePhotoPath : undefined,
'@
  if (-not $authContent.Contains($needle)) {
    throw "AuthContext profilePhoto mapping was not found."
  }
  $authContent = $authContent.Replace($needle, $replacement)
  Write-Text $authPath $authContent
}

$studentRepo = @'
import { httpsCallable } from "firebase/functions";

import { functions } from "../config/firebase";

export type StudentProfileUpdateInput = {
  fullName: string;
  phoneNumber: string;
  address: string;
  emergencyContact: string;
  profilePhoto: string;
  profilePhotoPath: string;
};

export async function updateOwnStudentProfile(
  input: StudentProfileUpdateInput,
): Promise<void> {
  const callable = httpsCallable<
    StudentProfileUpdateInput,
    { updated: boolean }
  >(functions, "updateOwnStudentProfile");

  await callable(input);
}
'@
Write-Text ".\src\firebase\studentProfile.tsx" $studentRepo

$functionsPath = ".\functions\src\index.ts"
$functionsContent = Read-Text $functionsPath

if ($functionsContent -notmatch 'profilePhotoPath: financeText\(input\.profilePhotoPath') {
  $needle = @'
      emergencyContact: financeText(input.emergencyContact, 120),
      updatedAt: FieldValue.serverTimestamp(),
'@
  $replacement = @'
      emergencyContact: financeText(input.emergencyContact, 120),
      profilePhoto: financeText(input.profilePhoto, 1200),
      profilePhotoPath: financeText(input.profilePhotoPath, 1500),
      updatedAt: FieldValue.serverTimestamp(),
'@
  if (-not $functionsContent.Contains($needle)) {
    throw "updateOwnStudentProfile payload block was not found in functions/src/index.ts."
  }
  $functionsContent = $functionsContent.Replace($needle, $replacement)
  Write-Text $functionsPath $functionsContent
}

# 4. Student My Profile page
$myProfilePage = @'
import { Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import StudentLayout from "../components/layout/StudentLayout";
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
    <StudentLayout>
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
    </StudentLayout>
  );
}
'@
Write-Text ".\src\pages\MyProfilePage.tsx" $myProfilePage

# 5. Programme model
$programmeModelPath = ".\src\models\Programme.tsx"
$programmeModel = Read-Text $programmeModelPath
if ($programmeModel -notmatch "imagePath\?: string;") {
  $programmeModel = $programmeModel.Replace(
    "  image?: string;",
    "  image?: string;`r`n  imagePath?: string;"
  )
  Write-Text $programmeModelPath $programmeModel
}

# 6. Create Programme: replace URL input with uploader via targeted edits
$createPath = ".\src\pages\CreateProgrammePage.tsx"
$create = Read-Text $createPath

if ($create -notmatch 'components/upload/FileUpload') {
  $create = $create.Replace(
    'import TutorLayout from "../components/layout/TutorLayout";',
    'import TutorLayout from "../components/layout/TutorLayout";' + "`r`n" + 'import FileUpload from "../components/upload/FileUpload";'
  )
}
if ($create -notmatch 'deleteFileFromStorage') {
  $create = $create.Replace(
    'import { createProgramme } from "../firebase/programmes";',
    'import { createProgramme } from "../firebase/programmes";' + "`r`n" + 'import { deleteFileFromStorage } from "../firebase/storage";'
  )
}
if ($create -notmatch 'const \[imagePath, setImagePath\]') {
  $create = $create.Replace(
    '  const [image, setImage] = useState("");',
    '  const [image, setImage] = useState("");' + "`r`n" + '  const [imagePath, setImagePath] = useState("");'
  )
}
if ($create -notmatch 'imagePath: imagePath \|\| undefined') {
  $create = $create.Replace(
    '        image,',
    '        image,' + "`r`n" + '        imagePath: imagePath || undefined,'
  )
}

$oldImageBlock = @'
          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Image URL
            </label>
            <Input
              placeholder="Optional image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>
'@
$newImageBlock = @'
          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Programme Cover Image
            </label>

            {image && (
              <div className="mb-4 overflow-hidden rounded-2xl border bg-slate-50">
                <img src={image} alt="Programme cover" className="aspect-[16/7] w-full object-cover" />
                <div className="p-3">
                  <button
                    type="button"
                    className="text-sm font-bold text-red-600"
                    onClick={() => {
                      const pending = imagePath;
                      setImage("");
                      setImagePath("");
                      if (pending) {
                        void deleteFileFromStorage(pending).catch((error) =>
                          console.warn("Unsaved programme cover could not be deleted.", error),
                        );
                      }
                    }}
                  >
                    Remove cover
                  </button>
                </div>
              </div>
            )}

            <FileUpload
              folder="images"
              accept="image/jpeg,image/png,image/webp"
              label={image ? "Replace Programme Cover" : "Upload Programme Cover"}
              customMetadata={{ imagePurpose: "programme-cover" }}
              onUploaded={(file) => {
                const previous = imagePath;
                setImage(file.downloadUrl);
                setImagePath(file.filePath);
                if (previous && previous !== file.filePath) {
                  void deleteFileFromStorage(previous).catch((error) =>
                    console.warn("Previous unsaved programme cover could not be deleted.", error),
                  );
                }
              }}
            />
          </div>
'@
if ($create.Contains($oldImageBlock)) {
  $create = $create.Replace($oldImageBlock, $newImageBlock)
} elseif ($create -match 'Image URL') {
  throw "CreateProgrammePage Image URL block was found but did not match the expected structure."
}
Write-Text $createPath $create

# 7. Replace EditProgrammePage with a safe image-aware version
$editProgrammePage = @'
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import FileUpload from "../components/upload/FileUpload";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { getProgrammeById, updateProgramme } from "../firebase/programmes";
import { deleteFileFromStorage } from "../firebase/storage";
import type { ProgrammeLevel } from "../models/Programme";

export default function EditProgrammePage() {
  const { programmeId = "" } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<ProgrammeLevel>("Diploma");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [published, setPublished] = useState(false);
  const [image, setImage] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [originalImagePath, setOriginalImagePath] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getProgrammeById(programmeId)
      .then((p) => {
        if (!p) throw new Error("Programme not found");
        setTitle(p.title);
        setLevel(p.level);
        setFaculty(p.faculty ?? "");
        setDepartment(p.department ?? "");
        setDescription(p.description);
        setDuration(p.duration);
        setPublished(p.published);
        setImage(p.image ?? "");
        setImagePath(p.imagePath ?? "");
        setOriginalImagePath(p.imagePath ?? "");
      })
      .catch((e) => {
        alert(e instanceof Error ? e.message : "Unable to load programme");
        navigate("/tutor/programmes");
      })
      .finally(() => setLoading(false));
  }, [programmeId, navigate]);

  const slug = (v: string) =>
    v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProgramme(programmeId, {
        title,
        slug: slug(title),
        level,
        faculty,
        department,
        description,
        duration,
        published,
        image,
        imagePath: imagePath || undefined,
      });

      if (originalImagePath && originalImagePath !== imagePath) {
        await deleteFileFromStorage(originalImagePath).catch((error) =>
          console.warn("Previous programme cover could not be deleted.", error),
        );
      }

      navigate("/tutor/programmes");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update programme");
    } finally {
      setSaving(false);
    }
  }

  async function cancel() {
    if (imagePath && imagePath !== originalImagePath) {
      await deleteFileFromStorage(imagePath).catch((error) =>
        console.warn("Unsaved programme cover could not be deleted.", error),
      );
    }
    navigate("/tutor/programmes");
  }

  return (
    <TutorLayout title="Edit Programme" subtitle="Update programme details, cover image and publication status.">
      <Card className="mx-auto max-w-3xl">
        {loading ? <p>Loading programme...</p> : (
          <form onSubmit={submit} className="space-y-5">
            <label className="block font-semibold">Programme Title<Input value={title} onChange={e => setTitle(e.target.value)} required /></label>
            <label className="block font-semibold">Level
              <select value={level} onChange={e => setLevel(e.target.value as ProgrammeLevel)} className="mt-2 w-full rounded-xl border px-4 py-3">
                <option>Certificate</option><option>Diploma</option><option>Higher Diploma</option><option>Degree</option><option>Postgraduate Diploma</option><option>Master&apos;s</option><option>PhD</option><option>CPD</option>
              </select>
            </label>
            <label className="block font-semibold">Faculty / School<Input value={faculty} onChange={e => setFaculty(e.target.value)} /></label>
            <label className="block font-semibold">Department<Input value={department} onChange={e => setDepartment(e.target.value)} /></label>
            <label className="block font-semibold">Description<textarea value={description} onChange={e => setDescription(e.target.value)} required className="mt-2 min-h-32 w-full rounded-xl border px-4 py-3" /></label>
            <label className="block font-semibold">Duration<Input value={duration} onChange={e => setDuration(e.target.value)} required /></label>

            <div>
              <label className="mb-2 block font-semibold">Programme Cover Image</label>
              {image && (
                <div className="mb-4 overflow-hidden rounded-2xl border bg-slate-50">
                  <img src={image} alt="Programme cover" className="aspect-[16/7] w-full object-cover" />
                  <div className="p-3">
                    <button
                      type="button"
                      className="text-sm font-bold text-red-600"
                      onClick={() => {
                        const pending = imagePath && imagePath !== originalImagePath ? imagePath : "";
                        setImage("");
                        setImagePath("");
                        if (pending) {
                          void deleteFileFromStorage(pending).catch((error) =>
                            console.warn("Unsaved programme cover could not be deleted.", error),
                          );
                        }
                      }}
                    >
                      Remove cover
                    </button>
                  </div>
                </div>
              )}
              <FileUpload
                folder="images"
                accept="image/jpeg,image/png,image/webp"
                label={image ? "Replace Programme Cover" : "Upload Programme Cover"}
                customMetadata={{ imagePurpose: "programme-cover", programmeId }}
                onUploaded={(file) => {
                  const previousPending = imagePath && imagePath !== originalImagePath ? imagePath : "";
                  setImage(file.downloadUrl);
                  setImagePath(file.filePath);
                  if (previousPending && previousPending !== file.filePath) {
                    void deleteFileFromStorage(previousPending).catch((error) =>
                      console.warn("Previous unsaved programme cover could not be deleted.", error),
                    );
                  }
                }}
              />
            </div>

            <label className="flex items-center gap-3"><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} /> Published and visible to students</label>
            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => void cancel()}>Cancel</Button>
            </div>
          </form>
        )}
      </Card>
    </TutorLayout>
  );
}
'@
Write-Text ".\src\pages\EditProgrammePage.tsx" $editProgrammePage

# 8. AdminProgrammes targeted integration (avoids replacing unrelated admin logic)
$adminPath = ".\src\pages\AdminProgrammesPage.tsx"
$admin = Read-Text $adminPath

if ($admin -notmatch 'components/upload/FileUpload') {
  $admin = $admin.Replace(
    'import AdminLayout from "../components/layout/AdminLayout";',
    'import AdminLayout from "../components/layout/AdminLayout";' + "`r`n" + 'import FileUpload from "../components/upload/FileUpload";'
  )
}
if ($admin -notmatch 'deleteFileFromStorage') {
  $admin = $admin.Replace(
    'import { createProgramme, deleteProgramme, getAllProgrammes, updateProgramme } from "../firebase/programmes";',
    'import { createProgramme, deleteProgramme, getAllProgrammes, updateProgramme } from "../firebase/programmes";' + "`r`n" + 'import { deleteFileFromStorage } from "../firebase/storage";'
  )
}
$admin = $admin.Replace(
  'const blank = { title: "", code: "", level: "Diploma" as ProgrammeLevel, department: "", duration: "", description: "", published: true };',
  'const blank = { title: "", code: "", level: "Diploma" as ProgrammeLevel, department: "", duration: "", description: "", published: true, image: "", imagePath: "" };'
)
if ($admin -notmatch 'originalImagePath') {
  $admin = $admin.Replace(
    '  const [editingId, setEditingId] = useState<string | null>(null);',
    '  const [editingId, setEditingId] = useState<string | null>(null);' + "`r`n" + '  const [originalImagePath, setOriginalImagePath] = useState("");'
  )
}
$admin = $admin.Replace(
  '  function reset() { setForm(blank); setEditingId(null); }',
  '  async function reset() { if (form.imagePath && form.imagePath !== originalImagePath) { await deleteFileFromStorage(form.imagePath).catch((error) => console.warn("Unsaved programme cover could not be deleted.", error)); } setForm(blank); setEditingId(null); setOriginalImagePath(""); }'
)
$admin = $admin.Replace(
  '        await updateProgramme(editingId, { ...form, slug: slugify(form.title) });',
  '        await updateProgramme(editingId, { ...form, imagePath: form.imagePath || undefined, slug: slugify(form.title) }); if (originalImagePath && originalImagePath !== form.imagePath) { await deleteFileFromStorage(originalImagePath).catch((error) => console.warn("Previous programme cover could not be deleted.", error)); }'
)
$admin = $admin.Replace(
  '        await createProgramme({ id: "", ...form, slug: slugify(form.title), faculty: "", createdBy: currentUser.uid, createdAt: new Date(), updatedAt: new Date() });',
  '        await createProgramme({ id: "", ...form, imagePath: form.imagePath || undefined, slug: slugify(form.title), faculty: "", createdBy: currentUser.uid, ownerUserId: currentUser.uid, createdByUid: currentUser.uid, assignedTutorIds: [currentUser.uid], createdAt: new Date(), updatedAt: new Date() });'
)
$admin = $admin.Replace(
  '      reset();',
  '      setForm(blank); setEditingId(null); setOriginalImagePath("");'
)
$oldEditLine = '    setForm({ title: item.title, code: item.code ?? "", level: item.level, department: item.department ?? "", duration: item.duration, description: item.description, published: item.published });'
$newEditLine = '    if (form.imagePath && form.imagePath !== originalImagePath) { void deleteFileFromStorage(form.imagePath).catch((error) => console.warn("Unsaved programme cover could not be deleted.", error)); } setOriginalImagePath(item.imagePath ?? ""); setForm({ title: item.title, code: item.code ?? "", level: item.level, department: item.department ?? "", duration: item.duration, description: item.description, published: item.published, image: item.image ?? "", imagePath: item.imagePath ?? "" });'
$admin = $admin.Replace($oldEditLine, $newEditLine)
$admin = $admin.Replace(
  '      await deleteProgramme(item.id);',
  '      await deleteProgramme(item.id); if (item.imagePath) { await deleteFileFromStorage(item.imagePath).catch((error) => console.warn("Programme cover could not be deleted.", error)); }'
)

if ($admin -notmatch 'Programme Cover Image') {
  $insertAfter = '<Field label="Description"><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"/></Field>'
  $coverBlock = @'
<Field label="Description"><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"/></Field>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Programme Cover Image</label>
            {form.image && <div className="mb-4 overflow-hidden rounded-2xl border bg-slate-50"><img src={form.image} alt="Programme cover" className="aspect-[16/7] w-full object-cover"/><div className="p-3"><button type="button" className="text-sm font-bold text-red-600" onClick={() => { const pending = form.imagePath && form.imagePath !== originalImagePath ? form.imagePath : ""; setForm({ ...form, image: "", imagePath: "" }); if (pending) void deleteFileFromStorage(pending).catch((error) => console.warn("Unsaved programme cover could not be deleted.", error)); }}>Remove cover</button></div></div>}
            <FileUpload folder="images" accept="image/jpeg,image/png,image/webp" label={form.image ? "Replace Programme Cover" : "Upload Programme Cover"} customMetadata={{ imagePurpose: "programme-cover", ...(editingId ? { programmeId: editingId } : {}) }} onUploaded={(file) => { const previousPending = form.imagePath && form.imagePath !== originalImagePath ? form.imagePath : ""; setForm({ ...form, image: file.downloadUrl, imagePath: file.filePath }); if (previousPending && previousPending !== file.filePath) void deleteFileFromStorage(previousPending).catch((error) => console.warn("Previous unsaved programme cover could not be deleted.", error)); }}/>
          </div>
'@
  if (-not $admin.Contains($insertAfter)) {
    throw "AdminProgrammesPage description field was not found for cover uploader insertion."
  }
  $admin = $admin.Replace($insertAfter, $coverBlock)
}
$admin = $admin.Replace('onClick={reset}', 'onClick={() => void reset()}')
Write-Text $adminPath $admin

# 9. Branding types
$tenantDomainPath = ".\src\domains\platform\domain\tenant.ts"
$tenantDomain = Read-Text $tenantDomainPath
if ($tenantDomain -notmatch "readonly logoPath\?: string;") {
  $tenantDomain = $tenantDomain.Replace(
    "  readonly logoUrl?: string;",
    "  readonly logoUrl?: string;`r`n  readonly logoPath?: string;"
  )
  Write-Text $tenantDomainPath $tenantDomain
}

$platformTypesPath = ".\src\domains\platform\domain\platformTypes.ts"
$platformTypes = Read-Text $platformTypesPath
if ($platformTypes -notmatch "logoPath\?: string;") {
  $platformTypes = $platformTypes.Replace(
    "    logoUrl?: string;",
    "    logoUrl?: string;`r`n    logoPath?: string;"
  )
  Write-Text $platformTypesPath $platformTypes
}

$tenantAdminPath = ".\src\firebase\tenantAdmin.ts"
$tenantAdmin = Read-Text $tenantAdminPath
$tenantAdmin = $tenantAdmin.Replace(
  'type Branding = { logoUrl?: string; primaryColor?: string; secondaryColor?: string; accentColor?: string };',
  'type Branding = { logoUrl?: string; logoPath?: string; primaryColor?: string; secondaryColor?: string; accentColor?: string };'
)
Write-Text $tenantAdminPath $tenantAdmin

# 10. Platform branding full replacement
$brandingPage = @'
import { useState, type FormEvent } from "react";

import PlatformCard from "../../components/platform/PlatformCard";
import PlatformLayout from "../../components/platform/PlatformLayout";
import FileUpload from "../../components/upload/FileUpload";
import { PlatformService, platformCollections } from "../../domains/platform";
import { deleteFileFromStorage } from "../../firebase/storage";

export default function PlatformBrandingPage() {
  const [tenantId, setTenantId] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPath, setLogoPath] = useState("");
  const [originalLogoPath, setOriginalLogoPath] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0891b2");
  const [secondaryColor, setSecondaryColor] = useState("#0f172a");
  const [accentColor, setAccentColor] = useState("#7c3aed");
  const [message, setMessage] = useState("");

  async function loadBranding() {
    if (!tenantId.trim()) {
      setMessage("Enter a Tenant ID first.");
      return;
    }

    setMessage("Loading...");

    try {
      if (logoPath && logoPath !== originalLogoPath) {
        await deleteFileFromStorage(logoPath).catch(() => undefined);
      }

      const tenant = await PlatformService.getTenant(tenantId.trim());

      if (!tenant) {
        setMessage("Tenant not found.");
        return;
      }

      const branding = tenant.branding ?? {};
      setLogoUrl(branding.logoUrl ?? "");
      setLogoPath(branding.logoPath ?? "");
      setOriginalLogoPath(branding.logoPath ?? "");
      setPrimaryColor(branding.primaryColor ?? "#0891b2");
      setSecondaryColor(branding.secondaryColor ?? "#0f172a");
      setAccentColor(branding.accentColor ?? "#7c3aed");
      setMessage("Branding loaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load branding.");
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage("Saving...");

    try {
      await PlatformService.save(platformCollections.tenants, tenantId.trim(), {
        branding: {
          logoUrl,
          logoPath,
          primaryColor,
          secondaryColor,
          accentColor,
        },
      });

      if (originalLogoPath && originalLogoPath !== logoPath) {
        await deleteFileFromStorage(originalLogoPath).catch((error) =>
          console.warn("Previous tenant logo could not be deleted.", error),
        );
      }

      setOriginalLogoPath(logoPath);
      setMessage("Branding saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to save branding.");
    }
  }

  return (
    <PlatformLayout title="Branding Engine" subtitle="Configure tenant branding without changing academic data or application code.">
      <div className="grid gap-6 lg:grid-cols-2">
        <PlatformCard title="Brand configuration">
          <form onSubmit={e => void submit(e)} className="space-y-4">
            <label>
              <span className="mb-1 block text-sm font-bold">Tenant ID</span>
              <div className="flex gap-2">
                <input required value={tenantId} onChange={e => setTenantId(e.target.value)} className="w-full rounded-xl border px-3 py-2.5"/>
                <button type="button" onClick={() => void loadBranding()} className="rounded-xl border px-4 py-2.5 font-bold">Load</button>
              </div>
            </label>

            <div>
              <span className="mb-2 block text-sm font-bold">Institution / Tenant Logo</span>
              {logoUrl && (
                <div className="mb-4 flex items-center gap-4 rounded-2xl border bg-slate-50 p-4">
                  <img src={logoUrl} alt="Tenant logo" className="h-24 w-24 rounded-2xl bg-white object-contain"/>
                  <button type="button" className="text-sm font-bold text-red-600" onClick={() => {
                    const pending = logoPath && logoPath !== originalLogoPath ? logoPath : "";
                    setLogoUrl("");
                    setLogoPath("");
                    if (pending) void deleteFileFromStorage(pending).catch((error) => console.warn("Unsaved branding logo could not be deleted.", error));
                  }}>Remove logo</button>
                </div>
              )}

              <FileUpload
                folder="images"
                accept="image/jpeg,image/png,image/webp"
                label={logoUrl ? "Replace Logo" : "Upload Logo"}
                customMetadata={{ imagePurpose: "tenant-branding-logo", brandingTenantId: tenantId.trim() }}
                onUploaded={(file) => {
                  const previousPending = logoPath && logoPath !== originalLogoPath ? logoPath : "";
                  setLogoUrl(file.downloadUrl);
                  setLogoPath(file.filePath);
                  if (previousPending && previousPending !== file.filePath) {
                    void deleteFileFromStorage(previousPending).catch((error) => console.warn("Previous unsaved logo could not be deleted.", error));
                  }
                }}
              />
            </div>

            {[
              ["Primary", primaryColor, setPrimaryColor],
              ["Secondary", secondaryColor, setSecondaryColor],
              ["Accent", accentColor, setAccentColor],
            ].map(([label, value, setter]) => (
              <label key={String(label)} className="flex items-center justify-between rounded-xl border p-3">
                <span className="font-bold">{String(label)} colour</span>
                <input type="color" value={String(value)} onChange={e => (setter as (v: string) => void)(e.target.value)} className="h-10 w-20"/>
              </label>
            ))}

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{message}</span>
              <button className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white">Save branding</button>
            </div>
          </form>
        </PlatformCard>

        <PlatformCard title="Preview">
          <div className="overflow-hidden rounded-3xl border">
            <div className="p-6 text-white" style={{ background: primaryColor }}>
              <div className="flex items-center gap-3">
                {logoUrl ? <img src={logoUrl} alt="Tenant logo" className="h-12 w-12 rounded-xl bg-white object-contain"/> : <div className="h-12 w-12 rounded-xl bg-white/20"/>}
                <div><p className="text-lg font-black">Tenant learning portal</p><p className="text-sm opacity-80">Powered by Medical Elites</p></div>
              </div>
            </div>
            <div className="p-6" style={{ background: secondaryColor, color: "white" }}>
              <button className="rounded-xl px-4 py-2 font-bold text-white" style={{ background: accentColor }}>Continue learning</button>
            </div>
          </div>
        </PlatformCard>
      </div>
    </PlatformLayout>
  );
}
'@
Write-Text ".\src\pages\platform\PlatformBrandingPage.tsx" $brandingPage

# Normalize touched files
$touchedFiles = @(
  ".\src\components\upload\ProfileImageUpload.tsx",
  ".\src\firebase\storage.tsx",
  ".\src\models\User.tsx",
  ".\src\contexts\AuthContext.tsx",
  ".\src\firebase\studentProfile.tsx",
  ".\src\pages\MyProfilePage.tsx",
  ".\src\models\Programme.tsx",
  ".\src\pages\CreateProgrammePage.tsx",
  ".\src\pages\EditProgrammePage.tsx",
  ".\src\pages\AdminProgrammesPage.tsx",
  ".\src\domains\platform\domain\tenant.ts",
  ".\src\domains\platform\domain\platformTypes.ts",
  ".\src\firebase\tenantAdmin.ts",
  ".\src\pages\platform\PlatformBrandingPage.tsx",
  ".\functions\src\index.ts"
)
foreach ($file in $touchedFiles) {
  if (Test-Path $file) { Write-Text $file (Read-Text $file) }
}

Write-Host "`nBatch image-upload patch applied." -ForegroundColor Green

if (-not $SkipValidation) {
  Write-Host "`n===== TYPECHECK =====" -ForegroundColor Cyan
  npm run typecheck
  if ($LASTEXITCODE -ne 0) { throw "Typecheck failed." }

  Write-Host "`n===== FRONTEND BUILD =====" -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { throw "Frontend build failed." }

  Write-Host "`n===== FUNCTIONS BUILD =====" -ForegroundColor Cyan
  Push-Location ".\functions"
  try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Functions build failed." }
  } finally {
    Pop-Location
  }

  Write-Host "`nAll validation checks passed." -ForegroundColor Green
}

Write-Host "`nChanged files:" -ForegroundColor Cyan
git --no-pager status --short

Write-Host "`nNo deployment was performed." -ForegroundColor Yellow
Write-Host 'After successful validation, deploy with:' -ForegroundColor Yellow
Write-Host 'firebase deploy --only "functions:updateOwnStudentProfile,hosting"' -ForegroundColor White
