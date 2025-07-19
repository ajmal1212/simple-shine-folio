
import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppSettings {
  access_token: string;
  graph_api_base_url: string;
  api_version: string;
  phone_number_id: string;
  waba_id: string;
  app_id: string;
}

export class WhatsAppConfig {
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

  getSettings(): WhatsAppSettings | null {
    return this.settings;
  }

  getApiUrl(endpoint: string): string {
    if (!this.settings) {
      throw new Error('WhatsApp settings not loaded');
    }
    return `${this.settings.graph_api_base_url}/${this.settings.api_version}/${this.settings.phone_number_id}/${endpoint}`;
  }

  getHeaders(): Record<string, string> {
    if (!this.settings) {
      throw new Error('WhatsApp settings not loaded');
    }
    return {
      'Authorization': `Bearer ${this.settings.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  getWabaUrl(endpoint: string = ''): string {
    if (!this.settings?.waba_id) {
      throw new Error('WhatsApp Business Account ID not configured');
    }
    return `${this.settings.graph_api_base_url}/${this.settings.api_version}/${this.settings.waba_id}${endpoint ? '/' + endpoint : ''}`;
  }
}

export const whatsappConfig = new WhatsAppConfig();
