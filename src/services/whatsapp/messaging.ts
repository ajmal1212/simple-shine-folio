
import { whatsappConfig } from './config';

export const sendWhatsAppMessage = async (to: string, message: any) => {
  await whatsappConfig.loadSettings();
  const settings = whatsappConfig.getSettings();
  
  const response = await fetch(`https://graph.facebook.com/v18.0/${settings?.phone_number_id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings?.access_token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      ...message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return response.json();
};

export const markMessageAsRead = async (messageId: string) => {
  await whatsappConfig.loadSettings();
  const settings = whatsappConfig.getSettings();
  
  const response = await fetch(`https://graph.facebook.com/v18.0/${settings?.phone_number_id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings?.access_token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to mark message as read: ${response.statusText}`);
  }

  return response.json();
};

export const whatsappMessaging = {
  async sendTextMessage(to: string, text: string) {
    return await sendWhatsAppMessage(to, {
      type: 'text',
      text: { body: text }
    });
  },

  async sendImageMessage(to: string, mediaId: string, caption?: string) {
    return await sendWhatsAppMessage(to, {
      type: 'image',
      image: { id: mediaId, caption }
    });
  },

  async sendDocumentMessage(to: string, mediaId: string, filename: string, caption?: string) {
    return await sendWhatsAppMessage(to, {
      type: 'document',
      document: { id: mediaId, filename, caption }
    });
  },

  async sendVideoMessage(to: string, mediaId: string, caption?: string) {
    return await sendWhatsAppMessage(to, {
      type: 'video',
      video: { id: mediaId, caption }
    });
  },

  async sendAudioMessage(to: string, mediaId: string) {
    return await sendWhatsAppMessage(to, {
      type: 'audio',
      audio: { id: mediaId }
    });
  },

  async sendTemplateMessage(to: string, templateName: string, language: string = 'en', headerMediaUrl?: string, variables?: string[]) {
    const template: any = {
      type: 'template',
      template: {
        name: templateName,
        language: { code: language }
      }
    };

    if (variables && variables.length > 0) {
      template.template.components = [
        {
          type: 'body',
          parameters: variables.map(variable => ({ type: 'text', text: variable }))
        }
      ];
    }

    if (headerMediaUrl) {
      if (!template.template.components) {
        template.template.components = [];
      }
      template.template.components.unshift({
        type: 'header',
        parameters: [{ type: 'image', image: { link: headerMediaUrl } }]
      });
    }

    return await sendWhatsAppMessage(to, template);
  },

  async sendTemplate(to: string, templateData: any) {
    return await sendWhatsAppMessage(to, templateData);
  },

  async sendButtonMessage(to: string, text: string, buttons: Array<{id: string, title: string}>) {
    return await sendWhatsAppMessage(to, {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text },
        action: {
          buttons: buttons.map(button => ({
            type: 'reply',
            reply: { id: button.id, title: button.title }
          }))
        }
      }
    });
  }
};
