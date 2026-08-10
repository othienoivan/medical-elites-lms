import { Quote, Star } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { testimonials as fallbackTestimonials } from "../data/testimonials";
import { submitTestimonial } from "../firebase/testimonials";
import useAuth from "../hooks/useAuth";
import usePublicTestimonials from "../hooks/usePublicTestimonials";

export default function TestimonialsPage() {
  const { currentUser, userProfile } = useAuth();
  const { testimonials } = usePublicTestimonials();
  const rows = testimonials.length > 0 ? testimonials : fallbackTestimonials;
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [context, setContext] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const defaultContext = useMemo(() => userProfile?.institutionName || (userProfile?.role ? `${userProfile.role[0].toUpperCase()}${userProfile.role.slice(1)} — Medical Elites` : "Medical Elites user"), [userProfile]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!currentUser || !review.trim()) return;
    try {
      setSaving(true);
      await submitTestimonial({
        authorUid: currentUser.uid,
        name: userProfile?.fullName || currentUser.displayName || "Medical Elites user",
        school: context.trim() || defaultContext,
        image: userProfile?.profilePhoto || currentUser.photoURL || "",
        rating,
        review,
      });
      setReview(""); setRating(5); setContext(""); setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit testimonial:", error);
      alert("Your testimonial could not be submitted. Please try again.");
    } finally { setSaving(false); }
  }

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-blue-800 to-indigo-800 text-white">
        <Container className="py-16 text-center sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-100">Testimonials</p>
          <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Experiences from our learning community</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-blue-50">Feedback helps Medical Elites improve learning, teaching and institutional support.</p>
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((testimonial) => (
            <Card key={testimonial.id} className="relative">
              <Quote className="absolute right-6 top-6 text-blue-100" size={48} />
              <div className="flex gap-1">{Array.from({ length: testimonial.rating }).map((_, index) => <Star key={index} className="fill-yellow-400 text-yellow-400" size={18} />)}</div>
              <p className="mt-6 text-lg italic leading-8 text-slate-700">“{testimonial.review}”</p>
              <div className="mt-6 border-t border-slate-200 pt-5"><p className="font-bold text-slate-950">{testimonial.name}</p><p className="text-sm text-slate-600">{testimonial.school}</p></div>
            </Card>
          ))}
        </div>

        <Card className="mt-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold text-slate-950">Share your experience</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-700">Registered Medical Elites users can submit a testimonial. Submissions are reviewed before public publication.</p>
            {submitted && <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">Thank you. Your testimonial has been submitted for review.</div>}
            {!currentUser ? (
              <div className="mt-7 text-center"><Link to="/login" className="inline-flex rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800">Sign in to write a testimonial</Link></div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <label className="block"><span className="mb-2 block font-semibold text-slate-800">Rating</span><select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="w-full rounded-xl border border-slate-300 px-4 py-3">{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>)}</select></label>
                <label className="block"><span className="mb-2 block font-semibold text-slate-800">Institution / programme (optional)</span><input value={context} onChange={(event) => setContext(event.target.value)} placeholder={defaultContext} className="w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
                <label className="block"><span className="mb-2 block font-semibold text-slate-800">Your testimonial</span><textarea value={review} onChange={(event) => setReview(event.target.value)} required minLength={20} maxLength={1500} rows={6} className="w-full rounded-xl border border-slate-300 px-4 py-3" placeholder="Tell us about your experience with Medical Elites..." /></label>
                <Button type="submit" disabled={saving || review.trim().length < 20}>{saving ? "Submitting..." : "Submit Testimonial"}</Button>
              </form>
            )}
            <p className="mt-5 text-center text-sm text-slate-500">Need help? Email admin@medicalelites.org.</p>
          </div>
        </Card>
      </Container>
    </PublicLayout>
  );
}
