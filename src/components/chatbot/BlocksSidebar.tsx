import React from 'react';
import { Card } from '@/components/ui/card';
import { MessageSquare, Keyboard, GitBranch, ArrowRight, Globe, Clock, Zap } from 'lucide-react';

const blockTypes = [
  {
    type: 'sendMessage',
    label: 'Send Message',
    icon: MessageSquare,
    description: 'Send text, image, or buttons',
    category: 'messages',
  },
  {
    type: 'userInput',
    label: 'User Input',
    icon: Keyboard,
    description: 'Get user response',
    category: 'inputs',
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: GitBranch,
    description: 'If/else logic branching',
    category: 'logic',
  },
  {
    type: 'goTo',
    label: 'Go To Block',
    icon: ArrowRight,
    description: 'Jump to another block',
    category: 'logic',
  },
  {
    type: 'apiCall',
    label: 'API Call',
    icon: Globe,
    description: 'Call external API',
    category: 'actions',
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    description: 'Pause before next action',
    category: 'actions',
  },
  {
    type: 'triggerEvent',
    label: 'Trigger Event',
    icon: Zap,
    description: 'Start flow or tag user',
    category: 'actions',
  },
];

const categories = [
  { id: 'messages', label: 'Messages' },
  { id: 'inputs', label: 'User Input' },
  { id: 'logic', label: 'Logic' },
  { id: 'actions', label: 'Actions' },
];

export const BlocksSidebar: React.FC = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-80 bg-background border-r p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Blocks</h2>
      
      {categories.map((category) => (
        <div key={category.id} className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            {category.label}
          </h3>
          
          <div className="space-y-2">
            {blockTypes
              .filter((block) => block.category === category.id)
              .map((block) => (
                <Card
                  key={block.type}
                  className="p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(event) => onDragStart(event, block.type)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                      <block.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium">{block.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{block.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};