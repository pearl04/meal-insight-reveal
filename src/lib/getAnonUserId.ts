
import { v4 as uuidv4 } from "uuid";

/**
 * Gets or creates an anonymous user ID stored in localStorage
 * Ensures consistent UUID formatting for both anonymous and authenticated users
 */
export function getAnonUserId(): string {
  const key = "anon_user_id";
  const stored = localStorage.getItem(key);
  
  if (stored) {
    // Ensure consistent format with authenticated UUIDs
    console.log("Using existing anonymous ID from localStorage:", stored);
    return stored.replace("anon_", ""); // Remove prefix for database queries
  }

  // Generate new UUID without prefix for consistency with auth user IDs
  const newId = uuidv4();
  console.log("Created new anonymous ID:", newId);
  
  // We'll store with anon_ prefix in localStorage for identification
  // but return clean UUID for database operations
  localStorage.setItem(key, `anon_${newId}`);
  return newId;
}

/**
 * Checks if a user ID is from an anonymous user
 */
export function isAnonUser(userId: string): boolean {
  const storedId = localStorage.getItem("anon_user_id");
  // If stored ID matches or starts with anon_
  return userId.startsWith("anon_") || (storedId && storedId.includes(userId));
}
