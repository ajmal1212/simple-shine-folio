
-- Enable realtime for the messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add the messages table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for the conversations table  
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

-- Add the conversations table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
