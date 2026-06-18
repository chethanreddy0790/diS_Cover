console.log("[StorageUtils] CLOUDINARY FILE LOADED");

/**
 * Uploads an image from a local URI to Cloudinary and returns the secure URL.
 * @param imageUri The local URI of the image to upload.
 * @returns The global Cloudinary secure_url.
 */
export const uploadImage = async (imageUri: string): Promise<string> => {
  try {
    if (!imageUri) {
      throw new Error("No image URI provided");
    }

    // If URI is already a URL, return it
    if (imageUri.startsWith("http")) {
      return imageUri;
    }

    // DEBUG LOGS FOR ENV VARS
    console.log("ENV CHECK");
    console.log("CLOUD_NAME:", process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME);
    console.log("UPLOAD_PRESET:", process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

    // Hardcoded fallback as per user request if env vars are undefined
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dwl7rtcct";
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "discover_unsigned";

    if (!cloudName || !uploadPreset) {
      console.error("[Cloudinary] Missing configuration:", { cloudName, uploadPreset });
      throw new Error("Cloudinary configuration missing.");
    }

    console.log("[Cloudinary] Upload started for:", imageUri);

    const formData = new FormData();

    // In React Native, we need to provide name and type for the file in FormData
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: `upload-${Date.now()}.jpg`,
    } as any);

    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("[Cloudinary Upload Error]", result);
      throw new Error(result?.error?.message || "Cloudinary upload failed");
    }

    console.log("[Cloudinary] Upload success:", result.secure_url);

    return result.secure_url;
  } catch (error: any) {
    console.error("[Cloudinary] Image upload failed:", error);
    throw error;
  }
};