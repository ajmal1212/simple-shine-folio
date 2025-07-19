
import { whatsappConfig } from './config';
import { whatsappMediaUpload } from './mediaUpload';

export class WhatsAppTemplates {

  async syncTemplatesFromWhatsApp(): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const url = whatsappConfig.getWabaUrl('message_templates');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${whatsappConfig.getSettings()?.access_token}`,
      }
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`WhatsApp API Error: ${result.error.message}`);
    }

    return result;
  }

  async createTemplate(template: any): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const url = whatsappConfig.getWabaUrl('message_templates');
    
    console.log('Creating template with payload:', JSON.stringify(template, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: whatsappConfig.getHeaders(),
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
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const url = `${settings.graph_api_base_url}/${settings.api_version}/message_templates`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: whatsappConfig.getHeaders()
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
            const mediaHandle = await whatsappMediaUpload.uploadMediaForTemplate(template.header_media_file);
            
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

export const whatsappTemplates = new WhatsAppTemplates();
