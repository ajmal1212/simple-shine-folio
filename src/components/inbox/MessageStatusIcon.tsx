
import React from 'react';
import { Check, CheckCheck, Clock, Loader2 } from 'lucide-react';
import { Message } from '@/types/inbox';

interface MessageStatusIconProps {
  message: Message;
}

export const MessageStatusIcon: React.FC<MessageStatusIconProps> = ({ message }) => {
  if (message.sender_type !== 'user') return null;
  
  console.log('🔍 Getting status icon for message:', message.id, 'status:', message.status, 'sender_type:', message.sender_type);
  
  switch (message.status) {
    case 'sending':
      return <Loader2 className="w-3 h-3 animate-spin text-gray-400" />;
    case 'sent':
      return <Check className="w-3 h-3 text-gray-500" />;
    case 'delivered':
      return <CheckCheck className="w-3 h-3 text-gray-500" />;
    case 'read':
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    case 'failed':
      return <div className="w-3 h-3 rounded-full bg-red-500" />;
    default:
      return <Clock className="w-3 h-3 text-gray-400" />;
  }
};
