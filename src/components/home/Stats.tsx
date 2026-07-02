const stats = [
  { value: "5,000+", label: "Target Learners" },
  { value: "120+", label: "Planned Courses" },
  { value: "80%", label: "Pass Requirement" },
  { value: "24/7", label: "Online Access" },
];

export default function Stats() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 p-6 text-center">
            <p className="text-3xl font-extrabold text-blue-700">{stat.value}</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}