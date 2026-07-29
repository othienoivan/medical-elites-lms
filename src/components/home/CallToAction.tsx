import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../ui/Button";
import Container from "../ui/Container";
import Section from "../ui/Section";

export default function CallToAction() {
  return (
    <Section className="bg-blue-700 text-white">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Ready to Become an Elite Healthcare Professional?
          </h2>

          <p className="mt-6 text-xl leading-8 text-blue-100">
            Learn through structured lessons, interactive quizzes,
            mastery-based progression, and certificates that demonstrate your
            competence.
          </p>

          <div className="mt-10">
            <Link to="/register">
              <Button className="bg-white text-blue-700 hover:bg-blue-50">
                Create Free Account
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}