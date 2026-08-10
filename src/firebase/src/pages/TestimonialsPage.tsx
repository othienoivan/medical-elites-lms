import { Quote, Star } from "lucide-react";

import PublicLayout from "../components/layout/PublicLayout";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { testimonials } from "../data/testimonials";

export default function TestimonialsPage() {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-blue-800 to-indigo-800 text-white">
        <Container className="py-20 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-200">Testimonials</p>
          <h1 className="mt-4 text-5xl font-extrabold">Experiences from our learning community</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-blue-100">
            Feedback helps us improve Medical Elites and better support tutors, students, and institutions.
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative">
              <Quote className="absolute right-6 top-6 text-blue-100" size={48} />
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, index) => (
                  <Star key={index} className="fill-yellow-400 text-yellow-400" size={18} />
                ))}
              </div>
              <p className="mt-6 text-lg italic leading-8 text-slate-600">“{testimonial.review}”</p>
              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="font-bold text-slate-950">{testimonial.name}</p>
                <p className="text-sm text-slate-500">{testimonial.school}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-slate-950">Share your experience</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Testimonial submissions will be reviewed before they are published. Send your feedback to admin@medicalelites.org.
          </p>
        </Card>
      </Container>
    </PublicLayout>
  );
}
