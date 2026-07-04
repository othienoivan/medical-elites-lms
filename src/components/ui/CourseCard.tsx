import {
  Award,
  BookOpen,
  Clock,
  GraduationCap,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { CourseUnit } from "../../models/CourseUnit";
import Badge from "./Badge";
import Button from "./Button";
import Card from "./Card";

type CourseCardProps = {
  course: CourseUnit;
};

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="group overflow-hidden p-0 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-44 overflow-hidden bg-blue-100">
        <img
          src={course.image}
          alt={course.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src =
              "https://placehold.co/800x500/1D4ED8/FFFFFF?text=Medical+Elites";
          }}
        />

        <div className="absolute left-4 top-4 flex gap-2">
          {course.isNew && <Badge>New</Badge>}
          {course.isFeatured && <Badge>Featured</Badge>}
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm font-semibold text-blue-700">
          {course.programmeTitle}
        </p>

        <h3 className="mt-2 min-h-14 text-xl font-bold text-slate-950">
          {course.title}
        </h3>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
          {course.description}
        </p>

        <div className="mt-5 grid gap-3 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <GraduationCap size={16} />
            Tutor: {course.tutor}
          </p>

          <p className="flex items-center gap-2">
            <Clock size={16} />
            {course.duration}
          </p>

          <p className="flex items-center gap-2">
            <BookOpen size={16} />
            {course.modules} modules • {course.lessons} lessons
          </p>

          <p className="flex items-center gap-2">
            <Users size={16} />
            {course.students}
          </p>

          <p className="flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />
            {course.rating.toFixed(1)} rating • {course.level}
          </p>

          {course.certificate && (
            <p className="flex items-center gap-2 text-green-700">
              <Award size={16} />
              Certificate included
            </p>
          )}
        </div>

        <Link to={`/courses/${course.slug}`}>
          <Button className="mt-6 w-full">View Course Unit</Button>
        </Link>
      </div>
    </Card>
  );
}