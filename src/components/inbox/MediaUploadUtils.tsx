
export interface MediaPreview {
  file: File;
  type: 'image' | 'document' | 'video' | 'audio';
  preview?: string;
}

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return {
      isValid: false,
      error: "Please select a file smaller than 10MB"
    };
  }

  return { isValid: true };
};

export const createMediaPreview = (file: File): MediaPreview => {
  const fileType = file.type.split('/')[0];
  let mediaType: 'image' | 'document' | 'video' | 'audio' = 'document';

  if (fileType === 'image') {
    mediaType = 'image';
  } else if (fileType === 'video') {
    mediaType = 'video';
  } else if (fileType === 'audio') {
    mediaType = 'audio';
  }

  // Create preview for images and videos
  let preview: string | undefined;
  if (mediaType === 'image' || mediaType === 'video') {
    preview = URL.createObjectURL(file);
  }

  return {
    file,
    type: mediaType,
    preview
  };
};
