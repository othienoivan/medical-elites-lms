import { Star } from "lucide-react";

import { testimonials } from "../../data/testimonials";
import Card from "../ui/Card";
import Container from "../ui/Container";
import Heading from "../ui/Heading";
import Section from "../ui/Section";

export default function Testimonials() {
  return (
    <Section className="bg-white">
      <Container>
        <Heading
          subtitle="Testimonials"
          title="Trusted by future healthcare professionals"
          align="center"
        />

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={testimonial.image}
                alt={testimonial.name}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/120x120/2563EB/FFFFFF?text=ME";
                }}
                className="h-24 w-24 rounded-full border-4 border-blue-100 object-cover"
              />

              <div className="mt-5 flex">
                {Array.from({ length: testimonial.rating }).map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="mt-5 italic leading-7 text-slate-600">
                "{testimonial.review}"
              </p>

              <h3 className="mt-6 text-lg font-bold text-slate-900">
                {testimonial.name}
              </h3>

              <p className="text-sm text-slate-500">
                {testimonial.school}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}