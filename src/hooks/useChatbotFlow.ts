
import { useState, useCallback } from 'react';
import { ChatbotFlow, FlowExecution, FlowVariable } from '@/types/chatbot';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useChatbotFlow = () => {
  const [flows, setFlows] = useState<ChatbotFlow[]>([]);
  const [executions, setExecutions] = useState<FlowExecution[]>([]);
  const { toast } = useToast();

  const saveFlow = useCallback(async (flow: Partial<ChatbotFlow>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const flowData = {
        ...flow,
        user_id: user.user.id,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from('chatbot_flows')
        .upsert(flowData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Flow saved successfully",
      });

      return data;
    } catch (error) {
      console.error('Error saving flow:', error);
      toast({
        title: "Error",
        description: "Failed to save flow",
        variant: "destructive",
      });
    }
  }, [toast]);

  const executeFlow = useCallback(async (
    flowId: string, 
    conversationId: string, 
    initialVariables: Record<string, any> = {}
  ) => {
    try {
      const { data: flow } = await (supabase as any)
        .from('chatbot_flows')
        .select('*')
        .eq('id', flowId)
        .single();

      if (!flow) throw new Error('Flow not found');

      // Create flow execution record
      const execution: Partial<FlowExecution> = {
        flow_id: flowId,
        conversation_id: conversationId,
        current_node_id: flow.nodes[0]?.id || '',
        variables: initialVariables,
        status: 'running',
      };

      const { data: executionData, error } = await (supabase as any)
        .from('flow_executions')
        .insert(execution)
        .select()
        .single();

      if (error) throw error;

      return executionData;
    } catch (error) {
      console.error('Error executing flow:', error);
      throw error;
    }
  }, []);

  const processUserMessage = useCallback(async (
    conversationId: string,
    message: string,
    variables: Record<string, any> = {}
  ) => {
    try {
      // Check for keyword triggers
      const { data: flows } = await (supabase as any)
        .from('chatbot_flows')
        .select('*')
        .eq('status', 'active');

      if (!flows) return;

      for (const flow of flows) {
        const trigger = flow.trigger;
        if (trigger.type === 'keyword' && trigger.keywords) {
          const messageWords = message.toLowerCase().split(' ');
          const hasKeyword = trigger.keywords.some((keyword: string) => {
            if (trigger.exact_match) {
              return messageWords.includes(keyword.toLowerCase());
            }
            return message.toLowerCase().includes(keyword.toLowerCase());
          });

          if (hasKeyword) {
            await executeFlow(flow.id, conversationId, variables);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error processing user message:', error);
    }
  }, [executeFlow]);

  const updateFlowVariable = useCallback(async (
    executionId: string,
    variableName: string,
    value: any
  ) => {
    try {
      const { data: execution } = await (supabase as any)
        .from('flow_executions')
        .select('variables')
        .eq('id', executionId)
        .single();

      if (!execution) return;

      const updatedVariables = {
        ...execution.variables,
        [variableName]: value,
      };

      const { error } = await (supabase as any)
        .from('flow_executions')
        .update({ variables: updatedVariables })
        .eq('id', executionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating flow variable:', error);
    }
  }, []);

  const processTemplate = useCallback((
    template: string,
    variables: Record<string, any>
  ): string => {
    let processedText = template;
    
    // Replace variables in the format {{variable_name}}
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedText = processedText.replace(regex, variables[key] || '');
    });

    return processedText;
  }, []);

  const loadFlows = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: flows, error } = await (supabase as any)
        .from('chatbot_flows')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFlows(flows || []);
    } catch (error) {
      console.error('Error loading flows:', error);
    }
  }, []);

  return {
    flows,
    executions,
    saveFlow,
    executeFlow,
    processUserMessage,
    updateFlowVariable,
    processTemplate,
    loadFlows,
  };
};
