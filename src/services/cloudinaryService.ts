/**
 * Uploads an image file to Cloudinary using an unsigned upload preset.
 * Enforces Cloudinary uploads and throws an error if it fails or if credentials are missing.
 */
export const uploadImage = async (
  file: File
): Promise<{ url: string; source: "cloudinary" | "base64" }> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // Enforce Cloudinary configuration
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary configuration is missing. Please configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your environment variables."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      errData.error?.message || "Failed to upload image to Cloudinary"
    );
  }

  const data = await res.json();
  return { url: data.secure_url, source: "cloudinary" };
};
