
import { v4 as uuidv4 } from "uuid";

/**
 * Gets or creates an anonymous user ID stored in localStorage
 * Prefixes with 'anon_' to distinguish from authenticated users
 */
export function getAnonUserId(): string {
  const key = "anon_user_id";
  const stored = localStorage.getItem(key);
  
  if (stored) {
    console.log("Using existing anonymous ID from localStorage");
    return stored;
  }

  const newId = `anon_${uuidv4()}`;
  console.log("Created new anonymous ID:", newId);
  localStorage.setItem(key, newId);
  return newId;
}
