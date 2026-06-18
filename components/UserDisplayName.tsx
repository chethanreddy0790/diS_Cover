import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { useStore } from '../store/useStore';
import { getUsername } from '../utils/userUtils';

interface UserDisplayNameProps {
  userId: string;
  fallbackName?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export const UserDisplayName: React.FC<UserDisplayNameProps> = ({ 
  userId, 
  fallbackName, 
  style,
  numberOfLines = 1
}) => {
  const getUserProfile = useStore(state => state.getUserProfile);
  const currentUser = useStore(state => state.currentUser);
  const registeredUsers = useStore(state => state.registeredUsers);
  
  const [displayName, setDisplayName] = useState(fallbackName || 'User');

  useEffect(() => {
    if (!userId) return;

    // 1. Check if it's the current user
    const currentUserId = currentUser?.id || (currentUser as any)?.uid;
    if (userId === currentUserId && currentUser) {
      setDisplayName(getUsername(currentUser));
      return;
    }

    // 2. Check cache in store
    const cachedUser = registeredUsers.find(u => u.id === userId);
    if (cachedUser) {
      setDisplayName(getUsername(cachedUser));
    } else {
      // 3. Fetch from Firestore if not in cache
      getUserProfile(userId).then(profile => {
        if (profile) {
          setDisplayName(getUsername(profile));
        }
      });
    }
  }, [userId, currentUser, registeredUsers]);

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {displayName}
    </Text>
  );
};

export default UserDisplayName;
