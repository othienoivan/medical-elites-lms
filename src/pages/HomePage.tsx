import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import Stats from "../components/home/Stats";
import FeaturedCourses from "../components/home/FeaturedCourses";
import WhyChooseUs from "../components/home/WhyChooseUs";
import Testimonials from "../components/home/Testimonials";
import Footer from "../components/home/Footer";
import Statistics from "../components/home/Statistics";
import LearningJourney from "../components/home/LearningJourney";
import CallToAction from "../components/home/CallToAction";


export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <Hero />
      <Stats />
      <FeaturedCourses />
         <Statistics />
             <LearningJourney />
            <WhyChooseUs />
      <Testimonials />
      <CallToAction />
      <Footer />
    </main>
  );
}