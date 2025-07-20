
import React, { useEffect, useRef, useState } from 'react';
import { FileText, Archive, Tag, Send, MessageSquare } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MediaUpload } from '@/components/inbox/MediaUpload';
import { MessageStatusIcon } from '@/components/inbox/MessageStatusIcon';
import { EmojiPickerComponent } from '@/components/inbox/EmojiPicker';
import { TemplateMessageDialog } from '@/components/inbox/TemplateMessageDialog';
import { Contact, Message, Template } from '@/types/inbox';
import { formatMessageContent } from '@/utils/messageUtils';

interface ChatAreaProps {
  selectedContact: Contact | undefined;
  messages: Message[];
  templates: Template[];
  newMessage: string;
  selectedTemplate: string;
  isTemplateDialogOpen: boolean;
  selectedConversation: string | null;
  onNewMessageChange: (message: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  onTemplateSelect: (templateId: string) => void;
  onSendTemplate: () => void;
  onTemplateDialogOpenChange: (open: boolean) => void;
  onMessageSent: () => void;
  onSendTemplateWithVariables: (templateId: string, variables?: string[], headerMedia?: File) => Promise<void>;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedContact,
  messages,
  templates,
  newMessage,
  selectedTemplate,
  isTemplateDialogOpen,
  selectedConversation,
  onNewMessageChange,
  onSendMessage,
  onTemplateSelect,
  onSendTemplate,
  onTemplateDialogOpenChange,
  onMessageSent,
  onSendTemplateWithVariables,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120; // 5 lines approximately
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [newMessage]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) {
        onSendMessage(e as any);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    await onSendMessage(e);
    // Scroll to bottom after sending message
    setTimeout(scrollToBottom, 100);
  };

  const handleEmojiClick = (emoji: string) => {
    onNewMessageChange(newMessage + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSendTemplateMessage = async (templateId: string, variables?: string[], headerMedia?: File) => {
    if (onSendTemplateWithVariables) {
      await onSendTemplateWithVariables(templateId, variables, headerMedia);
      onMessageSent();
    }
  };

  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <MessageSquare className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
          <p className="text-gray-500 max-w-sm">Choose a conversation from the sidebar to start messaging and experience seamless communication</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {selectedContact.name?.[0]?.toUpperCase() || selectedContact.phone_number[0]}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{selectedContact.name || selectedContact.phone_number}</h3>
              <p className="text-sm text-gray-500">{selectedContact.phone_number}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onTemplateDialogOpenChange(true)}
            >
              <FileText className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <Archive className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Tag className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-2 bg-gradient-to-b from-gray-50/50 to-white space-y-1">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-2 py-1 rounded-2xl shadow-sm ${
                    message.sender_type === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white border border-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <div className="text-sm leading-relaxed">{formatMessageContent(message)}</div>
                  <div className={`flex items-center justify-end mt-1 space-x-1 ${
                    message.sender_type === 'user' ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    <span className="text-xs">
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <MessageStatusIcon message={message} />
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="flex space-x-3 items-end">
          <MediaUpload
            conversationId={selectedConversation!}
            contactPhoneNumber={selectedContact.phone_number}
            onMessageSent={onMessageSent}
          />
          <EmojiPickerComponent onEmojiClick={handleEmojiClick} />
          <div className="flex-1 flex space-x-2">
            <Textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => onNewMessageChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message... (Shift+Enter for new line, **text** for bold)"
              className="flex-1 border-gray-200 focus:border-primary focus:ring-primary rounded-2xl px-4 py-2 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
              rows={1}
            />
            <Button type="submit" className="whatsapp-green hover:bg-green-600 rounded-full w-10 h-10 p-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Template Message Dialog */}
      <TemplateMessageDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => onTemplateDialogOpenChange(false)}
        templates={templates}
        contactName={selectedContact.name || selectedContact.phone_number}
        contactPhone={selectedContact.phone_number}
        onSendTemplate={handleSendTemplateMessage}
      />
    </div>
  );
};
