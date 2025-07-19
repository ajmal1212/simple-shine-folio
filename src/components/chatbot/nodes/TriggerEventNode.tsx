
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap } from 'lucide-react';

interface TriggerEventNodeProps {
  data: {
    label: string;
    eventType: 'keyword' | 'tag_user' | 'webhook';
    flowId?: string;
    tag?: string;
    webhookUrl?: string;
    keywords?: string[];
  };
}

export const TriggerEventNode: React.FC<TriggerEventNodeProps> = memo(({ data }) => {
  const getEventDisplay = () => {
    const eventType = data.eventType || 'keyword';
    
    switch (eventType) {
      case 'keyword':
        if (data.keywords && data.keywords.length > 0) {
          const validKeywords = data.keywords.filter(k => k && k.trim());
          if (validKeywords.length > 0) {
            return `Keywords: ${validKeywords.slice(0, 2).join(', ')}${validKeywords.length > 2 ? '...' : ''}`;
          }
        }
        return 'Keywords: Not set';
      case 'tag_user':
        return `Tag User: ${data.tag || 'Enter tag'}`;
      case 'webhook':
        return `Webhook: ${data.webhookUrl || 'Enter URL'}`;
      default:
        return 'Configure event';
    }
  };

  return (
    <div className="bg-background border-2 border-pink-200 rounded-lg p-3 shadow-md min-w-[200px] max-w-[250px]">
      <Handle type="target" position={Position.Top} className="!bg-pink-500" />
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-pink-500 rounded-md flex items-center justify-center">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <h3 className="font-medium text-sm">{data.label || 'Flow Trigger'}</h3>
      </div>
      
      <div className="text-sm bg-muted p-2 rounded border-l-2 border-pink-500">
        <div className="text-xs">{getEventDisplay()}</div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-pink-500" />
    </div>
  );
});
