import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "./storageUtils";

export type ImagePickType = 'post' | 'profile' | 'story' | 'gig' | 'event';

export interface PickedImage {
  uri: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export const pickImageFromLibrary = async (type: ImagePickType = 'post'): Promise<PickedImage | null> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (!permission.granted) {
    throw new Error("Photo library access is needed.");
  }

  let aspect: [number, number] = [1, 1]; // Default to post ratio (square)
  if (type === 'profile') aspect = [1, 1];
  if (type === 'story') aspect = [9, 16];
  if (type === 'gig') aspect = [16, 9];
  if (type === 'event') aspect = [1, 1];

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.9,
    allowsEditing: true,
    aspect,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const metadata: PickedImage = {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    aspectRatio: asset.width / asset.height,
  };

  console.log("[ImagePicker] selected asset:", metadata);
  return metadata;
};

/**
 * Uploads an image using the centralized storage utility (Cloudinary).
 * @param uri Local URI of the image
 * @returns Secure URL from Cloudinary
 */
export const uploadImageAsync = async (uri?: string) => {
  if (!uri) return undefined;
  if (uri.startsWith("http")) return uri;
  
  const cloudUrl = await uploadImage(uri);
  console.log("[Cloudinary] uploaded image url:", cloudUrl);
  return cloudUrl;
};
