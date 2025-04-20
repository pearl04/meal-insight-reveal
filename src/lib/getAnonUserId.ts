
import { v4 as uuidv4 } from "uuid";

/**
 * Gets or creates an anonymous user ID stored in localStorage
 * Ensures consistent UUID formatting for both anonymous and authenticated users
 */
export function getAnonUserId(): string {
  const key = "anon_user_id";
  const stored = localStorage.getItem(key);
  
  if (stored) {
    console.log("Using existing anonymous ID from localStorage:", stored);
    // Always return the raw UUID format without prefix for database consistency
    return stored.replace("anon_", "");
  }

  // Generate new UUID
  const newId = uuidv4();
  console.log("Created new anonymous ID:", newId);
  
  // Store with prefix for identification but return clean UUID
  localStorage.setItem(key, `anon_${newId}`);
  return newId;
}

/**
 * Checks if a user ID is from an anonymous user
 */
export function isAnonUser(userId: string): boolean {
  const storedId = localStorage.getItem("anon_user_id");
  
  if (!userId) return false;
  if (!storedId) return false;
  
  // Clean both IDs for comparison
  const cleanStoredId = storedId.replace("anon_", "");
  const cleanUserId = userId.replace("anon_", "");
  
  // Compare the clean versions
  return cleanStoredId === cleanUserId;
}
