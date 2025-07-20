
import React from 'react';
import { Image, FileText, Video, Mic, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/inbox';

const formatBoldText = (text: string) => {
  // Split text by **bold** pattern and render bold parts
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      // Remove ** and make bold
      const boldText = part.slice(2, -2);
      return <strong key={index}>{boldText}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

const formatTextWithLineBreaks = (text: string) => {
  // Split text by line breaks and render each line
  const lines = text.split(/\r?\n/);
  
  return lines.map((line, index) => (
    <span key={index}>
      {formatBoldText(line)}
      {index < lines.length - 1 && <br />}
    </span>
  ));
};

const processTemplateVariables = (text: string, variables?: string[]) => {
  if (!variables || variables.length === 0) return text;
  
  let processedText = text;
  variables.forEach((variable, index) => {
    const placeholder = `{{${index + 1}}}`;
    const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
    processedText = processedText.replace(regex, variable);
  });
  
  return processedText;
};

export const formatMessageContent = (message: Message) => {
  if (message.message_type === 'text') {
    const textContent = message.content.text || 'Text message';
    return <span className="whitespace-pre-wrap">{formatTextWithLineBreaks(textContent)}</span>;
  } else if (message.message_type === 'template') {
    // Process template with variables
    let templateContent = message.content.body_text || 'Template message';
    
    // Replace variables if they exist
    if (message.content.variables && Array.isArray(message.content.variables)) {
      templateContent = processTemplateVariables(templateContent, message.content.variables);
    }
    
    return (
      <div className="space-y-3">
        {/* Header Media */}
        {message.content.header_media_url && (
          <img 
            src={message.content.header_media_url} 
            alt="Template Header" 
            className="max-w-xs rounded-xl shadow-sm border"
          />
        )}
        {/* Template Body */}
        <span className="whitespace-pre-wrap">{formatTextWithLineBreaks(templateContent)}</span>
      </div>
    );
  } else if (message.message_type === 'image') {
    return (
      <div className="space-y-3">
        {(message.content.image?.link || message.content.link) && (
          <img 
            src={message.content.image?.link || message.content.link} 
            alt="Image" 
            className="max-w-xs rounded-xl shadow-sm border"
          />
        )}
        {!(message.content.image?.link || message.content.link) && (
          <div className="flex items-center p-3 bg-gray-100 rounded-xl">
            <Image className="w-5 h-5 mr-2 text-gray-500" />
            <span className="text-gray-600">Image</span>
          </div>
        )}
        {message.content.caption && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatTextWithLineBreaks(message.content.caption)}</p>
        )}
      </div>
    );
  } else if (message.message_type === 'document') {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border max-w-xs">
        <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{message.content.filename || 'Document'}</p>
          {message.content.caption && <p className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{formatTextWithLineBreaks(message.content.caption)}</p>}
        </div>
        {(message.content.document?.link || message.content.link) && (
          <Button size="sm" variant="ghost" onClick={() => window.open(message.content.document?.link || message.content.link, '_blank')} className="flex-shrink-0">
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  } else if (message.message_type === 'audio' || message.message_type === 'voice') {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border max-w-xs">
        <Mic className="w-8 h-8 text-green-500 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-900">Voice message</span>
          {(message.content.audio?.link || message.content.link) && (
            <audio controls className="mt-2 w-full">
              <source src={message.content.audio?.link || message.content.link} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      </div>
    );
  } else if (message.message_type === 'video') {
    return (
      <div className="space-y-3">
        {(message.content.video?.link || message.content.link) && (
          <video 
            src={message.content.video?.link || message.content.link} 
            controls 
            className="max-w-xs rounded-xl shadow-sm border"
          />
        )}
        {!(message.content.video?.link || message.content.link) && (
          <div className="flex items-center p-3 bg-gray-100 rounded-xl">
            <Video className="w-5 h-5 mr-2 text-gray-500" />
            <span className="text-gray-600">Video</span>
          </div>
        )}
        {message.content.caption && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatTextWithLineBreaks(message.content.caption)}</p>
        )}
      </div>
    );
  }
  return 'Message';
};
