import { useEffect, useState } from "react";
import { getApprovedTestimonials, type PublicTestimonial } from "../firebase/testimonials";

export default function usePublicTestimonials() {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void getApprovedTestimonials()
      .then((rows) => { if (active) setTestimonials(rows); })
      .catch((error) => { console.error("Failed to load public testimonials:", error); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { testimonials, loading };
}
