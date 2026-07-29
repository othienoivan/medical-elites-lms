import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import Stats from "../components/home/Stats";
import FeaturedCourses from "../components/home/FeaturedCourses";
import WhyChooseUS from "../components/home/WhyChooseUS";
import Testimonials from "../components/home/Testimonials";
import LearningJourney from "../components/home/LearningJourney";
import CallToAction from "../components/home/CallToAction";
import Footer from "../components/layout/Footer";
import Partners from "../components/home/Partners";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main id="main-content">
        <Hero />
        <Stats />
        <FeaturedCourses />
        <WhyChooseUS />
        <LearningJourney />
        <Partners />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
