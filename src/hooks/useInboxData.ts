import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
import { whatsappApi } from '@/services/whatsappApi';
import { Conversation, Message, Template } from '@/types/inbox';

export const useInboxData = () => {
  // const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const loadConversations = async () => {
    try {
      console.log('📋 Loading conversations...');
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          contact:contacts(*),
          last_message:messages!conversations_last_message_id_fkey(*)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading conversations:', error);
        throw error;
      }
      
      console.log('✅ Loaded conversations:', data?.length || 0, data);
      setConversations(data || []);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      console.log('📨 Loading messages for conversation:', conversationId);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('❌ Error loading messages:', error);
        throw error;
      }
      
      console.log('✅ Loaded messages:', data?.length || 0, 'messages for conversation:', conversationId);
      console.log('📨 Messages data:', data);
      setMessages(data || []);

      // Mark messages as read
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);

      if (updateError) console.error('❌ Error marking as read:', updateError);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('id, name, body_text, language, header_type, header_content, footer_text, buttons, variables')
        .eq('status', 'APPROVED')
        .order('name');

      if (error) throw error;
      
      // Transform the data to match our Template interface
      const transformedTemplates = (data || []).map(template => ({
        ...template,
        buttons: Array.isArray(template.buttons) ? template.buttons : 
                template.buttons ? JSON.parse(template.buttons as string) : [],
        variables: Array.isArray(template.variables) ? template.variables : 
                  template.variables ? JSON.parse(template.variables as string) : []
      }));
      
      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (!conversation) return;

      console.log('📤 Sending message:', messageText);

      // Send via WhatsApp API
      const response = await whatsappApi.sendTextMessage(
        conversation.contact.phone_number,
        messageText
      );

      if (response.messages && response.messages[0]) {
        console.log('✅ Message sent via WhatsApp API:', response.messages[0].id);
        
        // Store in database
        const { error } = await supabase
          .from('messages')
          .insert({
            conversation_id: selectedConversation,
            whatsapp_message_id: response.messages[0].id,
            sender_type: 'user',
            message_type: 'text',
            content: { text: messageText },
            status: 'sent',
            timestamp: new Date().toISOString()
          });

        if (error) throw error;

        console.log('✅ Message stored in database');
        
        // Refresh data immediately
        loadMessages(selectedConversation);
        loadConversations();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  const sendTemplate = async (templateId: string) => {
    if (!templateId || !selectedConversation) return;

    try {
      const conversation = conversations.find(c => c.id === selectedConversation);
      const template = templates.find(t => t.id === templateId);
      
      if (!conversation || !template) return;

      // Send template via WhatsApp API
      const response = await whatsappApi.sendTemplateMessage(
        conversation.contact.phone_number,
        template.name,
        template.language
      );

      if (response.messages && response.messages[0]) {
        // Store in database
        const { error } = await supabase
          .from('messages')
          .insert({
            conversation_id: selectedConversation,
            whatsapp_message_id: response.messages[0].id,
            sender_type: 'user',
            message_type: 'template',
            content: { template_name: template.name, body_text: template.body_text },
            status: 'sent',
            timestamp: new Date().toISOString()
          });

        if (error) throw error;

        loadMessages(selectedConversation);
        loadConversations();
      } else {
        throw new Error('Failed to send template');
      }
    } catch (error) {
      console.error('Error sending template:', error);
    }
  };

  const sendTemplateWithVariables = async (templateId: string, variables?: string[], headerMedia?: File) => {
    if (!templateId || !selectedConversation) return;

    try {
      const conversation = conversations.find(c => c.id === selectedConversation);
      const template = templates.find(t => t.id === templateId);
      
      if (!conversation || !template) return;

      console.log('📤 Sending template with variables:', { templateId, variables, hasMedia: !!headerMedia });

      let headerMediaUrl: string | undefined;
      
      // Upload header media if provided
      if (headerMedia) {
        try {
          const mediaId = await whatsappApi.uploadMedia(headerMedia, 
            headerMedia.type.startsWith('image/') ? 'image' :
            headerMedia.type.startsWith('video/') ? 'video' : 'document'
          );
          
          // For template messages, we need to use the media URL format
          headerMediaUrl = `https://graph.facebook.com/v21.0/${mediaId}`;
        } catch (uploadError) {
          console.error('Failed to upload header media:', uploadError);
          throw new Error('Failed to upload header media');
        }
      }

      // Send template via WhatsApp API with variables and media
      const response = await whatsappApi.sendTemplateMessage(
        conversation.contact.phone_number,
        template.name,
        template.language,
        headerMediaUrl,
        variables
      );

      if (response.messages && response.messages[0]) {
        // Store in database
        const { error } = await supabase
          .from('messages')
          .insert({
            conversation_id: selectedConversation,
            whatsapp_message_id: response.messages[0].id,
            sender_type: 'user',
            message_type: 'template',
            content: { 
              template_name: template.name, 
              body_text: template.body_text,
              variables: variables,
              header_media_url: headerMediaUrl
            },
            status: 'sent',
            timestamp: new Date().toISOString()
          });

        if (error) throw error;

        console.log('✅ Template message sent and stored');
        loadMessages(selectedConversation);
        loadConversations();
      } else {
        throw new Error('Failed to send template');
      }
    } catch (error) {
      console.error('❌ Error sending template with variables:', error);
      throw error;
    }
  };

  return {
    conversations,
    messages,
    templates,
    selectedConversation,
    setSelectedConversation,
    loadConversations,
    loadMessages,
    loadTemplates,
    sendMessage,
    sendTemplate,
    sendTemplateWithVariables,
  };
};
