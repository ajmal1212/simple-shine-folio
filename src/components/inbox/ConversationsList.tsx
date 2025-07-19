
import React from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Conversation } from '@/types/inbox';
import { formatMessageContent } from '@/utils/messageUtils';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  searchQuery: string;
  onConversationSelect: (id: string) => void;
  onSearchChange: (query: string) => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  searchQuery,
  onConversationSelect,
  onSearchChange,
}) => {
  const filteredConversations = conversations.filter(conversation =>
    conversation.contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.contact.phone_number.includes(searchQuery)
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Chats</h2>
          <Button size="sm" className="whatsapp-green hover:bg-green-600 shadow-sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-gray-200 focus:border-primary focus:ring-primary bg-gray-50"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-100 bg-gray-50">
        {['All', 'Active', 'Pending', 'Resolved'].map((filter) => (
          <button
            key={filter}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white transition-colors border-b-2 border-transparent hover:border-primary"
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No conversations found
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => {
                console.log('🖱️ Selected conversation:', conversation.id);
                onConversationSelect(conversation.id);
              }}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedConversation === conversation.id ? 'bg-primary/5 border-r-4 border-r-primary' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-primary">
                    {conversation.contact.name?.[0]?.toUpperCase() || conversation.contact.phone_number[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {conversation.contact.name || conversation.contact.phone_number}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {conversation.last_message?.timestamp && 
                        new Date(conversation.last_message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                      }
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-2">{conversation.contact.phone_number}</p>
                  
                  {conversation.last_message && (
                    <p className="text-sm text-gray-600 truncate mb-2">
                      {conversation.last_message.sender_type === 'user' ? 'You: ' : ''}
                      {typeof formatMessageContent(conversation.last_message as any) === 'string' 
                        ? formatMessageContent(conversation.last_message as any)
                        : 'Media message'
                      }
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs capitalize bg-gray-100 text-gray-700">
                      {conversation.status}
                    </Badge>
                    
                    {conversation.unread_count > 0 && (
                      <Badge className="bg-primary text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
