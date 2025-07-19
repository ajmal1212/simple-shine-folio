import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DelayPropertiesProps {
  data: any;
  onUpdate: (data: any) => void;
}

export const DelayProperties: React.FC<DelayPropertiesProps> = ({
  data,
  onUpdate,
}) => {
  const [value, setValue] = React.useState(1);
  const [unit, setUnit] = React.useState('seconds');

  React.useEffect(() => {
    const duration = data.duration || 1000;
    if (duration < 1000) {
      setValue(duration);
      setUnit('milliseconds');
    } else if (duration < 60000) {
      setValue(duration / 1000);
      setUnit('seconds');
    } else {
      setValue(duration / 60000);
      setUnit('minutes');
    }
  }, [data.duration]);

  const handleValueChange = (newValue: number) => {
    setValue(newValue);
    let duration;
    switch (unit) {
      case 'milliseconds':
        duration = newValue;
        break;
      case 'seconds':
        duration = newValue * 1000;
        break;
      case 'minutes':
        duration = newValue * 60000;
        break;
      default:
        duration = newValue * 1000;
    }
    onUpdate({ duration });
  };

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit);
    let duration;
    switch (newUnit) {
      case 'milliseconds':
        duration = value;
        break;
      case 'seconds':
        duration = value * 1000;
        break;
      case 'minutes':
        duration = value * 60000;
        break;
      default:
        duration = value * 1000;
    }
    onUpdate({ duration });
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
        <Label>Delay Duration</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            placeholder="1"
            min="1"
          />
          <Select value={unit} onValueChange={handleUnitChange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="milliseconds">ms</SelectItem>
              <SelectItem value="seconds">seconds</SelectItem>
              <SelectItem value="minutes">minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
        <strong>Delay:</strong> {value} {unit}
        <br />
        Total duration: {data.duration || 1000}ms
      </div>
    </div>
  );
};