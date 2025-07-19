import React from 'react';
import { Eye, Send, Trash2, MessageSquare, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Template } from '@/types/template';

interface TemplateListProps {
  templates: Template[];
  onDelete: (templateId: string) => void;
  onSubmitToWhatsApp: (template: Template) => void;
  onEdit: (template: Template) => void;
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-800';
    case 'REJECTED': return 'bg-red-100 text-red-800';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const renderMobilePreview = (template: Template) => {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden border">
      <div className="bg-green-600 text-white p-3 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2" />
        <span className="font-medium">WhatsApp Business</span>
      </div>
      
      <div className="p-4 bg-gray-50">
        <div className="bg-white rounded-lg p-3 shadow-sm max-w-xs">
          {template.header_content && template.header_type !== 'NONE' && (
            <div className="mb-2">
              {template.header_type === 'TEXT' && (
                <div className="font-semibold text-gray-800">
                  {template.header_content}
                </div>
              )}
              {template.header_type === 'IMAGE' && (
                <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center mb-2">
                  <span className="text-gray-500 text-sm">Image</span>
                </div>
              )}
              {template.header_type === 'VIDEO' && (
                <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center mb-2">
                  <span className="text-gray-500 text-sm">Video</span>
                </div>
              )}
              {template.header_type === 'DOCUMENT' && (
                <div className="w-full h-16 bg-gray-200 rounded flex items-center justify-center mb-2">
                  <span className="text-gray-500 text-sm">Document</span>
                </div>
              )}
            </div>
          )}
          
          <div className="text-gray-800 text-sm whitespace-pre-wrap">
            {template.body_text}
          </div>
          
          {template.footer_text && (
            <div className="text-xs text-gray-500 mt-2">
              {template.footer_text}
            </div>
          )}
          
          {template.buttons && Array.isArray(template.buttons) && template.buttons.length > 0 && (
            <div className="mt-3 space-y-1">
              {template.buttons.map((button: any, index: number) => (
                <button
                  key={index}
                  className={`w-full p-2 text-sm border rounded text-left ${
                    button.type === 'QUICK_REPLY' 
                      ? 'text-blue-600 border-blue-200 hover:bg-blue-50' 
                      : button.type === 'URL'
                      ? 'text-green-600 border-green-200 hover:bg-green-50'
                      : button.type === 'PHONE_NUMBER'
                      ? 'text-purple-600 border-purple-200 hover:bg-purple-50'
                      : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {button.text}
                  {button.type === 'URL' && <span className="text-xs ml-1">🔗</span>}
                  {button.type === 'PHONE_NUMBER' && <span className="text-xs ml-1">📞</span>}
                </button>
              ))}
            </div>
          )}
          
          <div className="flex justify-end mt-2">
            <span className="text-xs text-gray-400">12:34 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onDelete,
  onSubmitToWhatsApp,
  onEdit,
  selectedTemplate,
  setSelectedTemplate
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">{template.name}</CardTitle>
              <Badge className={getStatusColor(template.status)}>
                {template.status}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-2">
              <span className="capitalize">{template.category.toLowerCase()}</span>
              <span>•</span>
              <span>{template.language}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600 line-clamp-3">
                {template.body_text}
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-gray-500">
                  {new Date(template.created_at).toLocaleDateString()}
                </span>
                
                <div className="flex items-center gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(template)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Template Preview</DialogTitle>
                      </DialogHeader>
                      {selectedTemplate && renderMobilePreview(selectedTemplate)}
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  {template.status === 'DRAFT' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onSubmitToWhatsApp(template)}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
