import { useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";
import StudentLayout from "../components/layout/StudentLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { updateOwnStudentProfile } from "../firebase/studentProfile";
import useAuth from "../hooks/useAuth";

export default function MyProfilePage() {
  const { currentUser, userProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const profile = userProfile as Record<string, unknown> | null;
    setFullName(String(profile?.fullName ?? ""));
    setPhoneNumber(String(profile?.phoneNumber ?? profile?.phone ?? ""));
    setAddress(String(profile?.address ?? ""));
    setEmergencyContact(String(profile?.emergencyContact ?? ""));
  }, [userProfile]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!currentUser) return;
    setSaving(true); setMessage("");
    try {
      await updateOwnStudentProfile({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        emergencyContact: emergencyContact.trim(),
      });
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error); setMessage("Profile could not be updated. Please try again.");
    } finally { setSaving(false); }
  }

  return <StudentLayout><main className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-10">
    <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-7 text-white">
      <UserRound size={42}/><h1 className="mt-3 text-3xl font-bold">My Profile</h1>
      <p className="mt-2 text-blue-100">Review and update your personal and contact information.</p>
    </section>
    <Card className="mt-6"><form onSubmit={save} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="font-semibold">Full name<Input value={fullName} onChange={e=>setFullName(e.target.value)} required/></label>
        <label className="font-semibold">Email<Input value={currentUser?.email ?? ""} disabled/></label>
        <label className="font-semibold">Telephone<Input value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)}/></label>
        <label className="font-semibold">Emergency contact<Input value={emergencyContact} onChange={e=>setEmergencyContact(e.target.value)}/></label>
      </div>
      <label className="block font-semibold">Address<Input value={address} onChange={e=>setAddress(e.target.value)}/></label>
      <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700 md:grid-cols-2">
        <p><strong>Programme:</strong> {(userProfile as any)?.programmeTitle || "Not assigned"}</p>
        <p><strong>Registration number:</strong> {(userProfile as any)?.registrationNumber || "Not assigned"}</p>
        <p><strong>Year of study:</strong> {(userProfile as any)?.yearOfStudy || "Not assigned"}</p>
        <p><strong>Semester:</strong> {(userProfile as any)?.semester || "Not assigned"}</p>
      </div>
      {message && <p className="rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">{message}</p>}
      <Button type="submit" disabled={saving}><Save size={18}/>{saving ? "Saving..." : "Save Profile"}</Button>
    </form></Card>
  </main></StudentLayout>;
}
