import { v4 as uuidv4 } from "uuid";

export function getAnonUserId(): string {
  const stored = localStorage.getItem("anon_user_id");
  if (stored) return stored;

  const newId = uuidv4();
  localStorage.setItem("anon_user_id", newId);
  return newId;
}
