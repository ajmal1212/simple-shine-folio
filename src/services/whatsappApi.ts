
import { whatsappConfig } from './whatsapp/config';
import { whatsappMediaUpload } from './whatsapp/mediaUpload';
import { whatsappMessaging } from './whatsapp/messaging';
import { whatsappTemplates } from './whatsapp/templates';

export interface WhatsAppSettings {
  phone_number_id: string;
  access_token: string;
  app_id: string;
  waba_id: string;
  graph_api_base_url: string;
  api_version: string;
}

export class WhatsAppAPI {
  
  async loadSettings(): Promise<boolean> {
    return await whatsappConfig.loadSettings();
  }

  // Media upload methods
  async createMediaUploadSession(file: File): Promise<string> {
    return await whatsappMediaUpload.createMediaUploadSession(file);
  }

  async uploadFileContent(uploadSessionId: string, file: File): Promise<string> {
    return await whatsappMediaUpload.uploadFileContent(uploadSessionId, file);
  }

  async uploadMediaForTemplate(file: File): Promise<string> {
    return await whatsappMediaUpload.uploadMediaForTemplate(file);
  }

  async uploadMedia(file: File, type: 'image' | 'document' | 'audio' | 'video'): Promise<string> {
    return await whatsappMediaUpload.uploadMedia(file, type);
  }

  async resumeUpload(uploadSessionId: string): Promise<number> {
    return await whatsappMediaUpload.resumeUpload(uploadSessionId);
  }

  async resumeFileUpload(uploadSessionId: string, file: File, fileOffset: number): Promise<string> {
    return await whatsappMediaUpload.resumeFileUpload(uploadSessionId, file, fileOffset);
  }

  // Template methods
  async syncTemplatesFromWhatsApp(): Promise<any> {
    return await whatsappTemplates.syncTemplatesFromWhatsApp();
  }

  async createTemplate(template: any): Promise<any> {
    return await whatsappTemplates.createTemplate(template);
  }

  async getTemplates(): Promise<any> {
    return await whatsappTemplates.getTemplates();
  }

  async buildTemplatePayload(template: any): Promise<any> {
    return await whatsappTemplates.buildTemplatePayload(template);
  }

  // Messaging methods
  async sendTextMessage(to: string, text: string): Promise<any> {
    return await whatsappMessaging.sendTextMessage(to, text);
  }

  async sendImageMessage(to: string, mediaId: string, caption?: string): Promise<any> {
    return await whatsappMessaging.sendImageMessage(to, mediaId, caption);
  }

  async sendDocumentMessage(to: string, mediaId: string, filename: string, caption?: string): Promise<any> {
    return await whatsappMessaging.sendDocumentMessage(to, mediaId, filename, caption);
  }

  async sendVideoMessage(to: string, mediaId: string, caption?: string): Promise<any> {
    return await whatsappMessaging.sendVideoMessage(to, mediaId, caption);
  }

  async sendAudioMessage(to: string, mediaId: string): Promise<any> {
    return await whatsappMessaging.sendAudioMessage(to, mediaId);
  }

  async sendTemplateMessage(to: string, templateName: string, language: string = 'en', headerMediaUrl?: string, variables?: string[]): Promise<any> {
    return await whatsappMessaging.sendTemplateMessage(to, templateName, language, headerMediaUrl, variables);
  }

  async sendTemplate(to: string, templateData: any): Promise<any> {
    return await whatsappMessaging.sendTemplate(to, templateData);
  }

  async sendButtonMessage(to: string, text: string, buttons: Array<{id: string, title: string}>): Promise<any> {
    return await whatsappMessaging.sendButtonMessage(to, text, buttons);
  }
}

export const whatsappApi = new WhatsAppAPI();
