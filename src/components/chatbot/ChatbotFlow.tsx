import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ChatbotToolbar } from './ChatbotToolbar';
import { BlocksSidebar } from './BlocksSidebar';
import { ChatbotPropertiesSidebar } from './ChatbotPropertiesSidebar';
import { SendMessageNode } from './nodes/SendMessageNode';
import { UserInputNode } from './nodes/UserInputNode';
import { ConditionNode } from './nodes/ConditionNode';
import { GoToNode } from './nodes/GoToNode';
import { ApiCallNode } from './nodes/ApiCallNode';
import { DelayNode } from './nodes/DelayNode';
import { TriggerEventNode } from './nodes/TriggerEventNode';
import { useChatbotFlow } from '@/hooks/useChatbotFlow';
import type { FlowTrigger, FlowVariable, ChatbotFlow as ChatbotFlowType } from '@/types/chatbot';

const nodeTypes = {
  sendMessage: SendMessageNode,
  userInput: UserInputNode,
  condition: ConditionNode,
  goTo: GoToNode,
  apiCall: ApiCallNode,
  delay: DelayNode,
  triggerEvent: TriggerEventNode,
};

const initialNodes: Node[] = [
  {
    id: 'trigger-start',
    type: 'triggerEvent',
    position: { x: 250, y: 50 },
    data: {
      label: 'Flow Trigger',
      eventType: 'keyword',
      keywords: ['hello', 'hi', 'start'],
    },
  },
];

const initialEdges: Edge[] = [];

// Custom edge component with delete button
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd }: any) => {
  const { setEdges } = useReactFlow();
  
  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const edgePath = `M${sourceX},${sourceY} L${targetX},${targetY}`;
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={20}
        height={20}
        x={midX - 10}
        y={midY - 10}
        className="edge-button"
      >
        <button
          className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs cursor-pointer border-2 border-white"
          onClick={onEdgeClick}
        >
          ×
        </button>
      </foreignObject>
    </>
  );
};

const edgeTypes = {
  default: CustomEdge,
};

export const ChatbotFlowCanvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [flowVariables, setFlowVariables] = useState<FlowVariable[]>([]);
  const [flowTrigger, setFlowTrigger] = useState<FlowTrigger>({
    type: 'keyword',
    keywords: ['hello', 'hi', 'start'],
    exact_match: false,
  });
  const [flowName, setFlowName] = useState('Untitled Flow');
  const [isEditingProperties, setIsEditingProperties] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { saveFlow, processTemplate, loadFlows, flows } = useChatbotFlow();
  const { screenToFlowPosition } = useReactFlow();

  // Load existing flows on component mount
  useEffect(() => {
    loadFlows();
  }, [loadFlows]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Modified key handler - only delete when not editing properties
  const onKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't delete nodes when user is editing in properties panel
    if (isEditingProperties) return;
    
    // Don't delete if user is typing in an input field
    const activeElement = document.activeElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' ||
      (activeElement as HTMLElement).contentEditable === 'true'
    )) {
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selectedNode) {
        setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
        setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
        setSelectedNode(null);
      }
    }
  }, [selectedNode, setNodes, setEdges, isEditingProperties]);

  // Add event listener for keyboard deletion
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: getDefaultLabel(type),
          ...getDefaultData(type),
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const getDefaultLabel = (type: string): string => {
    const labels: Record<string, string> = {
      sendMessage: 'Send Message',
      userInput: 'Get User Input',
      condition: 'Condition',
      goTo: 'Go To Block',
      apiCall: 'API Call',
      delay: 'Delay', 
      triggerEvent: 'Trigger Event',
    };
    return labels[type] || 'New Block';
  };

  const getDefaultData = (type: string): any => {
    const defaultData: Record<string, any> = {
      sendMessage: {
        message: 'Enter your message here...',
        messageType: 'text',
        buttons: [],
      },
      userInput: {
        inputType: 'text',
        variable: 'user_response',
        quickReplies: [],
      },
      condition: {
        variable: '',
        operator: 'equals',
        value: '',
      },
      goTo: {
        targetBlockId: '',
      },
      apiCall: {
        url: '',
        method: 'GET',
        headers: {},
        body: '',
      },
      delay: {
        duration: 1000,
      },
      triggerEvent: {
        eventType: 'keyword',
        keywords: [],
      },
    };
    return defaultData[type] || {};
  };

  const updateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        )
      );
    },
    [setNodes]
  );

  const saveFlowData = useCallback(async () => {
    const flowData: Partial<ChatbotFlowType> = {
      name: flowName,
      trigger: flowTrigger,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type as any,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
      variables: flowVariables,
      status: 'active',
    };

    await saveFlow(flowData);
    loadFlows();
  }, [flowName, flowTrigger, nodes, edges, flowVariables, saveFlow, loadFlows]);

  const loadFlow = useCallback(() => {
    try {
      const savedFlow = localStorage.getItem('chatbot-flow');
      if (savedFlow) {
        const flow = JSON.parse(savedFlow);
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setVariables(flow.variables || {});
        alert('Flow loaded successfully!');
      }
    } catch (error) {
      alert('Error loading flow');
    }
  }, [setNodes, setEdges]);

  return (
    <div className="h-full flex">
      {/* Blocks Sidebar */}
      <BlocksSidebar />
      
      {/* Main Canvas Area */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background gap={20} size={1} />
          <Controls />
          <MiniMap />
          
          {/* Toolbar */}
          <Panel position="top-center">
            <ChatbotToolbar onSave={saveFlowData} onLoad={loadFlow} />
          </Panel>
        </ReactFlow>
      </div>

      {/* Properties Sidebar */}
      <ChatbotPropertiesSidebar
        selectedNode={selectedNode}
        onUpdateNode={updateNodeData}
        variables={variables}
        setVariables={setVariables}
        flowName={flowName}
        setFlowName={setFlowName}
        flowTrigger={flowTrigger}
        setFlowTrigger={setFlowTrigger}
        flowVariables={flowVariables}
        setFlowVariables={setFlowVariables}
        onEditingStateChange={setIsEditingProperties}
      />
    </div>
  );
};
