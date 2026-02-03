"use server";

import { requireAuth } from "@/lib/session";
import { createNote } from "@/lib/notes";
import { redirect } from "next/navigation";
import { z } from "zod";

const noteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  contentJson: z.string().refine(
    (val) => {
      try {
        const parsed = JSON.parse(val);
        return parsed.type === "doc" && Array.isArray(parsed.content);
      } catch {
        return false;
      }
    },
    { message: "Invalid content format" }
  ),
});

export async function createNoteAction(formData: FormData) {
  const user = await requireAuth();

  const title = formData.get("title") as string;
  const contentJson = formData.get("contentJson") as string;

  try {
    const validated = noteSchema.parse({ title, contentJson });

    const note = await createNote(user.id, {
      title: validated.title,
      contentJson: validated.contentJson,
    });

    redirect(`/notes/${note.id}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    throw error;
  }
}
