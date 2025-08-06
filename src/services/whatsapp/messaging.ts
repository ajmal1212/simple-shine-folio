
import { whatsappConfig } from './config';

class WhatsAppMessaging {
  private async makeRequest(endpoint: string, data: any) {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      throw new Error('WhatsApp settings not loaded. Please call loadSettings() first.');
    }

    if (!settings.access_token || !settings.phone_number_id) {
      throw new Error('WhatsApp settings not configured');
    }

    const response = await fetch(`${settings.graph_api_base_url}/${settings.api_version}/${settings.phone_number_id}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API Error:', errorData);
      throw new Error(`WhatsApp API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  async sendTextMessage(to: string, text: string) {
    const data = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''), // Remove non-digits
      type: 'text',
      text: {
        body: text
      }
    };

    return this.makeRequest('messages', data);
  }

  async sendImageMessage(to: string, mediaId: string, caption?: string) {
    const data = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'image',
      image: {
        id: mediaId,
        ...(caption && { caption })
      }
    };

    return this.makeRequest('messages', data);
  }

  async sendDocumentMessage(to: string, mediaId: string, filename: string, caption?: string) {
    const data = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'document',
      document: {
        id: mediaId,
        filename,
        ...(caption && { caption })
      }
    };

    return this.makeRequest('messages', data);
  }

  async sendVideoMessage(to: string, mediaId: string, caption?: string) {
    const data = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'video',
      video: {
        id: mediaId,
        ...(caption && { caption })
      }
    };

    return this.makeRequest('messages', data);
  }

  async sendAudioMessage(to: string, mediaId: string) {
    const data = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'audio',
      audio: {
        id: mediaId
      }
    };

    return this.makeRequest('messages', data);
  }

  async sendTemplateMessage(to: string, templateName: string, language: string = 'en', headerMediaUrl?: string, variables?: string[]) {
    console.log('📤 Sending individual template message:', { to, templateName, language, variables, headerMediaUrl });
    
    const templatePayload: any = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: language
        }
      }
    };

    // Add components if we have variables or header media
    if (variables?.length || headerMediaUrl) {
      templatePayload.template.components = [];

      // Add header component if media is provided
      if (headerMediaUrl) {
        let headerType = 'image'; // default
        if (headerMediaUrl.includes('.mp4') || headerMediaUrl.includes('video')) {
          headerType = 'video';
        } else if (headerMediaUrl.includes('.pdf') || headerMediaUrl.includes('document')) {
          headerType = 'document';
        }

        templatePayload.template.components.push({
          type: 'header',
          parameters: [{
            type: headerType,
            [headerType]: {
              link: headerMediaUrl
            }
          }]
        });
      }

      // Add body component if variables are provided
      if (variables?.length) {
        templatePayload.template.components.push({
          type: 'body',
          parameters: variables.map(variable => ({
            type: 'text',
            text: variable
          }))
        });
      }
    }

    console.log('📤 Template payload:', JSON.stringify(templatePayload, null, 2));
    return this.makeRequest('messages', templatePayload);
  }

  async sendTemplate(to: string, templateData: any) {
    return this.sendTemplateMessage(
      to,
      templateData.name,
      templateData.language || 'en',
      templateData.headerMediaUrl,
      templateData.variables
    );
  }

  async sendButtonMessage(to: string, text: string, buttons: Array<{id: string, title: string}>) {
    const data = {
      messaging_product: 'whatsapp',
      to: to.replace(/\D/g, ''),
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: text
        },
        action: {
          buttons: buttons.slice(0, 3).map((button, index) => ({
            type: 'reply',
            reply: {
              id: button.id,
              title: button.title.substring(0, 20) // WhatsApp limit
            }
          }))
        }
      }
    };

    return this.makeRequest('messages', data);
  }
}

export { WhatsAppMessaging };
export const whatsappMessaging = new WhatsAppMessaging();
