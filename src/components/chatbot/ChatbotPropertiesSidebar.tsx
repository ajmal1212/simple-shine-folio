
import React from 'react';
import { Node } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PropertiesPanel } from './PropertiesPanel';
import { FlowTriggerSettings } from './FlowTriggerSettings';
import { VariableExtractor } from './VariableExtractor';
import { FlowTrigger, FlowVariable } from '@/types/chatbot';

interface ChatbotPropertiesSidebarProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, data: any) => void;
  variables: Record<string, any>;
  setVariables: (variables: Record<string, any>) => void;
  flowName: string;
  setFlowName: (name: string) => void;
  flowTrigger: FlowTrigger;
  setFlowTrigger: (trigger: FlowTrigger) => void;
  flowVariables: FlowVariable[];
  setFlowVariables: (variables: FlowVariable[]) => void;
  onEditingStateChange?: (isEditing: boolean) => void;
}

export const ChatbotPropertiesSidebar: React.FC<ChatbotPropertiesSidebarProps> = ({
  selectedNode,
  onUpdateNode,
  variables,
  setVariables,
  flowName,
  setFlowName,
  flowTrigger,
  setFlowTrigger,
  flowVariables,
  setFlowVariables,
  onEditingStateChange,
}) => {
  return (
    <div className="w-80 bg-background border-l overflow-y-auto">
      <Tabs defaultValue="properties" className="h-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="trigger">Trigger</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="h-full">
          <PropertiesPanel
            selectedNode={selectedNode}
            onUpdateNode={onUpdateNode}
            variables={variables}
            setVariables={setVariables}
            onEditingStateChange={onEditingStateChange}
          />
        </TabsContent>
        
        <TabsContent value="trigger" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Flow Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Flow Name</label>
                  <input
                    type="text"
                    value={flowName}
                    onChange={(e) => setFlowName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                    placeholder="Enter flow name"
                    onFocus={() => onEditingStateChange?.(true)}
                    onBlur={() => onEditingStateChange?.(false)}
                  />
                </div>
                <FlowTriggerSettings
                  trigger={flowTrigger}
                  onUpdate={setFlowTrigger}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="variables" className="p-4">
          <VariableExtractor
            variables={flowVariables}
            onUpdate={setFlowVariables}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
