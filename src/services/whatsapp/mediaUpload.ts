
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
      
      // Use query parameters as specified in the documentation
      const url = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${updatedSettings.app_id}/uploads?file_name=${encodeURIComponent(file.name)}&file_length=${file.size}&file_type=${encodeURIComponent(file.type)}&access_token=${updatedSettings.access_token}`;

      console.log('Creating upload session with URL:', url);

      const response = await fetch(url, {
        method: 'POST'
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
      
      // Construct the upload URL exactly as specified in the documentation
      const uploadUrl = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${uploadSessionId}`;
      
      console.log('Upload URL:', uploadUrl);
      
      // Use exact headers as specified in the documentation
      const headers = new Headers();
      headers.append('Authorization', `OAuth ${updatedSettings.access_token}`); // Use OAuth prefix, not Bearer
      headers.append('file_offset', '0');

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: headers,
        body: file // Send the file directly as binary data
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

  async resumeUpload(uploadSessionId: string): Promise<number> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings) {
      throw new Error('WhatsApp settings not loaded');
    }

    try {
      console.log('🔄 Checking upload session status:', uploadSessionId);
      
      const url = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${uploadSessionId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `OAuth ${updatedSettings.access_token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Resume upload HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Resume upload response:', result);
      
      if (result.error) {
        console.error('❌ Resume upload error:', result.error);
        throw new Error(`Resume upload error: ${result.error.message || JSON.stringify(result.error)}`);
      }

      const fileOffset = parseInt(result.file_offset || '0');
      console.log('✅ Upload can be resumed from offset:', fileOffset);
      return fileOffset;
    } catch (error) {
      console.error('❌ Resume upload failed:', error);
      throw error;
    }
  }

  async resumeFileUpload(uploadSessionId: string, file: File, fileOffset: number): Promise<string> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings) {
      throw new Error('WhatsApp settings not loaded');
    }

    try {
      console.log('📤 Resuming file upload from offset:', fileOffset);
      
      const uploadUrl = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${uploadSessionId}`;
      
      // Create a slice of the file starting from the offset
      const fileSlice = file.slice(fileOffset);
      
      const headers = new Headers();
      headers.append('Authorization', `OAuth ${updatedSettings.access_token}`);
      headers.append('file_offset', fileOffset.toString());

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: headers,
        body: fileSlice
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Resume file upload HTTP error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Resume file upload response:', result);
      
      if (result.error) {
        console.error('❌ Resume file upload error:', result.error);
        throw new Error(`Resume file upload error: ${result.error.message || JSON.stringify(result.error)}`);
      }

      if (!result.h) {
        throw new Error('No media handle returned from resumed file upload');
      }

      console.log('✅ File upload resumed successfully, media_handle:', result.h);
      return result.h;
    } catch (error) {
      console.error('❌ Resume file upload failed:', error);
      throw error;
    }
  }
}

export const whatsappMediaUpload = new WhatsAppMediaUpload();
