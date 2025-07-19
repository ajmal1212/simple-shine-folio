
import { whatsappConfig } from './config';

export class WhatsAppMessaging {

  async sendTextMessage(to: string, text: string): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const url = whatsappConfig.getApiUrl('messages');
    const body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: text }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: whatsappConfig.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async sendImageMessage(to: string, mediaId: string, caption?: string): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const url = whatsappConfig.getApiUrl('messages');
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
      headers: whatsappConfig.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async sendDocumentMessage(to: string, mediaId: string, filename: string, caption?: string): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const url = whatsappConfig.getApiUrl('messages');
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
      headers: whatsappConfig.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async sendVideoMessage(to: string, mediaId: string, caption?: string): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const url = whatsappConfig.getApiUrl('messages');
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
      headers: whatsappConfig.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async sendAudioMessage(to: string, mediaId: string): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const url = whatsappConfig.getApiUrl('messages');
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
      headers: whatsappConfig.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async sendButtonMessage(to: string, text: string, buttons: Array<{id: string, title: string}>): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const url = whatsappConfig.getApiUrl('messages');
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
      headers: whatsappConfig.getHeaders(),
      body: JSON.stringify(body)
    });

    return await response.json();
  }

  async sendTemplateMessage(to: string, templateName: string, language: string = 'en', headerMediaUrl?: string, variables?: string[]): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const url = whatsappConfig.getApiUrl('messages');
    
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
      headers: whatsappConfig.getHeaders(),
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
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const url = whatsappConfig.getApiUrl('messages');
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
      headers: whatsappConfig.getHeaders(),
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
}

export const whatsappMessaging = new WhatsAppMessaging();
