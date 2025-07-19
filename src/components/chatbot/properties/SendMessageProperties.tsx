
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, X, Code } from 'lucide-react';

interface SendMessagePropertiesProps {
  data: any;
  onUpdate: (data: any) => void;
  variables: Record<string, any>;
  onEditingStateChange?: (isEditing: boolean) => void;
}

export const SendMessageProperties: React.FC<SendMessagePropertiesProps> = ({
  data,
  onUpdate,
  variables,
  onEditingStateChange,
}) => {
  const [showVariableHelper, setShowVariableHelper] = useState(false);

  const addButton = () => {
    const buttons = data.buttons || [];
    onUpdate({
      buttons: [...buttons, { text: '', value: '', type: 'reply' }],
    });
  };

  const removeButton = (index: number) => {
    const buttons = [...(data.buttons || [])];
    buttons.splice(index, 1);
    onUpdate({ buttons });
  };

  const updateButton = (index: number, field: string, value: string) => {
    const buttons = [...(data.buttons || [])];
    buttons[index] = { ...buttons[index], [field]: value };
    onUpdate({ buttons });
  };

  const insertVariable = (variableName: string) => {
    const currentMessage = data.message || '';
    const cursorPosition = currentMessage.length;
    const newMessage = 
      currentMessage.slice(0, cursorPosition) + 
      `{{${variableName}}}` + 
      currentMessage.slice(cursorPosition);
    
    onUpdate({ message: newMessage });
  };

  const handleMessageTypeChange = (value: string) => {
    const updatedData: any = { messageType: value };
    
    // Reset specific fields when changing message type
    if (value === 'text') {
      updatedData.imageUrl = '';
    } else if (value === 'image') {
      updatedData.buttons = [];
    } else if (value === 'buttons') {
      updatedData.imageUrl = '';
      if (!data.buttons || data.buttons.length === 0) {
        updatedData.buttons = [{ text: 'Button 1', value: 'button1', type: 'reply' }];
      }
    }
    
    onUpdate(updatedData);
  };

  const availableVariables = Object.keys(variables);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Block Label</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Enter block label"
          onFocus={() => onEditingStateChange?.(true)}
          onBlur={() => onEditingStateChange?.(false)}
        />
      </div>

      <div>
        <Label htmlFor="messageType">Message Type</Label>
        <Select
          value={data.messageType || 'text'}
          onValueChange={handleMessageTypeChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="buttons">Buttons</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="message">Message Content</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowVariableHelper(!showVariableHelper)}
          >
            <Code className="w-3 h-3 mr-1" />
            Variables
          </Button>
        </div>
        
        <Textarea
          id="message"
          value={data.message || ''}
          onChange={(e) => onUpdate({ message: e.target.value })}
          placeholder="Enter your message... Use {{variable_name}} for dynamic content"
          onFocus={() => onEditingStateChange?.(true)}
          onBlur={() => onEditingStateChange?.(false)}
          rows={4}
        />
        
        {showVariableHelper && (
          <div className="mt-2 p-3 border rounded-md bg-muted/50">
            <div className="text-xs font-medium mb-2">Available Variables:</div>
            <div className="flex flex-wrap gap-1">
              {availableVariables.length > 0 ? (
                availableVariables.map(variable => (
                  <Button
                    key={variable}
                    size="sm"
                    variant="outline"
                    className="text-xs h-6"
                    onClick={() => insertVariable(variable)}
                  >
                    {`{{${variable}}}`}
                  </Button>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">
                  No variables available. Add variables in the Variables tab.
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Click on a variable to insert it into your message
            </div>
          </div>
        )}
      </div>

      {data.messageType === 'image' && (
        <div>
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={data.imageUrl || ''}
            onChange={(e) => onUpdate({ imageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
            onFocus={() => onEditingStateChange?.(true)}
            onBlur={() => onEditingStateChange?.(false)}
          />
        </div>
      )}

      {(data.messageType === 'buttons') && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Buttons</Label>
            <Button size="sm" variant="outline" onClick={addButton}>
              <Plus className="w-3 h-3 mr-1" />
              Add Button
            </Button>
          </div>
          
          {data.buttons?.map((button: any, index: number) => (
            <div key={index} className="space-y-2 p-3 border rounded-md mb-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Button {index + 1}</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeButton(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Button Text</Label>
                  <Input
                    placeholder="Button text"
                    value={button.text || ''}
                    onChange={(e) => updateButton(index, 'text', e.target.value)}
                    onFocus={() => onEditingStateChange?.(true)}
                    onBlur={() => onEditingStateChange?.(false)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Button Type</Label>
                  <Select
                    value={button.type || 'reply'}
                    onValueChange={(value) => updateButton(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reply">Quick Reply</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="flow">Flow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {button.type === 'reply' && (
                <div>
                  <Label className="text-xs">Reply Value</Label>
                  <Input
                    placeholder="Value to capture"
                    value={button.value || ''}
                    onChange={(e) => updateButton(index, 'value', e.target.value)}
                    onFocus={() => onEditingStateChange?.(true)}
                    onBlur={() => onEditingStateChange?.(false)}
                  />
                </div>
              )}
              
              {button.type === 'url' && (
                <div>
                  <Label className="text-xs">URL</Label>
                  <Input
                    placeholder="https://example.com"
                    value={button.url || ''}
                    onChange={(e) => updateButton(index, 'url', e.target.value)}
                    onFocus={() => onEditingStateChange?.(true)}
                    onBlur={() => onEditingStateChange?.(false)}
                  />
                </div>
              )}
              
              {button.type === 'phone' && (
                <div>
                  <Label className="text-xs">Phone Number</Label>
                  <Input
                    placeholder="+1234567890"
                    value={button.phone || ''}
                    onChange={(e) => updateButton(index, 'phone', e.target.value)}
                    onFocus={() => onEditingStateChange?.(true)}
                    onBlur={() => onEditingStateChange?.(false)}
                  />
                </div>
              )}
              
              {button.type === 'flow' && (
                <div>
                  <Label className="text-xs">Flow ID</Label>
                  <Input
                    placeholder="flow-id"
                    value={button.flowId || ''}
                    onChange={(e) => updateButton(index, 'flowId', e.target.value)}
                    onFocus={() => onEditingStateChange?.(true)}
                    onBlur={() => onEditingStateChange?.(false)}
                  />
                </div>
              )}
            </div>
          ))}
          
          {(!data.buttons || data.buttons.length === 0) && (
            <div className="text-sm text-muted-foreground p-3 border rounded-md text-center">
              No buttons added yet. Click "Add Button" to create your first button.
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
        <strong>Variable Usage:</strong> Use {`{{variable_name}}`} in your message content to insert dynamic values. 
        Variables can be captured from user inputs, API responses, or previous messages in the flow.
      </div>
    </div>
  );
};
