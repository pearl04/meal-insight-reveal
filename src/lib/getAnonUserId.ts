
import { v4 as uuidv4 } from "uuid";

/**
 * Gets or creates an anonymous user ID stored in localStorage
 * Ensures consistent UUID formatting for both anonymous and authenticated users
 */
export function getAnonUserId(): string {
  const key = "anon_user_id";
  const stored = localStorage.getItem(key);
  
  if (stored) {
    // IMPORTANT: Return the FULL stored value including prefix for consistency!
    console.log("Using existing anonymous ID from localStorage:", stored);
    return stored;
  }

  // Generate new UUID with prefix
  const newId = `anon_${uuidv4()}`;
  console.log("Created new anonymous ID:", newId);
  
  localStorage.setItem(key, newId);
  return newId;
}

/**
 * Checks if a user ID is from an anonymous user
 */
export function isAnonUser(userId: string): boolean {
  if (!userId) return false;
  return userId.startsWith('anon_');
}

/**
 * Extract raw UUID from prefixed ID if needed
 */
export function getRawUserId(userId: string): string {
  if (!userId) return '';
  return userId.startsWith('anon_') ? userId.replace(/^anon_/, '') : userId;
}
