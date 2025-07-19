import React, { useState } from 'react';
import { Plus, X, MessageCircle, Link, Phone, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ButtonComponent } from '@/types/template';

interface ButtonManagerProps {
  buttons: ButtonComponent[];
  onButtonsChange: (buttons: ButtonComponent[]) => void;
}

export const ButtonManager: React.FC<ButtonManagerProps> = ({
  buttons,
  onButtonsChange
}) => {
  const { toast } = useToast();
  const [isAddingButton, setIsAddingButton] = useState(false);
  const [newButton, setNewButton] = useState<ButtonComponent>({
    id: '',
    type: 'QUICK_REPLY',
    text: ''
  });

  const handleAddButton = () => {
    if (!newButton.text.trim()) {
      toast({
        title: "Error",
        description: "Button text is required",
        variant: "destructive"
      });
      return;
    }

    if (buttons.length >= 10) {
      toast({
        title: "Error",
        description: "Maximum 10 buttons allowed",
        variant: "destructive"
      });
      return;
    }

    // Validate URL button
    if (newButton.type === 'URL' && !newButton.url?.trim()) {
      toast({
        title: "Error",
        description: "URL is required for URL buttons",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number button
    if (newButton.type === 'PHONE_NUMBER' && !newButton.phone_number?.trim()) {
      toast({
        title: "Error",
        description: "Phone number is required for phone buttons",
        variant: "destructive"
      });
      return;
    }

    // Validate flow button
    if (newButton.type === 'FLOW' && (!newButton.flow_id?.trim() || !newButton.flow_cta?.trim())) {
      toast({
        title: "Error",
        description: "Flow ID and CTA are required for flow buttons",
        variant: "destructive"
      });
      return;
    }

    const buttonToAdd = {
      ...newButton,
      id: Date.now().toString()
    };

    onButtonsChange([...buttons, buttonToAdd]);

    setNewButton({
      id: '',
      type: 'QUICK_REPLY',
      text: ''
    });
    setIsAddingButton(false);
  };

  const handleRemoveButton = (buttonId: string) => {
    onButtonsChange(buttons.filter(btn => btn.id !== buttonId));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Buttons (Optional)</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingButton(true)}
            disabled={buttons.length >= 10}
            className="text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Button
          </Button>
        </div>
      </CardHeader>
      {buttons.length > 0 && (
        <CardContent>
          <div className="space-y-2">
            {buttons.map((button, index) => (
              <div key={button.id} className="flex items-center justify-between p-2 border rounded text-sm">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {button.type === 'QUICK_REPLY' && <MessageCircle className="w-3 h-3 mr-1" />}
                    {button.type === 'URL' && <Link className="w-3 h-3 mr-1" />}
                    {button.type === 'PHONE_NUMBER' && <Phone className="w-3 h-3 mr-1" />}
                    {button.type === 'FLOW' && <Zap className="w-3 h-3 mr-1" />}
                    {button.type.replace('_', ' ')}
                  </Badge>
                  <span className="font-medium truncate">{button.text}</span>
                  {button.url && <span className="text-xs text-gray-500 truncate">→ {button.url}</span>}
                  {button.phone_number && <span className="text-xs text-gray-500 truncate">→ {button.phone_number}</span>}
                  {button.flow_id && <span className="text-xs text-gray-500 truncate">→ Flow: {button.flow_id}</span>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveButton(button.id)}
                  className="flex-shrink-0 h-8 w-8 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      )}

      {/* Add Button Dialog */}
      <Dialog open={isAddingButton} onOpenChange={setIsAddingButton}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Button</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Button Type</Label>
              <Select 
                value={newButton.type} 
                onValueChange={(value: any) => setNewButton(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                  <SelectItem value="URL">URL</SelectItem>
                  <SelectItem value="PHONE_NUMBER">Phone Number</SelectItem>
                  <SelectItem value="FLOW">Flow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Button Text</Label>
              <Input
                value={newButton.text}
                onChange={(e) => setNewButton(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Button text"
                className="text-sm"
              />
            </div>

            {newButton.type === 'URL' && (
              <div>
                <Label className="text-sm">URL</Label>
                <Input
                  value={newButton.url || ''}
                  onChange={(e) => setNewButton(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  className="text-sm"
                />
              </div>
            )}

            {newButton.type === 'PHONE_NUMBER' && (
              <div>
                <Label className="text-sm">Phone Number</Label>
                <Input
                  value={newButton.phone_number || ''}
                  onChange={(e) => setNewButton(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="+1234567890"
                  className="text-sm"
                />
              </div>
            )}

            {newButton.type === 'FLOW' && (
              <>
                <div>
                  <Label className="text-sm">Flow ID</Label>
                  <Input
                    value={newButton.flow_id || ''}
                    onChange={(e) => setNewButton(prev => ({ ...prev, flow_id: e.target.value }))}
                    placeholder="flow_id_123"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">Flow CTA</Label>
                  <Input
                    value={newButton.flow_cta || ''}
                    onChange={(e) => setNewButton(prev => ({ ...prev, flow_cta: e.target.value }))}
                    placeholder="Open Flow"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-sm">Flow Action</Label>
                  <Select 
                    value={newButton.flow_action || 'navigate'} 
                    onValueChange={(value) => setNewButton(prev => ({ ...prev, flow_action: value }))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="navigate">Navigate</SelectItem>
                      <SelectItem value="data_exchange">Data Exchange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddingButton(false)} className="text-sm">
                Cancel
              </Button>
              <Button onClick={handleAddButton} className="text-sm">
                Add Button
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
