
import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Variable {
  name: string;
  sample: string;
}

interface VariableManagerProps {
  variables: Variable[];
  onVariablesChange: (variables: Variable[]) => void;
}

export const VariableManager: React.FC<VariableManagerProps> = ({
  variables,
  onVariablesChange
}) => {
  const addVariable = () => {
    const newVariable = { name: '', sample: '' };
    onVariablesChange([...variables, newVariable]);
  };

  const updateVariable = (index: number, field: 'name' | 'sample', value: string) => {
    const updatedVariables = variables.map((variable, i) => 
      i === index ? { ...variable, [field]: value } : variable
    );
    onVariablesChange(updatedVariables);
  };

  const removeVariable = (index: number) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    onVariablesChange(updatedVariables);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Variables</CardTitle>
          <Button variant="outline" size="sm" onClick={addVariable}>
            <Plus className="w-4 h-4 mr-2" />
            Add Variable
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {variables.length === 0 ? (
          <p className="text-sm text-gray-500">
            No variables added. Use variables like {`{{1}}, {{2}}`} in your body text and add them here.
          </p>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-4">
              Use {`{{1}}, {{2}}, {{3}}`} etc. in your body text to reference these variables.
            </div>
            {variables.map((variable, index) => (
              <div key={index} className="flex items-end space-x-2">
                <div className="flex-1">
                  <Label htmlFor={`var-name-${index}`}>Variable {index + 1} Name</Label>
                  <Input
                    id={`var-name-${index}`}
                    value={variable.name}
                    onChange={(e) => updateVariable(index, 'name', e.target.value)}
                    placeholder="e.g., customer_name"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`var-sample-${index}`}>Sample Value</Label>
                  <Input
                    id={`var-sample-${index}`}
                    value={variable.sample}
                    onChange={(e) => updateVariable(index, 'sample', e.target.value)}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariable(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
};
