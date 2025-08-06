
// import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseInboxRealtimeProps {
  selectedConversation: string | null;
  loadConversations: () => void;
  loadMessages: (conversationId: string) => void;
}

export const useInboxRealtime = ({
  selectedConversation,
  loadConversations,
  loadMessages,
}: UseInboxRealtimeProps) => {
  // useEffect(() => {
  //   console.log('🔄 Setting up realtime subscriptions...');
  //   
  //   // Setup realtime subscriptions for conversations
  //   const conversationsChannel = supabase
  //     .channel('conversations-realtime')
  //     .on(
  //       'postgres_changes',
  //       { 
  //         event: '*', 
  //         schema: 'public', 
  //         table: 'conversations' 
  //       },
  //       (payload) => {
  //         console.log('🔄 Conversation realtime update:', payload);
  //         loadConversations();
  //       }
  //     )
  //     .subscribe();

  //   // Setup realtime subscriptions for messages
  //   const messagesChannel = supabase
  //     .channel('messages-realtime')
  //     .on(
  //       'postgres_changes',
  //       { 
  //         event: '*', 
  //         schema: 'public', 
  //         table: 'messages' 
  //       },
  //       (payload) => {
  //         console.log('🔄 Message realtime update:', payload);
  //         console.log('🔄 Current selected conversation:', selectedConversation);
  //         console.log('🔄 Payload event:', payload.eventType);
  //         console.log('🔄 Payload data:', payload.new || payload.old);
  //         
  //         // Always refresh conversations to update last message and unread counts
  //         loadConversations();
  //         
  //         // Handle new messages (INSERT events)
  //         if (payload.eventType === 'INSERT' && payload.new && typeof payload.new === 'object' && 'conversation_id' in payload.new) {
  //           const messageConversationId = payload.new.conversation_id as string;
  //           console.log('🔄 New message for conversation:', messageConversationId);
  //           
  //           // If this message is for the currently selected conversation, refresh messages immediately
  //           if (selectedConversation && messageConversationId === selectedConversation) {
  //             console.log('🔄 New message in current conversation, refreshing messages immediately');
  //             loadMessages(selectedConversation);
  //           }
  //         }
  //         
  //         // Handle message status updates (UPDATE events)
  //         if (payload.eventType === 'UPDATE' && payload.new && typeof payload.new === 'object' && 'conversation_id' in payload.new) {
  //           const messageConversationId = payload.new.conversation_id as string;
  //           console.log('🔄 Status update for message in conversation:', messageConversationId);
  //           
  //           // If this update is for the currently selected conversation, refresh messages
  //           if (selectedConversation && messageConversationId === selectedConversation) {
  //             console.log('🔄 Message status update in current conversation, refreshing messages');
  //             loadMessages(selectedConversation);
  //           }
  //         }
  //       }
  //     )
  //     .subscribe();

  //   // Cleanup function
  //   return () => {
  //     console.log('🧹 Cleaning up realtime subscriptions');
  //     supabase.removeChannel(conversationsChannel);
  //     supabase.removeChannel(messagesChannel);
  //   };
  // }, [selectedConversation, loadConversations, loadMessages]);
};
