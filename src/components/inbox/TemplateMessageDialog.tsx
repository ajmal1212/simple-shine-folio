
import React, { useState, useRef } from 'react';
import { Send, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Template } from '@/types/inbox';

interface TemplateMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  contactName: string;
  contactPhone: string;
  onSendTemplate: (templateId: string, variables?: string[], headerMedia?: File) => void;
}

export const TemplateMessageDialog: React.FC<TemplateMessageDialogProps> = ({
  isOpen,
  onClose,
  templates,
  contactName,
  contactPhone,
  onSendTemplate
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [variables, setVariables] = useState<string[]>([]);
  const [headerMedia, setHeaderMedia] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  // Extract variables from template body text
  const getRequiredVariables = (bodyText: string) => {
    const matches = bodyText.match(/\{\{\d+\}\}/g);
    return matches ? matches.length : 0;
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const variableCount = getRequiredVariables(template.body_text);
      setVariables(new Array(variableCount).fill(''));
    }
    setHeaderMedia(null);
  };

  const handleVariableChange = (index: number, value: string) => {
    const newVariables = [...variables];
    newVariables[index] = value;
    setVariables(newVariables);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type based on header type
    const headerType = selectedTemplateData?.header_type;
    if (headerType === 'IMAGE' && !file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    if (headerType === 'DOCUMENT' && file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type", 
        description: "Please select a document file",
        variant: "destructive"
      });
      return;
    }
    if (headerType === 'VIDEO' && !file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file", 
        variant: "destructive"
      });
      return;
    }

    setHeaderMedia(file);
  };

  const handleSend = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Template required",
        description: "Please select a template first",
        variant: "destructive"
      });
      return;
    }

    // Check if all required variables are filled
    const hasEmptyVariables = variables.some(v => !v.trim());
    if (hasEmptyVariables) {
      toast({
        title: "Variables required",
        description: "Please fill in all template variables",
        variant: "destructive"
      });
      return;
    }

    // Check if header media is required
    const needsHeaderMedia = selectedTemplateData?.header_type && 
                           selectedTemplateData.header_type !== 'NONE' && 
                           selectedTemplateData.header_type !== 'TEXT';
    
    if (needsHeaderMedia && !headerMedia) {
      toast({
        title: "Media required",
        description: `Please attach a ${selectedTemplateData?.header_type?.toLowerCase()} for the template header`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSendTemplate(selectedTemplate, variables.length > 0 ? variables : undefined, headerMedia || undefined);
      
      // Reset form
      setSelectedTemplate('');
      setVariables([]);
      setHeaderMedia(null);
      onClose();
      
      toast({
        title: "Template sent",
        description: `Template message sent to ${contactName}`,
      });
    } catch (error) {
      console.error('Error sending template:', error);
      toast({
        title: "Error",
        description: "Failed to send template message",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTemplatePreview = () => {
    if (!selectedTemplateData) return null;

    let previewText = selectedTemplateData.body_text;
    variables.forEach((variable, index) => {
      if (variable.trim()) {
        previewText = previewText.replace(`{{${index + 1}}}`, variable);
      }
    });

    return (
      <div className="p-3 bg-gray-50 rounded border">
        <h4 className="font-medium mb-2">Preview:</h4>
        <div className="space-y-2">
          {selectedTemplateData.header_type && selectedTemplateData.header_type !== 'NONE' && (
            <div className="text-sm text-gray-600">
              <strong>Header:</strong> {selectedTemplateData.header_type}
              {headerMedia && (
                <span className="ml-2 text-green-600">✓ {headerMedia.name}</span>
              )}
            </div>
          )}
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {previewText.split(/(\*\*.*?\*\*)/).map((part, index) => {
              if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
              }
              return <span key={index}>{part}</span>;
            })}
          </div>
          {selectedTemplateData.footer_text && (
            <p className="text-xs text-gray-500 italic">{selectedTemplateData.footer_text}</p>
          )}
        </div>
      </div>
    );
  };

  const getAcceptAttribute = () => {
    const headerType = selectedTemplateData?.header_type;
    if (headerType === 'IMAGE') return 'image/*';
    if (headerType === 'VIDEO') return 'video/*';
    return '*/*';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send Template Message</DialogTitle>
          <DialogDescription>
            Send a template message to {contactName} ({contactPhone})
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Template Selection */}
          <div>
            <Label>Select Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Variables Input */}
          {selectedTemplateData && variables.length > 0 && (
            <div className="space-y-3">
              <Label>Template Variables</Label>
              {variables.map((variable, index) => (
                <div key={index}>
                  <Label className="text-sm">Variable {index + 1}</Label>
                  <Input
                    value={variable}
                    onChange={(e) => handleVariableChange(index, e.target.value)}
                    placeholder={`Enter value for {{${index + 1}}}`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Header Media Upload */}
          {selectedTemplateData?.header_type && 
           selectedTemplateData.header_type !== 'NONE' && 
           selectedTemplateData.header_type !== 'TEXT' && (
            <div>
              <Label>Header {selectedTemplateData.header_type}</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {headerMedia ? headerMedia.name : `Upload ${selectedTemplateData.header_type.toLowerCase()}`}
                </Button>
                {headerMedia && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setHeaderMedia(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept={getAcceptAttribute()}
                className="hidden"
              />
            </div>
          )}

          {/* Template Preview */}
          {selectedTemplateData && renderTemplatePreview()}
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSend} 
              disabled={!selectedTemplate || isSubmitting}
              className="flex-1 whatsapp-green hover:bg-green-600"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send Template'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
