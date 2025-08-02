
import { whatsappConfig } from './config';

export interface WhatsAppSettings {
  phone_number_id: string;
  access_token: string;
  app_id: string;
  waba_id: string;
  graph_api_base_url: string;
  api_version: string;
}

export class WhatsAppMessaging {
  
  async sendTextMessage(to: string, text: string): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings) {
      throw new Error('WhatsApp settings not loaded');
    }

    const url = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${updatedSettings.phone_number_id}/messages`;
    
    const messagePayload = {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: text }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${updatedSettings.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`WhatsApp API Error: ${result.error.message}`);
    }
    
    return result;
  }

  async sendImageMessage(to: string, mediaId: string, caption?: string): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings) {
      throw new Error('WhatsApp settings not loaded');
    }

    const url = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${updatedSettings.phone_number_id}/messages`;
    
    const messagePayload: any = {
      messaging_product: "whatsapp",
      to: to,
      type: "image",
      image: { id: mediaId }
    };

    if (caption) {
      messagePayload.image.caption = caption;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${updatedSettings.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`WhatsApp API Error: ${result.error.message}`);
    }
    
    return result;
  }

  async sendDocumentMessage(to: string, mediaId: string, filename: string, caption?: string): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings) {
      throw new Error('WhatsApp settings not loaded');
    }

    const url = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${updatedSettings.phone_number_id}/messages`;
    
    const messagePayload: any = {
      messaging_product: "whatsapp",
      to: to,
      type: "document",
      document: { 
        id: mediaId,
        filename: filename
      }
    };

    if (caption) {
      messagePayload.document.caption = caption;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${updatedSettings.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`WhatsApp API Error: ${result.error.message}`);
    }
    
    return result;
  }

  async sendVideoMessage(to: string, mediaId: string, caption?: string): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings) {
      throw new Error('WhatsApp settings not loaded');
    }

    const url = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${updatedSettings.phone_number_id}/messages`;
    
    const messagePayload: any = {
      messaging_product: "whatsapp",
      to: to,
      type: "video",
      video: { id: mediaId }
    };

    if (caption) {
      messagePayload.video.caption = caption;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${updatedSettings.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`WhatsApp API Error: ${result.error.message}`);
    }
    
    return result;
  }

  async sendAudioMessage(to: string, mediaId: string): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings) {
      throw new Error('WhatsApp settings not loaded');
    }

    const url = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${updatedSettings.phone_number_id}/messages`;
    
    const messagePayload = {
      messaging_product: "whatsapp",
      to: to,
      type: "audio",
      audio: { id: mediaId }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${updatedSettings.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`WhatsApp API Error: ${result.error.message}`);
    }
    
    return result;
  }

  async sendTemplateMessage(to: string, templateName: string, language: string = 'en', headerMediaUrl?: string, variables?: string[]): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings) {
      throw new Error('WhatsApp settings not loaded');
    }

    console.log('Sending template message:', { to, templateName, language, variables });
    
    const url = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${updatedSettings.phone_number_id}/messages`;
    
    const messagePayload: any = {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components: []
      }
    };

    // Add header component if media exists
    if (headerMediaUrl) {
      messagePayload.template.components.push({
        type: "header",
        parameters: [{
          type: "image",
          image: {
            link: headerMediaUrl
          }
        }]
      });
    }

    // Add body component if variables exist
    if (variables && variables.length > 0) {
      messagePayload.template.components.push({
        type: "body",
        parameters: variables.map(variable => ({
          type: "text",
          text: variable
        }))
      });
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${updatedSettings.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Template message sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending template message:', error);
      throw error;
    }
  }

  async sendTemplate(to: string, templateData: any): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings) {
      throw new Error('WhatsApp settings not loaded');
    }

    const url = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${updatedSettings.phone_number_id}/messages`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${updatedSettings.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateData)
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`WhatsApp API Error: ${result.error.message}`);
    }
    
    return result;
  }

  async sendButtonMessage(to: string, text: string, buttons: Array<{id: string, title: string}>): Promise<any> {
    const settings = whatsappConfig.getSettings();
    if (!settings) {
      await whatsappConfig.loadSettings();
    }

    const updatedSettings = whatsappConfig.getSettings();
    if (!updatedSettings) {
      throw new Error('WhatsApp settings not loaded');
    }

    const url = `${updatedSettings.graph_api_base_url}/${updatedSettings.api_version}/${updatedSettings.phone_number_id}/messages`;
    
    const messagePayload = {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: text
        },
        action: {
          buttons: buttons.map((btn, index) => ({
            type: "reply",
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
      headers: {
        'Authorization': `Bearer ${updatedSettings.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`WhatsApp API Error: ${result.error.message}`);
    }
    
    return result;
  }
}

export const whatsappMessaging = new WhatsAppMessaging();

// Legacy function for backwards compatibility
export const sendTemplateMessage = async (
  phoneNumber: string,
  templateName: string,
  settings: WhatsAppSettings,
  variables: string[] = [],
  headerMedia?: File
) => {
  console.log('Sending template message:', { phoneNumber, templateName, variables });
  
  const url = `https://graph.facebook.com/v17.0/${settings.phone_number_id}/messages`;
  
  const messagePayload: any = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components: []
    }
  };

  // Add header component if media exists
  if (headerMedia) {
    messagePayload.template.components.push({
      type: "header",
      parameters: []
    });
  }

  // Add body component if variables exist
  if (variables.length > 0) {
    messagePayload.template.components.push({
      type: "body",
      parameters: variables.map(variable => ({
        type: "text",
        text: variable
      }))
    });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Template message sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Error sending template message:', error);
    throw error;
  }
};
