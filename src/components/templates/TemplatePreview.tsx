
import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ButtonComponent {
  id: string;
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'FLOW';
  text: string;
  url?: string;
  phone_number?: string;
  flow_id?: string;
  flow_cta?: string;
  flow_action?: string;
}

interface TemplateData {
  header_type: string;
  header_content: string;
  body_text: string;
  footer_text: string;
  buttons: ButtonComponent[];
  variables: Array<{ name: string; sample: string }>;
}

interface TemplatePreviewProps {
  template: TemplateData;
  variableValues?: string[];
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, variableValues = [] }) => {
  const renderBodyWithVariables = (bodyText: string, variables: Array<{ name: string; sample: string }>, values: string[] = []) => {
    let processedText = bodyText;
    
    // Replace variables with their values or sample values
    variables.forEach((variable, index) => {
      const placeholder = `{{${index + 1}}}`;
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      const replacement = values[index] || variable.sample || `{{${variable.name}}}`;
      processedText = processedText.replace(regex, replacement);
    });
    
    // Convert **text** to bold
    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return processedText;
  };

  const processedBodyText = renderBodyWithVariables(
    template.body_text || 'Your message will appear here...', 
    template.variables || [], 
    variableValues
  );

  const getButtonIcon = (type: string) => {
    switch (type) {
      case 'URL': return '🔗';
      case 'PHONE_NUMBER': return '📞';
      case 'FLOW': return '⚡';
      case 'QUICK_REPLY': return '💬';
      default: return '💬';
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-xl overflow-hidden border-0" style={{ backgroundColor: '#f0f2f5' }}>
      {/* WhatsApp Header */}
      <div className="px-4 py-3 flex items-center" style={{ backgroundColor: '#075e54' }}>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-white font-medium text-sm">Business Name</div>
          <div className="text-white/70 text-xs">WhatsApp Business</div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div 
        className="p-4 min-h-[400px]" 
        style={{ 
          backgroundColor: '#e5ddd5', 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M0 0h40v40H0V0z"/%3E%3C/g%3E%3C/svg%3E")' 
        }}
      >
        {/* Message Bubble Container */}
        <div className="flex justify-end">
          <div className="max-w-[280px] w-full">
            {/* Main Message Bubble */}
            <div 
              className="rounded-lg px-3 py-2 shadow-sm relative break-words"
              style={{ backgroundColor: '#dcf8c6' }}
            >
              {/* Message tail */}
              <div 
                className="absolute -right-1 bottom-0 w-3 h-3"
                style={{
                  backgroundColor: '#dcf8c6',
                  clipPath: 'polygon(0 0, 100% 100%, 0 100%)'
                }}
              />
              
              {/* Header */}
              {template.header_content && template.header_type !== 'NONE' && (
                <div className="mb-2">
                  {template.header_type === 'TEXT' && (
                    <div className="font-semibold text-gray-900 text-sm mb-1 break-words">
                      {template.header_content}
                    </div>
                  )}
                  {template.header_type === 'IMAGE' && (
                    <div className="w-full rounded mb-2 overflow-hidden bg-gray-100 max-w-full">
                      {template.header_content ? (
                        <img 
                          src={template.header_content} 
                          alt="Header" 
                          className="w-full h-auto max-h-48 object-cover rounded"
                          style={{ maxWidth: '100%', height: 'auto' }}
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded">
                          <span className="text-gray-500 text-sm">📷 Image</span>
                        </div>
                      )}
                      <div className="w-full h-32 items-center justify-center hidden">
                        <span className="text-gray-500 text-sm">📷 Image</span>
                      </div>
                    </div>
                  )}
                  {template.header_type === 'VIDEO' && (
                    <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">🎥 Video</span>
                    </div>
                  )}
                  {template.header_type === 'DOCUMENT' && (
                    <div className="w-full h-16 bg-gray-200 rounded mb-2 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">📄 Document</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Body with properly rendered variables */}
              <div 
                className="text-gray-900 text-sm leading-relaxed break-words whitespace-pre-wrap word-wrap"
                style={{ 
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  hyphens: 'auto'
                }}
                dangerouslySetInnerHTML={{ __html: processedBodyText }}
              />
              
              {/* Footer */}
              {template.footer_text && (
                <div className="text-xs text-gray-600 mt-2 italic break-words word-wrap" style={{ wordWrap: 'break-word' }}>
                  {template.footer_text}
                </div>
              )}
              
              {/* Message Info */}
              <div className="flex justify-end items-center mt-1 gap-1">
                <span className="text-xs text-gray-600">12:34</span>
                <div className="flex">
                  <span className="text-blue-500 text-xs">✓✓</span>
                </div>
              </div>
            </div>
            
            {/* Modern WhatsApp-style Interactive Buttons */}
            {template.buttons && template.buttons.length > 0 && (
              <div className="mt-2 space-y-1">
                {template.buttons.slice(0, 3).map((button, index) => (
                  <div
                    key={button.id}
                    className="w-full bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center justify-center px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg flex-shrink-0">{getButtonIcon(button.type)}</span>
                        <span className="font-medium text-blue-600 text-sm text-center break-words flex-1">
                          {button.text}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
