
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { FlowTrigger } from '@/types/chatbot';

interface FlowTriggerSettingsProps {
  trigger: FlowTrigger;
  onUpdate: (trigger: FlowTrigger) => void;
}

export const FlowTriggerSettings: React.FC<FlowTriggerSettingsProps> = ({
  trigger,
  onUpdate,
}) => {
  const addKeyword = () => {
    const keywords = trigger.keywords || [];
    onUpdate({
      ...trigger,
      keywords: [...keywords, ''],
    });
  };

  const updateKeyword = (index: number, value: string) => {
    const keywords = [...(trigger.keywords || [])];
    keywords[index] = value;
    onUpdate({
      ...trigger,
      keywords,
    });
  };

  const removeKeyword = (index: number) => {
    const keywords = [...(trigger.keywords || [])];
    keywords.splice(index, 1);
    onUpdate({
      ...trigger,
      keywords,
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">Flow Trigger Settings</h3>
      
      <div>
        <Label>Trigger Type</Label>
        <Select
          value={trigger.type}
          onValueChange={(value: 'keyword' | 'button' | 'webhook') =>
            onUpdate({ ...trigger, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="keyword">Keyword</SelectItem>
            <SelectItem value="button">Button Click</SelectItem>
            <SelectItem value="webhook">Webhook</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {trigger.type === 'keyword' && (
        <>
          <div className="flex items-center space-x-2">
            <Switch
              checked={trigger.exact_match || false}
              onCheckedChange={(checked) =>
                onUpdate({ ...trigger, exact_match: checked })
              }
            />
            <Label>Exact Match</Label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Keywords</Label>
              <Button size="sm" variant="outline" onClick={addKeyword}>
                <Plus className="w-3 h-3 mr-1" />
                Add Keyword
              </Button>
            </div>
            
            {trigger.keywords?.map((keyword, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="Enter keyword"
                  value={keyword}
                  onChange={(e) => updateKeyword(index, e.target.value)}
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
          </div>
        </>
      )}
    </div>
  );
};
