import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface GoToPropertiesProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const GoToProperties: React.FC<GoToPropertiesProps> = ({
  data,
  onUpdate,
}) => {
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
        <Label htmlFor="targetBlockId">Target Block ID</Label>
        <Input
          id="targetBlockId"
          value={data.targetBlockId || ''}
          onChange={(e) => onUpdate({ targetBlockId: e.target.value })}
          placeholder="Enter block ID to jump to"
        />
        <div className="text-xs text-muted-foreground mt-1">
          This will redirect the flow to the specified block
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
        <strong>Action:</strong> Jump to block "{data.targetBlockId || 'target-block'}"
      </div>
    </div>
  );
};