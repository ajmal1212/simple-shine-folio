
import { whatsappConfig } from './config';

export class WhatsAppMediaUpload {
  
  async createMediaUploadSession(file: File): Promise<string> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings?.app_id) {
      throw new Error('App ID not configured');
    }

    try {
      console.log('📤 Creating media upload session for template...');
      
      const url = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${updatedSettings.app_id}/uploads`;
      
      const formData = new FormData();
      formData.append('file_name', file.name);
      formData.append('file_length', file.size.toString());
      formData.append('file_type', file.type);
      formData.append('access_token', updatedSettings.access_token);

      console.log('Creating upload session with data:', { 
        url,
        name: file.name, 
        size: file.size, 
        type: file.type 
      });

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload session HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload session response:', result);
      
      if (result.error) {
        console.error('❌ Upload session creation error:', result.error);
        throw new Error(`Upload session error: ${result.error.message || JSON.stringify(result.error)}`);
      }

      if (!result.id) {
        throw new Error('No upload session ID returned');
      }

      console.log('✅ Upload session created successfully, session_id:', result.id);
      return result.id;
    } catch (error) {
      console.error('❌ Upload session creation failed:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to connect to WhatsApp API. Please check your internet connection and WhatsApp settings.');
      }
      throw error;
    }
  }

  async uploadFileContent(uploadSessionId: string, file: File): Promise<string> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings) {
      throw new Error('WhatsApp settings not loaded');
    }

    try {
      console.log('📤 Uploading file content to session:', uploadSessionId);
      
      // The uploadSessionId contains the full URL path after the API version
      const uploadUrl = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${uploadSessionId}`;
      
      console.log('Upload URL:', uploadUrl);
      
      // Use proper headers for file upload
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${updatedSettings.access_token}`);
      headers.append('file_offset', '0');

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: headers,
        body: file
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ File upload HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('File upload response:', result);
      
      if (result.error) {
        console.error('❌ File upload error:', result.error);
        throw new Error(`File upload error: ${result.error.message || JSON.stringify(result.error)}`);
      }

      if (!result.h) {
        throw new Error('No media handle returned from file upload');
      }

      console.log('✅ File uploaded successfully, media_handle:', result.h);
      return result.h;
    } catch (error) {
      console.error('❌ File upload failed:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to upload file to WhatsApp API. Please check your internet connection.');
      }
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

      const maxSize = 16 * 1024 * 1024; // 16MB limit
      if (file.size > maxSize) {
        throw new Error('File size exceeds 16MB limit');
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

  private getMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }
}

export const whatsappMediaUpload = new WhatsAppMediaUpload();
