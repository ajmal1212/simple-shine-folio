
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Code } from 'lucide-react';
import { FlowVariable } from '@/types/chatbot';

interface VariableExtractorProps {
  variables: FlowVariable[];
  onUpdate: (variables: FlowVariable[]) => void;
}

export const VariableExtractor: React.FC<VariableExtractorProps> = ({
  variables,
  onUpdate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const addVariable = () => {
    const newVariable: FlowVariable = {
      name: '',
      value: '',
      type: 'text',
      source: 'user_input',
    };
    onUpdate([...variables, newVariable]);
  };

  const updateVariable = (index: number, field: keyof FlowVariable, value: any) => {
    const updatedVariables = [...variables];
    updatedVariables[index] = { ...updatedVariables[index], [field]: value };
    onUpdate(updatedVariables);
  };

  const removeVariable = (index: number) => {
    const updatedVariables = [...variables];
    updatedVariables.splice(index, 1);
    onUpdate(updatedVariables);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Variables</h3>
        <Button size="sm" variant="outline" onClick={addVariable}>
          <Plus className="w-3 h-3 mr-1" />
          Add Variable
        </Button>
      </div>

      {variables.map((variable, index) => (
        <div key={index} className="p-3 border rounded space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Variable {index + 1}</Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => removeVariable(index)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Variable Name</Label>
              <Input
                placeholder="user_name"
                value={variable.name}
                onChange={(e) => updateVariable(index, 'name', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={variable.type}
                onValueChange={(value) => updateVariable(index, 'type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Source</Label>
            <Select
              value={variable.source}
              onValueChange={(value) => updateVariable(index, 'source', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user_input">User Input</SelectItem>
                <SelectItem value="api_response">API Response</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Default Value (Optional)</Label>
            <Input
              placeholder="Default value"
              value={variable.value || ''}
              onChange={(e) => updateVariable(index, 'value', e.target.value)}
            />
          </div>
        </div>
      ))}

      {variables.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No variables defined</p>
          <p className="text-xs">Add variables to capture user data and use in your flow</p>
        </div>
      )}
    </div>
  );
};
