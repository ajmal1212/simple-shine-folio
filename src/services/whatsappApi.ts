import { supabase } from '@/integrations/supabase/client';

interface WhatsAppSettings {
  access_token: string;
  graph_api_base_url: string;
  api_version: string;
  phone_number_id: string;
  waba_id: string;
  app_id: string;
}

export class WhatsAppAPI {
  private settings: WhatsAppSettings | null = null;

  async loadSettings(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('access_token, graph_api_base_url, api_version, phone_number_id, waba_id, app_id')
        .single();

      if (error || !data) {
        console.error('Failed to load WhatsApp settings:', error);
        return false;
      }

      this.settings = data;
      return true;
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
      return false;
    }
  }

  // New method for template media upload - Step 1: Create upload session
  async createMediaUploadSession(file: File): Promise<string> {
    if (!this.settings) {
      await this.loadSettings();
    }

    if (!this.settings?.app_id) {
      throw new Error('App ID not configured');
    }

    try {
      console.log('📤 Creating media upload session for template...');
      
      const url = `${this.settings.graph_api_base_url}/${this.settings.api_version}/${this.settings.app_id}/uploads`;
      
      const formData = new FormData();
      formData.append('file_name', file.name);
      formData.append('file_length', file.size.toString());
      formData.append('file_type', file.type);
      formData.append('access_token', this.settings.access_token);

      console.log('Creating upload session:', { 
        name: file.name, 
        size: file.size, 
        type: file.type 
      });

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('Upload session response:', result);
      
      if (result.error) {
        console.error('❌ Upload session creation error:', result.error);
        throw new Error(`Upload session error: ${result.error.message}`);
      }

      if (!result.id) {
        throw new Error('No upload session ID returned');
      }

      console.log('✅ Upload session created successfully, session_id:', result.id);
      return result.id;
    } catch (error) {
      console.error('❌ Upload session creation failed:', error);
      throw error;
    }
  }

  // New method for template media upload - Step 2: Upload file content
  async uploadFileContent(uploadSessionId: string, file: File): Promise<string> {
    if (!this.settings) {
      await this.loadSettings();
    }

    try {
      console.log('📤 Uploading file content to session:', uploadSessionId);
      
      // Use the full upload session URL directly
      const url = uploadSessionId;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.settings.access_token}`,
          'file_offset': '0'
        },
        body: file
      });

      const result = await response.json();
      console.log('File upload response:', result);
      
      if (result.error) {
        console.error('❌ File upload error:', result.error);
        throw new Error(`File upload error: ${result.error.message}`);
      }

      if (!result.h) {
        throw new Error('No media handle returned from file upload');
      }

      console.log('✅ File uploaded successfully, media_handle:', result.h);
      return result.h;
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw error;
    }
  }

  // Combined method for template media upload
  async uploadMediaForTemplate(file: File): Promise<string> {
    try {
      console.log('📤 Starting template media upload process...');
      
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

  private getMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  async syncTemplatesFromWhatsApp(): Promise<any> {
    if (!this.settings) {
      await this.loadSettings();
    }

    if (!this.settings?.waba_id) {
      throw new Error('WhatsApp Business Account ID not configured');
    }

    const url = `${this.settings.graph_api_base_url}/${this.settings.api_version}/${this.settings.waba_id}/message_templates`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.access_token}`,
      }
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`WhatsApp API Error: ${result.error.message}`);
    }

    return result;
  }

  private getApiUrl(endpoint: string): string {
    if (!this.settings) {
      throw new Error('WhatsApp settings not loaded');
    }
    return `${this.settings.graph_api_base_url}/${this.settings.api_version}/${this.settings.phone_number_id}/${endpoint}`;
  }

  private getHeaders(): Record<string, string> {
    if (!this.settings) {
      throw new Error('WhatsApp settings not loaded');
    }
    return {
      'Authorization': `Bearer ${this.settings.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  async uploadMedia(file: File, type: 'image' | 'document' | 'audio' | 'video'): Promise<string> {
    if (!this.settings) {
      await this.loadSettings();
    }

    const url = `${this.settings!.graph_api_base_url}/${this.settings!.api_version}/${this.settings!.phone_number_id}/media`;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('messaging_product', 'whatsapp');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.settings!.access_token}`,
      },
      body: formData
    });

    const result = await response.json();
    if (result.id) {
      return result.id;
    }
    throw new Error('Failed to upload media');
  }

  async sendTextMessage(to: string, text: string): Promise<any> {
    if (!this.settings) {
      await this.loadSettings();
    }

    const url = this.getApiUrl('messages');
    const body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async sendImageMessage(to: string, mediaId: string, caption?: string): Promise<any> {
    if (!this.settings) {
      await this.loadSettings();
    }

    const url = this.getApiUrl('messages');
    const body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'image',
      image: {
        id: mediaId,
        ...(caption && { caption })
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async sendDocumentMessage(to: string, mediaId: string, filename: string, caption?: string): Promise<any> {
    if (!this.settings) {
      await this.loadSettings();
    }

    const url = this.getApiUrl('messages');
    const body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'document',
      document: {
        id: mediaId,
        filename: filename,
        ...(caption && { caption })
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async sendVideoMessage(to: string, mediaId: string, caption?: string): Promise<any> {
    if (!this.settings) {
      await this.loadSettings();
    }

    const url = this.getApiUrl('messages');
    const body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'video',
      video: {
        id: mediaId,
        ...(caption && { caption })
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async sendAudioMessage(to: string, mediaId: string): Promise<any> {
    if (!this.settings) {
      await this.loadSettings();
    }

    const url = this.getApiUrl('messages');
    const body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'audio',
      audio: {
        id: mediaId
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async sendTemplateMessage(to: string, templateName: string, language: string = 'en', headerMediaUrl?: string, variables?: string[]): Promise<any> {
    if (!this.settings) {
      await this.loadSettings();
    }

    const url = this.getApiUrl('messages');
    
    const templateComponents: any[] = [];

    // Add header component with media if provided
    if (headerMediaUrl) {
      templateComponents.push({
        type: "header",
        parameters: [
          {
            type: "image",
            image: {
              link: headerMediaUrl
            }
          }
        ]
      });
    }

    // Add body parameters if variables are provided
    if (variables && variables.length > 0) {
      templateComponents.push({
        type: "body",
        parameters: variables.map(variable => ({
          type: "text",
          text: variable
        }))
      });
    }

    const body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
        ...(templateComponents.length > 0 && { components: templateComponents })
      }
    };

    console.log('Sending template message:', JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    const result = await response.json();
    
    if (result.error) {
      console.error('Template send error:', result.error);
      throw new Error(`Failed to send template: ${result.error.message}`);
    }

    return result;
  }

  async sendTemplate(to: string, templateData: any): Promise<any> {
    if (!this.settings) {
      await this.loadSettings();
    }

    const url = this.getApiUrl('messages');
    const body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'template',
      template: templateData
    };

    console.log('Sending template to:', to);
    console.log('Template data:', JSON.stringify(templateData, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    const result = await response.json();
    console.log('Send template response:', result);
    
    if (result.error) {
      console.error('Template send error:', result.error);
      throw new Error(`Failed to send template: ${result.error.message}`);
    }

    return result;
  }

  async sendButtonMessage(to: string, text: string, buttons: Array<{id: string, title: string}>): Promise<any> {
    if (!this.settings) {
      await this.loadSettings();
    }

    const url = this.getApiUrl('messages');
    const body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text },
        action: {
          buttons: buttons.map(btn => ({
            type: 'reply',
            reply: {
              id: btn.id,
              title: btn.title
            }
          }))
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async createTemplate(template: any): Promise<any> {
    if (!this.settings) {
      await this.loadSettings();
    }

    if (!this.settings?.waba_id) {
      throw new Error('WhatsApp Business Account ID not configured');
    }

    // Use WABA ID for template creation endpoint
    const url = `${this.settings.graph_api_base_url}/${this.settings.api_version}/${this.settings.waba_id}/message_templates`;
    
    console.log('Creating template with payload:', JSON.stringify(template, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(template)
    });

    const result = await response.json();
    console.log('Template creation response:', result);
    
    if (result.error) {
      console.error('WhatsApp API Error Details:', {
        message: result.error.message,
        type: result.error.type,
        code: result.error.code,
        error_subcode: result.error.error_subcode,
        fbtrace_id: result.error.fbtrace_id
      });
      throw new Error(`WhatsApp API Error: ${result.error.message}`);
    }
    
    return result;
  }

  async getTemplates(): Promise<any> {
    if (!this.settings) {
      await this.loadSettings();
    }

    const url = `${this.settings.graph_api_base_url}/${this.settings.api_version}/message_templates`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return await response.json();
  }

  async buildTemplatePayload(template: any): Promise<any> {
    const payload: any = {
      name: template.name,
      category: template.category.toUpperCase(),
      language: template.language,
      components: []
    };

    // Add header component with proper media handling using header handle
    if (template.header_type && template.header_type !== 'NONE' && template.header_content) {
      const headerComponent: any = {
        type: 'HEADER',
        format: template.header_type
      };

      if (template.header_type === 'TEXT') {
        headerComponent.text = template.header_content;
        
        // Check if header has variables
        const headerVariables = template.header_content.match(/\{\{\d+\}\}/g);
        if (headerVariables && headerVariables.length > 0) {
          headerComponent.example = {
            header_text: template.variables?.slice(0, headerVariables.length).map((v: any) => v.sample) || []
          };
        }
      } else if (template.header_type === 'IMAGE' || template.header_type === 'DOCUMENT' || template.header_type === 'VIDEO') {
        // Use the header handle directly if available
        if (template.header_handle || template.header_media_handle) {
          headerComponent.example = {
            header_handle: [template.header_handle || template.header_media_handle]
          };
          console.log('✅ Using header handle for media:', template.header_handle || template.header_media_handle);
        } else if (template.header_media_file && template.header_media_file instanceof File) {
          // Fallback to upload if no handle is available
          try {
            console.log('📤 Uploading media file for header using new flow...');
            const mediaHandle = await this.uploadMediaForTemplate(template.header_media_file);
            
            headerComponent.example = {
              header_handle: [mediaHandle]
            };
            
            console.log('✅ Media uploaded successfully, media_handle:', mediaHandle);
          } catch (error) {
            console.error('❌ Failed to upload media for header:', error);
            throw new Error(`Failed to upload header media: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else {
          console.warn('⚠️ Skipping media header - no valid media handle or file provided');
        }
      }

      // Only add header component if it's properly configured
      if (headerComponent.text || headerComponent.example) {
        payload.components.push(headerComponent);
      }
    }

    // Add body component
    if (template.body_text) {
      const bodyComponent: any = {
        type: 'BODY',
        text: template.body_text
      };

      // Check if body has variables
      const bodyVariables = template.body_text.match(/\{\{\d+\}\}/g);
      if (bodyVariables && bodyVariables.length > 0 && template.variables && template.variables.length > 0) {
        bodyComponent.example = {
          body_text: [template.variables.map((v: any) => v.sample)]
        };
      }

      payload.components.push(bodyComponent);
    }

    // Add footer component
    if (template.footer_text) {
      payload.components.push({
        type: 'FOOTER',
        text: template.footer_text
      });
    }

    // Add buttons component
    if (template.buttons && Array.isArray(template.buttons) && template.buttons.length > 0) {
      const buttonsComponent: any = {
        type: 'BUTTONS',
        buttons: template.buttons.map((btn: any) => {
          const button: any = {
            type: btn.type,
            text: btn.text
          };

          // Add button-specific properties
          switch (btn.type) {
            case 'URL':
              button.url = btn.url;
              // Add URL variable example if it contains variables
              if (btn.url && btn.url.includes('{{')) {
                const urlVariables = btn.url.match(/\{\{\d+\}\}/g);
                if (urlVariables && template.variables) {
                  button.example = [template.variables[urlVariables.length - 1]?.sample || 'example'];
                }
              }
              break;
            case 'PHONE_NUMBER':
              button.phone_number = btn.phone_number;
              break;
            case 'FLOW':
              button.flow_id = btn.flow_id;
              button.flow_cta = btn.flow_cta;
              button.flow_action = btn.flow_action || 'navigate';
              break;
          }

          return button;
        })
      };

      payload.components.push(buttonsComponent);
    }

    return payload;
  }
}

export const whatsappApi = new WhatsAppAPI();
