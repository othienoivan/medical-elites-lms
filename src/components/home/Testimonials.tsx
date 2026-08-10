import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { testimonials as fallbackTestimonials } from "../../data/testimonials";
import usePublicTestimonials from "../../hooks/usePublicTestimonials";
import Card from "../ui/Card";
import Container from "../ui/Container";
import Heading from "../ui/Heading";
import Section from "../ui/Section";

export default function Testimonials() {
  const { testimonials } = usePublicTestimonials();
  const rows = testimonials.length > 0 ? testimonials.slice(0, 6) : fallbackTestimonials;
  return (
    <Section className="bg-white">
      <Container>
        <Heading subtitle="Testimonials" title="Experiences from the Medical Elites community" align="center" />
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((testimonial) => (
            <Card key={testimonial.id} className="flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-xl">
              <img src={testimonial.image || "/images/course-placeholder.svg"} alt={testimonial.name} onError={(e) => { e.currentTarget.src = "/images/course-placeholder.svg"; }} className="h-24 w-24 rounded-full border-4 border-blue-100 object-cover" />
              <div className="mt-5 flex">{Array.from({ length: testimonial.rating }).map((_, index) => <Star key={index} size={18} className="fill-yellow-400 text-yellow-400" />)}</div>
              <p className="mt-5 italic leading-7 text-slate-700">“{testimonial.review}”</p>
              <h3 className="mt-6 text-lg font-bold text-slate-900">{testimonial.name}</h3>
              <p className="text-sm text-slate-600">{testimonial.school}</p>
            </Card>
          ))}
        </div>
        <div className="mt-10 text-center"><Link to="/testimonials" className="font-bold text-blue-700 hover:text-blue-800">Read or write a testimonial →</Link></div>
      </Container>
    </Section>
  );
}
