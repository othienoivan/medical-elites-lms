import { Award, BookOpen, Clock, GraduationCap, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";

import type { CourseUnit } from "../../models/CourseUnit";
import Badge from "./Badge";
import Button from "./Button";
import Card from "./Card";

export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tutor: string;
  duration: string;
  modules: number;
  lessons: number;
  level: string;
  rating: number;
  students: string;
  isFeatured: boolean;
  isNew?: boolean;
  certificate: boolean;
};

type CourseCardProps = { course: CourseUnit };

const fallbackImage = "/images/course-placeholder.svg";

export default function CourseCard({ course }: CourseCardProps) {
  const tutorName = course.tutor?.trim() && course.tutor.toLowerCase() !== "unassigned"
    ? course.tutor
    : "Medical Elites Tutor";

  return (
    <Card className="group overflow-hidden p-0 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-44 overflow-hidden bg-blue-100">
        <img
          src={course.image || fallbackImage}
          alt={`${course.title} course unit`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(event) => {
            if (!event.currentTarget.src.endsWith(fallbackImage)) {
              event.currentTarget.src = fallbackImage;
            }
          }}
        />
        <div className="absolute left-4 top-4 flex gap-2">
          {course.isNew && <Badge>New</Badge>}
          {course.isFeatured && <Badge>Featured</Badge>}
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm font-semibold text-blue-700">{course.programmeTitle}</p>
        <h3 className="mt-2 min-h-14 text-xl font-bold text-slate-950">{course.title}</h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{course.description}</p>

        <div className="mt-5 grid gap-3 text-sm text-slate-700">
          <p className="flex items-center gap-2"><GraduationCap size={16} /> Tutor: {tutorName}</p>
          <p className="flex items-center gap-2"><Clock size={16} /> {course.duration || "Self-paced"}</p>
          <p className="flex items-center gap-2"><BookOpen size={16} /> {course.modules || 0} modules • {course.lessons || 0} lessons</p>
          <p className="flex items-center gap-2"><Users size={16} /> {course.students || "0"} learner{String(course.students) === "1" ? "" : "s"}</p>
          <p className="flex items-center gap-2"><Star size={16} className="fill-yellow-400 text-yellow-500" /> {Number(course.rating || 0).toFixed(1)} rating • {course.level}</p>
          {course.certificate && <p className="flex items-center gap-2 text-green-700"><Award size={16} /> Certificate included</p>}
        </div>

        <Link to={`/courses/${encodeURIComponent(course.id)}`}><Button className="mt-6 w-full">View Course Unit</Button></Link>
      </div>
    </Card>
  );
}
