import { arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { uploadImage } from './storageUtils';

// ✅ Add Story
export const addStory = async (storyData: {
    media: string;
    caption?: string;
    user: {
        id: string;
        username: string;
        designation: string;
    };
}) => {
    const id = `story_${Date.now()}`;
    
    // Upload image first
    const mediaUrl = await uploadImage(storyData.media);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const newStory = {
        id,
        userId: storyData.user.id,
        username: storyData.user.username,
        userRole: storyData.user.designation,
        media: mediaUrl,
        caption: storyData.caption || '',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        viewerIds: [],
    };

    await setDoc(doc(db, 'stories', id), newStory);
};

// ✅ Add Viewer
export const addStoryViewer = async (storyId: string, user: any) => {
    if (!user?.id) return;

    await updateDoc(doc(db, 'stories', storyId), {
        viewerIds: arrayUnion({
            id: user.id,
            username: user.username,
        }),
    });
};