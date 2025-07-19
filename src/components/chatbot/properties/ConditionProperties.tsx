import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConditionPropertiesProps {
  data: any;
  onUpdate: (data: any) => void;
  variables: Record<string, any>;
}

export const ConditionProperties: React.FC<ConditionPropertiesProps> = ({
  data,
  onUpdate,
  variables,
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
        <Label htmlFor="variable">Variable to Check</Label>
        <Select
          value={data.variable || ''}
          onValueChange={(value) => onUpdate({ variable: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select variable" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(variables).map((variable) => (
              <SelectItem key={variable} value={variable}>
                {variable}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="operator">Operator</Label>
        <Select
          value={data.operator || 'equals'}
          onValueChange={(value) => onUpdate({ operator: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="greater">Greater than</SelectItem>
            <SelectItem value="less">Less than</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="value">Value to Compare</Label>
        <Input
          id="value"
          value={data.value || ''}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Enter comparison value"
        />
      </div>

      <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
        <strong>Condition:</strong> {data.variable || 'variable'} {data.operator || 'equals'} "{data.value || 'value'}"
        <br />
        <span className="text-green-600">✓ Yes</span> - condition is true
        <br />
        <span className="text-red-600">✗ No</span> - condition is false
      </div>
    </div>
  );
};