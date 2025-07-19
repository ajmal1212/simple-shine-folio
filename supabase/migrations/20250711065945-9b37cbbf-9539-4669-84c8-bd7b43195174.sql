
-- Create chatbot_flows table to store chatbot flow configurations
CREATE TABLE public.chatbot_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  trigger JSONB NOT NULL,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flow_executions table to track flow execution instances
CREATE TABLE public.flow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES public.chatbot_flows(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  current_node_id TEXT NOT NULL,
  variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'paused', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) for chatbot_flows
ALTER TABLE public.chatbot_flows ENABLE ROW LEVEL SECURITY;

-- Create policies for chatbot_flows
CREATE POLICY "Users can view their own chatbot flows" 
  ON public.chatbot_flows 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chatbot flows" 
  ON public.chatbot_flows 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chatbot flows" 
  ON public.chatbot_flows 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chatbot flows" 
  ON public.chatbot_flows 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add Row Level Security (RLS) for flow_executions
ALTER TABLE public.flow_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for flow_executions (access through flow ownership)
CREATE POLICY "Users can view executions of their flows" 
  ON public.flow_executions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.chatbot_flows 
    WHERE chatbot_flows.id = flow_executions.flow_id 
    AND chatbot_flows.user_id = auth.uid()
  ));

CREATE POLICY "Users can create executions for their flows" 
  ON public.flow_executions 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.chatbot_flows 
    WHERE chatbot_flows.id = flow_executions.flow_id 
    AND chatbot_flows.user_id = auth.uid()
  ));

CREATE POLICY "Users can update executions of their flows" 
  ON public.flow_executions 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.chatbot_flows 
    WHERE chatbot_flows.id = flow_executions.flow_id 
    AND chatbot_flows.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete executions of their flows" 
  ON public.flow_executions 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.chatbot_flows 
    WHERE chatbot_flows.id = flow_executions.flow_id 
    AND chatbot_flows.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_chatbot_flows_user_id ON public.chatbot_flows(user_id);
CREATE INDEX idx_chatbot_flows_status ON public.chatbot_flows(status);
CREATE INDEX idx_flow_executions_flow_id ON public.flow_executions(flow_id);
CREATE INDEX idx_flow_executions_conversation_id ON public.flow_executions(conversation_id);
CREATE INDEX idx_flow_executions_status ON public.flow_executions(status);
