import { User } from '../store/useStore';

/**
 * Gets the correct avatar URL for a user, falling back to null if none found.
 * Avoids stock images.
 */
export const getUserAvatar = (user: any): string | null => {
  const avatar = user?.avatar || user?.photoURL || user?.profilePic || user?.imageUrl || user?.image;
  
  // Filter out known stock images or placeholders
  if (typeof avatar === 'string' && (
    avatar.includes('pravatar.cc') || 
    avatar.includes('ui-avatars.com') || 
    avatar.includes('placeholder')
  )) {
    return null;
  }
  
  return avatar || null;
};

/**
 * Gets the display name for a user based on priority order:
 * username || name || displayName || email username before @ || "Explorer"
 */
export const getUsername = (user: any): string => {
  // Priority 1: Full Name / Display Name
  const fullName = user?.fullName || user?.name || user?.displayName;
  if (typeof fullName === 'string' && fullName.trim().length > 0) return fullName.trim();

  // Priority 2: Username
  const username = user?.username;
  if (typeof username === 'string' && username.trim().length > 0) return username.trim();
  
  // Priority 3: Email Prefix
  const email = user?.email;
  if (email && typeof email === 'string') {
    return email.split('@')[0];
  }
  
  // Final Fallback
  return "User";
};
