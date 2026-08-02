import { courseModules } from "../data/modules";
import { createModule } from "./modules";

export async function seedModules() {
  for (const module of courseModules) {
    await createModule(module);
  }

  console.log("Modules seeded successfully.");
}