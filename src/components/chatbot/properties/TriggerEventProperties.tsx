
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface TriggerEventPropertiesProps {
  data: any;
  onUpdate: (data: any) => void;
  onEditingStateChange?: (isEditing: boolean) => void;
}

export const TriggerEventProperties: React.FC<TriggerEventPropertiesProps> = ({
  data,
  onUpdate,
  onEditingStateChange,
}) => {
  const addKeyword = () => {
    const keywords = data.keywords || [];
    onUpdate({
      ...data,
      keywords: [...keywords, ''],
    });
  };

  const updateKeyword = (index: number, value: string) => {
    const keywords = [...(data.keywords || [])];
    keywords[index] = value;
    onUpdate({ 
      ...data,
      keywords 
    });
  };

  const removeKeyword = (index: number) => {
    const keywords = [...(data.keywords || [])];
    keywords.splice(index, 1);
    onUpdate({ 
      ...data,
      keywords 
    });
  };

  const handleEventTypeChange = (value: string) => {
    const updatedData = { 
      ...data, 
      eventType: value 
    };
    
    // Reset type-specific fields when changing event type
    if (value === 'keyword') {
      updatedData.tag = '';
      updatedData.webhookUrl = '';
      if (!updatedData.keywords || updatedData.keywords.length === 0) {
        updatedData.keywords = [''];
      }
    } else if (value === 'tag_user') {
      updatedData.keywords = [];
      updatedData.webhookUrl = '';
    } else if (value === 'webhook') {
      updatedData.keywords = [];
      updatedData.tag = '';
    }
    
    onUpdate(updatedData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label">Block Label</Label>
        <Input
          id="label"
          value={data.label || ''}
          onChange={(e) => onUpdate({ ...data, label: e.target.value })}
          placeholder="Enter block label"
          onFocus={() => onEditingStateChange?.(true)}
          onBlur={() => onEditingStateChange?.(false)}
        />
      </div>

      <div>
        <Label htmlFor="eventType">Event Type</Label>
        <Select
          value={data.eventType || 'keyword'}
          onValueChange={handleEventTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="keyword">Keyword Trigger</SelectItem>
            <SelectItem value="tag_user">Tag User</SelectItem>
            <SelectItem value="webhook">Send Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(data.eventType === 'keyword' || !data.eventType) && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Keywords</Label>
            <Button size="sm" variant="outline" onClick={addKeyword}>
              <Plus className="w-3 h-3 mr-1" />
              Add Keyword
            </Button>
          </div>
          
          {data.keywords?.map((keyword: string, index: number) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                placeholder="Enter keyword"
                value={keyword}
                onChange={(e) => updateKeyword(index, e.target.value)}
                onFocus={() => onEditingStateChange?.(true)}
                onBlur={() => onEditingStateChange?.(false)}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => removeKeyword(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
          
          {(!data.keywords || data.keywords.length === 0) && (
            <div className="text-sm text-muted-foreground p-3 border rounded-md text-center">
              No keywords added yet. Click "Add Keyword" to create trigger keywords.
            </div>
          )}
        </div>
      )}

      {data.eventType === 'tag_user' && (
        <div>
          <Label htmlFor="tag">Tag</Label>
          <Input
            id="tag"
            value={data.tag || ''}
            onChange={(e) => onUpdate({ ...data, tag: e.target.value })}
            placeholder="Enter tag name"
            onFocus={() => onEditingStateChange?.(true)}
            onBlur={() => onEditingStateChange?.(false)}
          />
        </div>
      )}

      {data.eventType === 'webhook' && (
        <div>
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input
            id="webhookUrl"
            value={data.webhookUrl || ''}
            onChange={(e) => onUpdate({ ...data, webhookUrl: e.target.value })}
            placeholder="https://your-webhook-url.com"
            onFocus={() => onEditingStateChange?.(true)}
            onBlur={() => onEditingStateChange?.(false)}
          />
        </div>
      )}

      <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
        <strong>Event:</strong> {data.eventType || 'keyword'}
        <br />
        {(data.eventType === 'keyword' || !data.eventType) && data.keywords && 
          `Keywords: ${data.keywords.filter((k: string) => k.trim()).join(', ') || 'Not specified'}`}
        {data.eventType === 'tag_user' && `Tag: ${data.tag || 'Not specified'}`}
        {data.eventType === 'webhook' && `URL: ${data.webhookUrl || 'Not specified'}`}
      </div>
    </div>
  );
};
