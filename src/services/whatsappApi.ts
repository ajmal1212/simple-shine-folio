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

  // Updated media upload method that works with CORS restrictions
  async uploadMediaForTemplate(file: File): Promise<string> {
    if (!this.settings) {
      await this.loadSettings();
    }

    if (!this.settings?.phone_number_id) {
      throw new Error('WhatsApp Phone Number ID not configured');
    }

    try {
      console.log('📤 Uploading media file via WhatsApp Cloud API...');
      
      // Use the regular media upload endpoint instead of the resumable upload
      const url = `${this.settings.graph_api_base_url}/${this.settings.api_version}/${this.settings.phone_number_id}/media`;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', this.getMediaType(file.type));
      formData.append('messaging_product', 'whatsapp');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.settings.access_token}`,
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.error) {
        console.error('❌ Media upload error:', result.error);
        throw new Error(`Media upload error: ${result.error.message}`);
      }

      if (result.id) {
        console.log('✅ Media uploaded successfully, media_id:', result.id);
        return result.id;
      } else {
        throw new Error('No media ID returned from WhatsApp API');
      }
    } catch (error) {
      console.error('❌ Media upload failed:', error);
      throw error;
    }
  }

  private getMediaType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  // Remove the old upload session methods as they're causing CORS issues

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

  async sendTemplateMessage(to: string, templateName: string, language: string = 'en_US', parameters?: any[]): Promise<any> {
    if (!this.settings) {
      await this.loadSettings();
    }

    const url = this.getApiUrl('messages');
    const body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
        ...(parameters && { components: parameters })
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
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

  // Updated buildTemplatePayload method to handle media upload properly
  async buildTemplatePayload(template: any): Promise<any> {
    const payload: any = {
      name: template.name,
      category: template.category.toUpperCase(),
      language: template.language,
      components: []
    };

    // Add header component with proper media handling
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
        // For media headers, we need to upload the file first and get media_id
        if (template.header_media_file && template.header_media_file instanceof File) {
          try {
            console.log('📤 Uploading media file for header...');
            const mediaId = await this.uploadMediaForTemplate(template.header_media_file);
            headerComponent.example = {
              header_handle: [mediaId]
            };
            console.log('✅ Media uploaded successfully, media_id:', mediaId);
          } catch (error) {
            console.error('❌ Failed to upload media for header:', error);
            throw new Error(`Failed to upload header media: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else if (template.header_content && !template.header_content.startsWith('blob:')) {
          // If it's already a media URL/ID, use it directly
          headerComponent.example = {
            header_handle: [template.header_content]
          };
        } else {
          // Skip media header if no valid media is provided
          console.warn('⚠️ Skipping media header - no valid media file or URL provided');
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
