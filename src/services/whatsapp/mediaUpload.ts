import { whatsappConfig } from './config';
import { supabase } from '@/integrations/supabase/client';

export class WhatsAppMediaUpload {
  
  async createMediaUploadSession(file: File): Promise<string> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings?.app_id) {
      throw new Error('App ID not configured. Please check your WhatsApp settings.');
    }

    try {
      console.log('📤 Creating media upload session via Supabase Edge Function...');
      console.log('File details:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });
      
      const { data, error } = await supabase.functions.invoke('whatsapp-media-upload', {
        body: {
          action: 'createUploadSession',
          fileName: file.name,
          fileLength: file.size,
          fileType: file.type
        }
      });

      if (error) {
        console.error('❌ Upload session creation error:', error);
        throw new Error(`Upload session error: ${error.message}`);
      }

      if (!data?.uploadSessionId) {
        throw new Error('No upload session ID returned from API');
      }

      console.log('✅ Upload session created successfully, session_id:', data.uploadSessionId);
      return data.uploadSessionId;
    } catch (error) {
      console.error('❌ Upload session creation failed:', error);
      throw error;
    }
  }

  async uploadFileContent(uploadSessionId: string, file: File): Promise<string> {
    try {
      console.log('📤 Uploading file content via Supabase Edge Function...');
      
      // Convert file to base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('whatsapp-media-upload', {
        body: {
          action: 'uploadFileContent',
          uploadSessionId,
          fileData
        }
      });

      if (error) {
        console.error('❌ File upload error:', error);
        throw new Error(`File upload error: ${error.message}`);
      }

      if (!data?.mediaHandle) {
        throw new Error('No media handle returned from API');
      }

      console.log('✅ File uploaded successfully, media_handle:', data.mediaHandle);
      return data.mediaHandle;
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw error;
    }
  }

  async uploadMediaForTemplate(file: File): Promise<string> {
    try {
      console.log('📤 Starting template media upload process...');
      
      // Validate file before upload
      if (!file) {
        throw new Error('No file provided for upload');
      }

      // Updated file size limit to match Meta's 100MB limit
      const maxSize = 100 * 1024 * 1024; // 100MB limit (Meta's actual limit)
      if (file.size > maxSize) {
        throw new Error('File size exceeds 100MB limit');
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not supported. Allowed types: ${allowedTypes.join(', ')}`);
      }
      
      // Step 1: Create upload session
      const uploadSessionId = await this.createMediaUploadSession(file);
      
      // Step 2: Upload file content and get media handle
      const mediaHandle = await this.uploadFileContent(uploadSessionId, file);
      
      console.log('✅ Template media upload completed, media_handle:', mediaHandle);
      return mediaHandle;
    } catch (error) {
      console.error('❌ Template media upload failed:', error);
      throw error;
    }
  }

  async uploadMedia(file: File, type: 'image' | 'document' | 'audio' | 'video'): Promise<string> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings) {
      throw new Error('WhatsApp settings not loaded');
    }

    const url = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${updatedSettings.phone_number_id}/media`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('messaging_product', 'whatsapp');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${updatedSettings.access_token}`,
      },
      body: formData
    });

    const result = await response.json();
    if (result.id) {
      return result.id;
    }
    throw new Error('Failed to upload media');
  }

  async resumeUpload(uploadSessionId: string): Promise<number> {
    try {
      console.log('🔄 Checking upload session status via Supabase Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('whatsapp-media-upload', {
        body: {
          action: 'resumeUpload',
          uploadSessionId
        }
      });

      if (error) {
        console.error('❌ Resume upload error:', error);
        throw new Error(`Resume upload error: ${error.message}`);
      }

      const fileOffset = data?.fileOffset || 0;
      console.log('✅ Upload can be resumed from offset:', fileOffset);
      return fileOffset;
    } catch (error) {
      console.error('❌ Resume upload failed:', error);
      throw error;
    }
  }

  async resumeFileUpload(uploadSessionId: string, file: File, fileOffset: number): Promise<string> {
    try {
      console.log('📤 Resuming file upload from offset:', fileOffset);
      
      // Create a slice of the file starting from the offset
      const fileSlice = file.slice(fileOffset);
      
      // Convert file slice to base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(fileSlice);
      });

      const { data, error } = await supabase.functions.invoke('whatsapp-media-upload', {
        body: {
          action: 'uploadFileContent',
          uploadSessionId,
          fileData,
          fileOffset
        }
      });

      if (error) {
        console.error('❌ Resume file upload error:', error);
        throw new Error(`Resume file upload error: ${error.message}`);
      }

      if (!data?.mediaHandle) {
        throw new Error('No media handle returned from resumed file upload');
      }

      console.log('✅ File upload resumed successfully, media_handle:', data.mediaHandle);
      return data.mediaHandle;
    } catch (error) {
      console.error('❌ Resume file upload failed:', error);
      throw error;
    }
  }
}

export const whatsappMediaUpload = new WhatsAppMediaUpload();
