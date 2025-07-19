import React, { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { whatsappApi } from '@/services/whatsappApi';
import { supabase } from '@/integrations/supabase/client';
import { MediaUploadDropdown } from './MediaUploadDropdown';
import { MediaPreviewDialog } from './MediaPreviewDialog';
import { MediaPreview, validateFile, createMediaPreview } from './MediaUploadUtils';

interface MediaUploadProps {
  conversationId: string;
  contactPhoneNumber: string;
  onMessageSent: () => void;
}

export const MediaUpload: React.FC<MediaUploadProps> = ({
  conversationId,
  contactPhoneNumber,
  onMessageSent
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      toast({
        title: "File validation error",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    const preview = createMediaPreview(file);
    setMediaPreview(preview);
    setIsDialogOpen(true);

    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadToSupabase = async (file: File, mediaType: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${mediaType}s/${fileName}`;

    const { error } = await supabase.storage
      .from('template-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('template-media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSendMedia = async () => {
    if (!mediaPreview) return;

    setIsUploading(true);
    try {
      // Create optimistic UI update first
      const tempMessageId = `temp-${Date.now()}`;
      const supabaseUrl = await uploadToSupabase(mediaPreview.file, mediaPreview.type);
      
      // Prepare message content for database
      let messageContent: any = {};
      switch (mediaPreview.type) {
        case 'image':
          messageContent = {
            image: { link: supabaseUrl },
            filename: mediaPreview.file.name,
            ...(caption && { caption })
          };
          break;
        case 'document':
          messageContent = {
            document: { link: supabaseUrl },
            filename: mediaPreview.file.name,
            ...(caption && { caption })
          };
          break;
        case 'video':
          messageContent = {
            video: { link: supabaseUrl },
            filename: mediaPreview.file.name,
            ...(caption && { caption })
          };
          break;
        case 'audio':
          messageContent = {
            audio: { link: supabaseUrl },
            filename: mediaPreview.file.name
          };
          break;
      }

      // Store in database immediately with temporary ID and valid status
      const { error: dbError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          whatsapp_message_id: tempMessageId,
          sender_type: 'user',
          message_type: mediaPreview.type,
          content: messageContent,
          status: 'sent',
          timestamp: new Date().toISOString()
        });

      if (dbError) throw dbError;

      // Close dialog and show immediate feedback
      setIsDialogOpen(false);
      setMediaPreview(null);
      setCaption('');
      onMessageSent();

      toast({
        title: "Success",
        description: `${mediaPreview.type} uploaded successfully`,
      });

      // Send to WhatsApp in background
      try {
        const mediaId = await whatsappApi.uploadMedia(mediaPreview.file, mediaPreview.type);
        
        let response;
        switch (mediaPreview.type) {
          case 'image':
            response = await whatsappApi.sendImageMessage(contactPhoneNumber, mediaId, caption);
            break;
          case 'document':
            response = await whatsappApi.sendDocumentMessage(contactPhoneNumber, mediaId, mediaPreview.file.name, caption);
            break;
          case 'video':
            response = await whatsappApi.sendVideoMessage(contactPhoneNumber, mediaId, caption);
            break;
          case 'audio':
            response = await whatsappApi.sendAudioMessage(contactPhoneNumber, mediaId);
            break;
        }

        // Update the message with actual WhatsApp message ID
        if (response?.messages?.[0]) {
          await supabase
            .from('messages')
            .update({
              whatsapp_message_id: response.messages[0].id,
              status: 'sent'
            })
            .eq('whatsapp_message_id', tempMessageId);

          console.log('✅ Media sent successfully via WhatsApp');
        }
      } catch (whatsappError) {
        console.error('WhatsApp send error:', whatsappError);
        // Keep the message as sent since it's stored locally, just log the WhatsApp error
        console.warn('Media saved locally but failed to send via WhatsApp:', whatsappError);
      }

    } catch (error) {
      console.error('Error sending media:', error);
      toast({
        title: "Error",
        description: `Failed to send ${mediaPreview?.type}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = (accept?: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept || '*/*';
      fileInputRef.current.click();
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setMediaPreview(null);
    setCaption('');
  };

  return (
    <>
      <MediaUploadDropdown onFileTypeSelect={triggerFileInput} />

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
      />

      <MediaPreviewDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        mediaPreview={mediaPreview}
        caption={caption}
        onCaptionChange={setCaption}
        onSend={handleSendMedia}
        isUploading={isUploading}
      />
    </>
  );
};
