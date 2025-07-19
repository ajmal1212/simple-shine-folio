import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface UserInputPropertiesProps {
  data: any;
  onUpdate: (data: any) => void;
  variables: Record<string, any>;
  setVariables: (variables: Record<string, any>) => void;
}

export const UserInputProperties: React.FC<UserInputPropertiesProps> = ({
  data,
  onUpdate,
  variables,
  setVariables,
}) => {
  const addQuickReply = () => {
    const quickReplies = data.quickReplies || [];
    onUpdate({
      quickReplies: [...quickReplies, { text: '', value: '' }],
    });
  };

  const removeQuickReply = (index: number) => {
    const quickReplies = [...(data.quickReplies || [])];
    quickReplies.splice(index, 1);
    onUpdate({ quickReplies });
  };

  const updateQuickReply = (index: number, field: string, value: string) => {
    const quickReplies = [...(data.quickReplies || [])];
    quickReplies[index] = { ...quickReplies[index], [field]: value };
    onUpdate({ quickReplies });
  };

  const handleVariableChange = (newVariable: string) => {
    // Remove old variable if it exists
    if (data.variable && data.variable !== newVariable) {
      const newVariables = { ...variables };
      delete newVariables[data.variable];
      setVariables(newVariables);
    }
    
    // Add new variable
    if (newVariable) {
      setVariables({
        ...variables,
        [newVariable]: null,
      });
    }
    
    onUpdate({ variable: newVariable });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Block Label</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Enter block label"
        />
      </div>

      <div>
        <Label htmlFor="inputType">Input Type</Label>
        <Select
          value={data.inputType || 'text'}
          onValueChange={(value) => onUpdate({ inputType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="quickReplies">Quick Replies</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="variable">Variable Name</Label>
        <Input
          id="variable"
          value={data.variable || ''}
          onChange={(e) => handleVariableChange(e.target.value)}
          placeholder="user_response"
        />
        <div className="text-xs text-muted-foreground mt-1">
          This will store the user's response for later use
        </div>
      </div>

      {data.inputType === 'quickReplies' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Quick Replies</Label>
            <Button size="sm" variant="outline" onClick={addQuickReply}>
              <Plus className="w-3 h-3 mr-1" />
              Add Reply
            </Button>
          </div>
          
          {data.quickReplies?.map((reply: any, index: number) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                placeholder="Reply text"
                value={reply.text || ''}
                onChange={(e) => updateQuickReply(index, 'text', e.target.value)}
              />
              <Input
                placeholder="Value"
                value={reply.value || ''}
                onChange={(e) => updateQuickReply(index, 'value', e.target.value)}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeQuickReply(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div>
        <Label>Current Variables</Label>
        <div className="text-xs text-muted-foreground">
          {Object.keys(variables).length > 0 
            ? Object.keys(variables).map(v => `{{${v}}}`).join(', ')
            : 'No variables yet'
          }
        </div>
      </div>
    </div>
  );
};