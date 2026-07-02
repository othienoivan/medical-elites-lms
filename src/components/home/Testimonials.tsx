const testimonials = [
  {
    quote: "The module structure and quizzes make revision more focused.",
    name: "Clinical Medicine Student",
  },
  {
    quote: "Medical Elites makes difficult medical topics easier to study step by step.",
    name: "Health Sciences Learner",
  },
  {
    quote: "The 80% rule pushes learners to master content, not just complete it.",
    name: "Medical Tutor",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-6 py-16">
      <p className="font-semibold text-blue-700">Testimonials</p>
      <h3 className="mt-2 text-3xl font-bold text-slate-950">What learners will experience</h3>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {testimonials.map((item) => (
          <div key={item.name} className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-yellow-500">★★★★★</p>
            <p className="mt-4 leading-7 text-slate-600">“{item.quote}”</p>
            <p className="mt-4 font-bold text-slate-900">— {item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}