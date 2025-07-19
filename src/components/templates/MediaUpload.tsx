
import React, { useState } from 'react';
import { Upload, X, Image, File, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MediaUploadProps {
  onUpload: (url: string) => void;
  mediaType: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
}

export const MediaUpload: React.FC<MediaUploadProps> = ({ onUpload, mediaType }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = {
      IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      VIDEO: ['video/mp4', 'video/avi', 'video/mov', 'video/webm'],
      DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    if (!validTypes[mediaType].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please select a valid ${mediaType.toLowerCase()} file`,
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `template-media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('template-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('template-media')
        .getPublicUrl(filePath);

      setUploadedUrl(publicUrl);
      onUpload(publicUrl);

      toast({
        title: "Success",
        description: "Media uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload media file",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeUpload = () => {
    setUploadedUrl('');
    onUpload('');
  };

  const getIcon = () => {
    switch (mediaType) {
      case 'IMAGE': return <Image className="w-4 h-4" />;
      case 'VIDEO': return <Video className="w-4 h-4" />;
      case 'DOCUMENT': return <File className="w-4 h-4" />;
    }
  };

  const getAccept = () => {
    switch (mediaType) {
      case 'IMAGE': return 'image/*';
      case 'VIDEO': return 'video/*';
      case 'DOCUMENT': return '.pdf,.doc,.docx';
    }
  };

  return (
    <div className="space-y-2">
      {!uploadedUrl ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <input
            type="file"
            id={`media-upload-${mediaType}`}
            accept={getAccept()}
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor={`media-upload-${mediaType}`}
            className="flex flex-col items-center cursor-pointer"
          >
            {getIcon()}
            <span className="text-sm text-gray-600 mt-2">
              {uploading ? 'Uploading...' : `Upload ${mediaType.toLowerCase()}`}
            </span>
            <span className="text-xs text-gray-400">Max 10MB</span>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <span className="text-sm text-green-600">Media uploaded</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeUpload}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
