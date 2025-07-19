import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TemplatePreview } from './TemplatePreview';
import { MediaUpload } from './MediaUpload';
import { ImageSelector } from './ImageSelector';
import { VariableManager } from './VariableManager';
import { ButtonManager } from './ButtonManager';
import { Template, ButtonComponent, Variable } from '@/types/template';
import { whatsappApi } from '@/services/whatsappApi';

interface TemplateBuilderProps {
  onSave: () => void;
  onCancel: () => void;
  editTemplate?: Template | null;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ onSave, onCancel, editTemplate }) => {
  const { toast } = useToast();
  const [template, setTemplate] = useState({
    name: '',
    category: 'UTILITY',
    language: 'en_US',
    header_type: 'NONE',
    header_content: '',
    header_media_file: null as File | null,
    header_handle: '', // Store the header handle from WhatsApp
    body_text: '',
    footer_text: '',
    buttons: [] as ButtonComponent[],
    variables: [] as Variable[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSessionId, setUploadSessionId] = useState<string>('');

  useEffect(() => {
    if (editTemplate) {
      setTemplate({
        name: editTemplate.name,
        category: editTemplate.category,
        language: editTemplate.language,
        header_type: editTemplate.header_type || 'NONE',
        header_content: editTemplate.header_content || '',
        header_media_file: null,
        header_handle: '',
        body_text: editTemplate.body_text,
        footer_text: editTemplate.footer_text || '',
        buttons: editTemplate.buttons || [],
        variables: editTemplate.variables || []
      });
    }
  }, [editTemplate]);

  const handleMediaUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError('');
    setUploadSessionId('');
    setUploadStatus('Validating file...');
    
    try {
      // Validate file
      const maxSize = 16 * 1024 * 1024; // 16MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 16MB');
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} not supported. Use: ${allowedTypes.join(', ')}`);
      }

      // Step 1: Create upload session
      setUploadStatus('Step 1/2: Creating upload session...');
      const sessionId = await whatsappApi.createMediaUploadSession(file);
      console.log('Upload session created:', sessionId);
      setUploadSessionId(sessionId);
      setUploadStatus('Step 1/2: Upload session created ✓');
      
      // Brief delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: Upload file content
      setUploadStatus('Step 2/2: Uploading file content...');
      const mediaHandle = await whatsappApi.uploadFileContent(sessionId, file);
      console.log('Media handle received:', mediaHandle);
      setUploadStatus('Step 2/2: File uploaded successfully ✓');
      
      // Update template with file and handle
      setTemplate(prev => ({
        ...prev,
        header_media_file: file,
        header_content: URL.createObjectURL(file),
        header_handle: mediaHandle
      }));
      
      setUploadStatus('Upload completed! Media handle generated.');
      toast({
        title: "Success",
        description: "Media uploaded and ready for template creation",
      });
      
    } catch (error) {
      console.error('Media upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Check if we can resume the upload
      if (uploadSessionId && errorMessage.includes('Network error')) {
        setUploadStatus('Upload interrupted. You can try to resume...');
        setUploadError(`${errorMessage} - Session ID: ${uploadSessionId}`);
      } else {
        setUploadError(errorMessage);
        setUploadStatus('Upload failed');
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!uploadSessionId || !template.header_media_file) {
      toast({
        title: "Error",
        description: "No upload session to resume",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadError('');
    
    try {
      setUploadStatus('Checking upload status...');
      const fileOffset = await whatsappApi.resumeUpload(uploadSessionId);
      
      if (fileOffset === 0) {
        setUploadStatus('Restarting upload from beginning...');
        const mediaHandle = await whatsappApi.uploadFileContent(uploadSessionId, template.header_media_file);
        
        setTemplate(prev => ({
          ...prev,
          header_handle: mediaHandle
        }));
        
        setUploadStatus('Upload completed! Media handle generated.');
        toast({
          title: "Success",
          description: "Upload resumed and completed successfully",
        });
      } else {
        setUploadStatus(`Resuming upload from ${fileOffset} bytes...`);
        const mediaHandle = await whatsappApi.resumeFileUpload(uploadSessionId, template.header_media_file, fileOffset);
        
        setTemplate(prev => ({
          ...prev,
          header_handle: mediaHandle
        }));
        
        setUploadStatus('Upload resumed and completed! Media handle generated.');
        toast({
          title: "Success",
          description: "Upload resumed and completed successfully",
        });
      }
      
      setUploadSessionId('');
    } catch (error) {
      console.error('Resume upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUploadError(errorMessage);
      setUploadStatus('Resume failed');
      
      toast({
        title: "Resume Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaFileSelect = async (file: File) => {
    await handleMediaUpload(file);
  };

  const validateTemplate = () => {
    if (!template.name.trim()) {
      toast({
        title: "Error",
        description: "Template name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!template.body_text.trim()) {
      toast({
        title: "Error",
        description: "Body text is required",
        variant: "destructive"
      });
      return false;
    }

    // Check if media header needs a handle
    if (template.header_type && template.header_type !== 'NONE' && template.header_type !== 'TEXT') {
      if (!template.header_handle) {
        toast({
          title: "Error",
          description: "Please upload a media file and wait for the header handle to be generated",
          variant: "destructive"
        });
        return false;
      }
    }

    // Validate variables match placeholders
    const bodyVariables = template.body_text.match(/\{\{\d+\}\}/g);
    if (bodyVariables && bodyVariables.length > 0) {
      if (!template.variables || template.variables.length < bodyVariables.length) {
        toast({
          title: "Error",
          description: `Your body text contains ${bodyVariables.length} variables but you've only defined ${template.variables?.length || 0}. Please add sample values for all variables.`,
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSaveTemplate = async () => {
    if (!validateTemplate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Convert buttons to WhatsApp format
      const whatsappButtons = template.buttons.map(btn => {
        const baseButton = {
          type: btn.type,
          text: btn.text
        };

        switch (btn.type) {
          case 'URL':
            return { ...baseButton, url: btn.url };
          case 'PHONE_NUMBER':
            return { ...baseButton, phone_number: btn.phone_number };
          case 'FLOW':
            return { 
              ...baseButton, 
              flow_id: btn.flow_id,
              flow_cta: btn.flow_cta,
              flow_action: btn.flow_action || 'navigate'
            };
          default:
            return baseButton;
        }
      });

      const templateData = {
        user_id: user.user.id,
        name: template.name,
        category: template.category,
        language: template.language,
        header_type: template.header_type === 'NONE' ? null : template.header_type,
        header_content: template.header_content || null,
        body_text: template.body_text,
        footer_text: template.footer_text || null,
        buttons: whatsappButtons.length > 0 ? whatsappButtons as any : null,
        variables: template.variables.length > 0 ? template.variables as any : null,
        status: 'DRAFT'
      };

      let savedTemplateId: string;

      if (editTemplate?.id) {
        // Update existing template
        const { error: updateError } = await supabase
          .from('whatsapp_templates')
          .update(templateData)
          .eq('id', editTemplate.id);
        
        if (updateError) throw updateError;
        savedTemplateId = editTemplate.id;
      } else {
        // Create new template
        const { data: insertData, error: insertError } = await supabase
          .from('whatsapp_templates')
          .insert(templateData)
          .select('id')
          .single();
        
        if (insertError) throw insertError;
        savedTemplateId = insertData.id;
      }

      // Now register the template with Meta WhatsApp API
      try {
        const templateForMeta = {
          ...template,
          header_media_handle: template.header_handle // Use the header handle instead of file
        };
        
        const metaPayload = await whatsappApi.buildTemplatePayload(templateForMeta);
        console.log('Submitting template to Meta:', metaPayload);
        
        const metaResponse = await whatsappApi.createTemplate(metaPayload);
        
        if (metaResponse.id) {
          // Update the template with WhatsApp template ID and set status to PENDING
          await supabase
            .from('whatsapp_templates')
            .update({ 
              whatsapp_template_id: metaResponse.id,
              status: 'PENDING'
            })
            .eq('id', savedTemplateId);

          toast({
            title: "Success",
            description: editTemplate 
              ? "Template updated and submitted to WhatsApp for approval" 
              : "Template created and submitted to WhatsApp for approval",
          });
        }
      } catch (metaError) {
        console.error('Error submitting to Meta:', metaError);
        
        // Template was saved locally but failed to submit to Meta
        toast({
          title: "Partial Success",
          description: `Template ${editTemplate ? 'updated' : 'saved'} locally, but failed to submit to WhatsApp: ${metaError instanceof Error ? metaError.message : 'Unknown error'}. You can submit it manually later.`,
          variant: "destructive"
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">{editTemplate ? 'Edit Template' : 'Template Builder'}</h1>
        </div>
        
        <Button 
          onClick={handleSaveTemplate} 
          disabled={isSubmitting}
          className="whatsapp-green hover:bg-green-600"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Submitting...' : (editTemplate ? 'Update & Submit' : 'Save & Submit')}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Builder Panel */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 max-w-2xl space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Template Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name" className="text-sm">Template Name *</Label>
                      <Input
                        id="template-name"
                        value={template.name}
                        onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="my_template_name"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-sm">Category *</Label>
                      <Select value={template.category} onValueChange={(value) => setTemplate(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTILITY">Utility</SelectItem>
                          <SelectItem value="MARKETING">Marketing</SelectItem>
                          <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="language" className="text-sm">Language</Label>
                    <Select value={template.language} onValueChange={(value) => setTemplate(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en_US">English (US)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Header with improved media upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Header (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="header-type" className="text-sm">Header Type</Label>
                    <Select 
                      value={template.header_type} 
                      onValueChange={(value) => setTemplate(prev => ({ 
                        ...prev, 
                        header_type: value,
                        header_content: '',
                        header_media_file: null,
                        header_handle: ''
                      }))}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">None</SelectItem>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="IMAGE">Image</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="DOCUMENT">Document</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {template.header_type && template.header_type !== 'NONE' && (
                    <>
                      {template.header_type === 'TEXT' ? (
                        <div>
                          <Label htmlFor="header-content" className="text-sm">Header Text</Label>
                          <Input
                            id="header-content"
                            value={template.header_content}
                            onChange={(e) => setTemplate(prev => ({ ...prev, header_content: e.target.value }))}
                            placeholder="Header text"
                            className="text-sm"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Label className="text-sm">Upload {template.header_type}</Label>
                          <input
                            type="file"
                            accept={template.header_type === 'IMAGE' ? 'image/*' : template.header_type === 'VIDEO' ? 'video/*' : '*/*'}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleMediaFileSelect(file);
                              }
                            }}
                            disabled={isUploading}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
                          />
                          
                          {/* Upload Status */}
                          {uploadStatus && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {isUploading && (
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                  )}
                                  <p className={`text-sm ${
                                    uploadError ? 'text-red-600' : 
                                    uploadStatus.includes('✓') ? 'text-green-600' : 
                                    'text-blue-600'
                                  }`}>
                                    {uploadStatus}
                                  </p>
                                </div>
                                
                                {/* Resume Upload Button */}
                                {uploadSessionId && uploadError && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleResumeUpload}
                                    disabled={isUploading}
                                    className="text-xs"
                                  >
                                    Resume Upload
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Upload Error */}
                          {uploadError && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {uploadError}
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {/* Show preview and header handle */}
                          {template.header_content && (
                            <div className="space-y-2">
                              {template.header_type === 'IMAGE' && (
                                <img src={template.header_content} alt="Header preview" className="max-w-32 max-h-32 object-cover rounded border" />
                              )}
                              <p className="text-xs text-gray-500">
                                {template.header_media_file ? `File: ${template.header_media_file.name}` : 'Preview'}
                              </p>
                            </div>
                          )}
                          
                          {/* Header Handle Display */}
                          {template.header_handle && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                              <Label className="text-sm font-medium text-green-800">Header Handle (Ready for WhatsApp):</Label>
                              <div className="mt-2 p-3 bg-white border rounded text-xs font-mono break-all text-green-700 max-h-32 overflow-y-auto">
                                {template.header_handle}
                              </div>
                              <p className="text-xs text-green-600 mt-2">✅ Media uploaded successfully and ready for template submission</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Body */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Body Text *</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={template.body_text}
                    onChange={(e) => setTemplate(prev => ({ ...prev, body_text: e.target.value }))}
                    placeholder="Your message body text here... Use {{1}}, {{2}} for variables. Use **text** for bold formatting."
                    rows={6}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Use {`{{1}}, {{2}}, {{3}}`} etc. for variables. Use **text** for bold formatting.
                  </p>
                </CardContent>
              </Card>

              {/* Variables */}
              <VariableManager
                variables={template.variables}
                onVariablesChange={(variables) => setTemplate(prev => ({ ...prev, variables }))}
              />

              {/* Footer */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Footer (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    value={template.footer_text}
                    onChange={(e) => setTemplate(prev => ({ ...prev, footer_text: e.target.value }))}
                    placeholder="Optional footer text"
                    className="text-sm"
                  />
                </CardContent>
              </Card>

              <ButtonManager
                buttons={template.buttons}
                onButtonsChange={(buttons) => setTemplate(prev => ({ ...prev, buttons }))}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Preview Panel - Fixed width */}
        <div className="w-80 border-l bg-gray-50 flex flex-col">
          <div className="p-4 border-b bg-white">
            <h3 className="font-semibold text-gray-900 mb-1 text-sm">Live Preview</h3>
            <p className="text-xs text-gray-600">See how your template will look on WhatsApp</p>
          </div>
          <div className="flex-1 p-4 flex items-start justify-center">
            <TemplatePreview template={template} />
          </div>
        </div>
      </div>
    </div>
  );
};
