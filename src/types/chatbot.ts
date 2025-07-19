
export interface ChatbotFlow {
  id: string;
  name: string;
  trigger: FlowTrigger;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: FlowVariable[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface FlowTrigger {
  type: 'keyword' | 'button' | 'webhook';
  keywords?: string[];
  exact_match?: boolean;
}

export interface FlowNode {
  id: string;
  type: 'sendMessage' | 'userInput' | 'condition' | 'goTo' | 'apiCall' | 'delay' | 'triggerEvent';
  position: { x: number; y: number };
  data: any;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface FlowVariable {
  name: string;
  value: any;
  type: 'text' | 'number' | 'boolean';
  source?: 'user_input' | 'api_response' | 'system';
}

export interface FlowExecution {
  id: string;
  flow_id: string;
  conversation_id: string;
  current_node_id: string;
  variables: Record<string, any>;
  status: 'running' | 'completed' | 'paused' | 'error';
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  type: 'text' | 'image' | 'buttons';
  content: string;
  buttons?: MessageButton[];
  image_url?: string;
  variables?: string[];
}

export interface MessageButton {
  id: string;
  text: string;
  type: 'reply' | 'url' | 'phone' | 'flow';
  value?: string;
  url?: string;
  phone?: string;
  flow_id?: string;
}
