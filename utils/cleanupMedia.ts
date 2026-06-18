import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Identifies documents with local file URIs (file://) and replaces them with a placeholder.
 * This resolves visibility issues for old data that was not uploaded to Firebase Storage.
 */
export const cleanupInvalidMedia = async (collectionName: 'events' | 'stories') => {
  try {
    console.log(`[Cleanup] Starting cleanup for ${collectionName}...`);
    const querySnapshot = await getDocs(collection(db, collectionName));
    let count = 0;

    for (const document of querySnapshot.docs) {
      const data = document.data();
      const media = data.image || data.media;

      if (media && typeof media === 'string' && media.startsWith('file://')) {
        console.log(`[Cleanup] Found invalid media in ${collectionName}/${document.id}: ${media}`);
        
        const updateField = data.image !== undefined ? 'image' : 'media';
        
        await setDoc(doc(db, collectionName, document.id), {
          [updateField]: 'https://via.placeholder.com/150'
        }, { merge: true });
        
        count++;
      }
    }

    console.log(`[Cleanup] Finished. Updated ${count} documents in ${collectionName}.`);
    return count;
  } catch (error) {
    console.error(`[Cleanup] Error during ${collectionName} cleanup:`, error);
    throw error;
  }
};
