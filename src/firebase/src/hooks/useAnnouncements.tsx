import { useCallback, useEffect, useState } from "react";

import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "../firebase/announcements";
import type { Announcement } from "../models/Announcement";

type NewAnnouncement = Omit<Announcement, "id" | "createdAt" | "updatedAt">;

export default function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setAnnouncements(await getAnnouncements());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  async function create(data: NewAnnouncement) {
    await createAnnouncement(data);
    await loadAnnouncements();
  }

  async function update(id: string, data: Partial<Announcement>) {
    await updateAnnouncement(id, data);
    await loadAnnouncements();
  }

  async function remove(id: string) {
    await deleteAnnouncement(id);
    await loadAnnouncements();
  }

  return { announcements, loading, reload: loadAnnouncements, create, update, remove };
}
