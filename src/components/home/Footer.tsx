export default function Footer() {
  return (
    <footer className="border-t bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-2xl font-bold">Medical Elites</h3>
          <p className="mt-2 text-sm text-slate-400">
            Learn • Practice • Excel
          </p>
        </div>

        <div>
          <h4 className="font-bold">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>Courses</li>
            <li>Student Dashboard</li>
            <li>Certificates</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>medicalelites.org</li>
            <li>admin@medicalelites.org</li>
            <li>Uganda</li>
          </ul>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-7xl text-sm text-slate-500">
        © {new Date().getFullYear()} Medical Elites. All rights reserved.
      </p>
    </footer>
  );
}