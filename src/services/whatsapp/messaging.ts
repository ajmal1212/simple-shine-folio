
import { WhatsAppSettings } from '../whatsappApi';

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
