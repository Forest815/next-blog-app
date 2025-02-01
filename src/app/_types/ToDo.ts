import { Category } from "./Category";
import { CoverImage } from "./CoverImage";

export type ToDo = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  category?: { id: string; name: string }[];
};
