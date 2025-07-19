import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

interface ConditionNodeProps {
  data: {
    label: string;
    variable: string;
    operator: 'equals' | 'contains' | 'greater' | 'less';
    value: string;
  };
}

export const ConditionNode: React.FC<ConditionNodeProps> = memo(({ data }) => {
  const getOperatorSymbol = (operator: string) => {
    switch (operator) {
      case 'equals': return '=';
      case 'contains': return '⊃';
      case 'greater': return '>';
      case 'less': return '<';
      default: return '=';
    }
  };

  return (
    <div className="bg-background border-2 border-purple-200 rounded-lg p-3 shadow-md min-w-[200px] max-w-[250px]">
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center">
          <GitBranch className="w-3 h-3 text-white" />
        </div>
        <h3 className="font-medium text-sm">{data.label}</h3>
      </div>
      
      <div className="text-sm bg-muted p-2 rounded border-l-2 border-purple-500">
        <div className="font-mono text-xs">
          {data.variable || 'variable'} {getOperatorSymbol(data.operator)} "{data.value || 'value'}"
        </div>
      </div>
      
      <div className="flex justify-between mt-3">
        <div className="text-xs text-green-600">✓ Yes</div>
        <div className="text-xs text-red-600">✗ No</div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="yes" 
        style={{ left: '25%' }}
        className="!bg-green-500" 
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="no" 
        style={{ left: '75%' }}
        className="!bg-red-500" 
      />
    </div>
  );
});