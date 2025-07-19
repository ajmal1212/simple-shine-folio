
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConversationsList } from '@/components/inbox/ConversationsList';
import { ChatArea } from '@/components/inbox/ChatArea';
import { useInboxData } from '@/hooks/useInboxData';
import { useInboxRealtime } from '@/hooks/useInboxRealtime';

const Inbox = () => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
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
  } = useInboxData();

  useInboxRealtime({
    selectedConversation,
    loadConversations,
    loadMessages,
  });

  useEffect(() => {
    loadConversations();
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      console.log('📱 Loading messages for conversation:', selectedConversation);
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleSendTemplate = async () => {
    await sendTemplate(selectedTemplate);
    setIsTemplateDialogOpen(false);
    setSelectedTemplate('');
  };

  const handleMessageSent = () => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      loadConversations();
    }
  };

  const selectedContact = conversations.find(c => c.id === selectedConversation)?.contact;

  return (
    <DashboardLayout>
      <div className="h-full flex bg-gray-50">
        <ConversationsList
          conversations={conversations}
          selectedConversation={selectedConversation}
          searchQuery={searchQuery}
          onConversationSelect={setSelectedConversation}
          onSearchChange={setSearchQuery}
        />

        <ChatArea
          selectedContact={selectedContact}
          messages={messages}
          templates={templates}
          newMessage={newMessage}
          selectedTemplate={selectedTemplate}
          isTemplateDialogOpen={isTemplateDialogOpen}
          selectedConversation={selectedConversation}
          onNewMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
          onTemplateSelect={setSelectedTemplate}
          onSendTemplate={handleSendTemplate}
          onTemplateDialogOpenChange={setIsTemplateDialogOpen}
          onMessageSent={handleMessageSent}
        />
      </div>
    </DashboardLayout>
  );
};

export default Inbox;
