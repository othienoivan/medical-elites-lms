import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import LessonViewer from "../components/lesson/LessonViewer";
import TutorLayout from "../components/layout/TutorLayout";
import Card from "../components/ui/Card";
import { getLessonById } from "../firebase/lessons";
import type { Lesson } from "../models/Lesson";

export default function LessonPreviewPage() {
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLesson() {
      if (!lessonId) return;

      try {
        const data = await getLessonById(lessonId);

        if (!data) {
          alert("Lesson not found.");
          return;
        }

        setLesson(data);
      } catch (error) {
        console.error(error);
        alert("Failed to load lesson.");
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [lessonId]);

  if (loading) {
    return (
      <TutorLayout
        title="Loading..."
        subtitle="Loading lesson preview"
      >
        <Card>
          <p>Loading lesson...</p>
        </Card>
      </TutorLayout>
    );
  }

  if (!lesson) {
    return (
      <TutorLayout
        title="Lesson not found"
        subtitle=""
      >
        <Card>
          <p>Lesson not found.</p>
        </Card>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout
      title={lesson.title}
      subtitle={lesson.description}
    >
      <Card>
        <LessonViewer blocks={lesson.blocks ?? []} />
      </Card>
    </TutorLayout>
  );
}