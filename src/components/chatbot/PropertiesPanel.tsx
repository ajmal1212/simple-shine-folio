
import React from 'react';
import { Node } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SendMessageProperties } from './properties/SendMessageProperties';
import { UserInputProperties } from './properties/UserInputProperties';
import { ConditionProperties } from './properties/ConditionProperties';
import { GoToProperties } from './properties/GoToProperties';
import { ApiCallProperties } from './properties/ApiCallProperties';
import { DelayProperties } from './properties/DelayProperties';
import { TriggerEventProperties } from './properties/TriggerEventProperties';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, data: any) => void;
  variables: Record<string, any>;
  setVariables: (variables: Record<string, any>) => void;
  onEditingStateChange?: (isEditing: boolean) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  onUpdateNode,
  variables,
  setVariables,
  onEditingStateChange,
}) => {
  if (!selectedNode) {
    return (
      <div className="p-4 text-center">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Select a block to edit its properties</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const updateNodeData = (data: any) => {
    onUpdateNode(selectedNode.id, data);
  };

  const renderProperties = () => {
    switch (selectedNode.type) {
      case 'sendMessage':
        return (
          <SendMessageProperties
            data={selectedNode.data}
            onUpdate={updateNodeData}
            variables={variables}
            onEditingStateChange={onEditingStateChange}
          />
        );
      case 'userInput':
        return (
          <UserInputProperties
            data={selectedNode.data}
            onUpdate={updateNodeData}
            variables={variables}
            setVariables={setVariables}
          />
        );
      case 'condition':
        return (
          <ConditionProperties
            data={selectedNode.data}
            onUpdate={updateNodeData}
            variables={variables}
          />
        );
      case 'goTo':
        return (
          <GoToProperties
            data={selectedNode.data}
            onUpdate={updateNodeData}
          />
        );
      case 'apiCall':
        return (
          <ApiCallProperties
            data={selectedNode.data}
            onUpdate={updateNodeData}
            variables={variables}
          />
        );
      case 'delay':
        return (
          <DelayProperties
            data={selectedNode.data}
            onUpdate={updateNodeData}
          />
        );
      case 'triggerEvent':
        return (
          <TriggerEventProperties
            data={selectedNode.data}
            onUpdate={updateNodeData}
            onEditingStateChange={onEditingStateChange}
          />
        );
      default:
        return <div>No properties available for this block type.</div>;
    }
  };

  return (
    <div className="p-4 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Properties</CardTitle>
          <p className="text-sm text-muted-foreground">
            {String(selectedNode.data.label || selectedNode.type)}
          </p>
        </CardHeader>
        <CardContent>
          {renderProperties()}
        </CardContent>
      </Card>
    </div>
  );
};
