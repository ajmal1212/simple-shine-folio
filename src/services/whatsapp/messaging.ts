
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
