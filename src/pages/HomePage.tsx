import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import Stats from "../components/home/Stats";
import FeaturedCourses from "../components/home/FeaturedCourses";
import WhyChooseUS from "../components/home/WhyChooseUS";
import Testimonials from "../components/home/Testimonials";
import Statistics from "../components/home/Statistics";
import LearningJourney from "../components/home/LearningJourney";
import CallToAction from "../components/home/CallToAction";
import Footer from "../components/layout/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <Hero />
      <Stats />
      <FeaturedCourses />
         <Statistics />
             <LearningJourney />
            <WhyChooseUS />
      <Testimonials />
      <CallToAction />
      <Footer />
    </main>
  );
}