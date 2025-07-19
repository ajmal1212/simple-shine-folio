import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, FileText, Send, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WhatsAppAPI } from '@/services/whatsappApi';

interface Template {
  id: string;
  name: string;
  body_text: string;
  header_type: string | null;
  header_content: string | null;
  variables: any;
  category: string;
  language: string;
}

interface Contact {
  phone_number: string;
  variables?: { [key: string]: string };
}

const CreateCampaign = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Campaign data
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [variables, setVariables] = useState<string[]>([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      extractVariables();
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('status', 'APPROVED');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    }
  };

  const extractVariables = () => {
    if (!selectedTemplate) return;
    
    const bodyText = selectedTemplate.body_text;
    const variableMatches = bodyText.match(/\{\{\d+\}\}/g);
    const uniqueVariables = [...new Set(variableMatches || [])];
    setVariables(uniqueVariables);
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const phoneIndex = headers.findIndex(h => 
      h.toLowerCase().includes('phone') || 
      h.toLowerCase().includes('mobile') || 
      h.toLowerCase().includes('number')
    );

    if (phoneIndex === -1) {
      toast({
        title: "Error",
        description: "CSV must contain a column with phone numbers (phone, mobile, or number)",
        variant: "destructive",
      });
      return;
    }

    const parsedContacts: Contact[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === headers.length && values[phoneIndex]) {
        const contact: Contact = {
          phone_number: values[phoneIndex],
          variables: {}
        };

        // Map variables from CSV columns
        variables.forEach(variable => {
          const variableNumber = variable.replace(/[{}]/g, '');
          const columnName = `var${variableNumber}`;
          const columnIndex = headers.findIndex(h => h.toLowerCase() === columnName.toLowerCase());
          
          if (columnIndex !== -1 && values[columnIndex]) {
            contact.variables![variable] = values[columnIndex];
          }
        });

        parsedContacts.push(contact);
      }
    }

    setContacts(parsedContacts);
    toast({
      title: "Success",
      description: `Loaded ${parsedContacts.length} contacts from CSV`,
    });
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !campaignName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a campaign name",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 2 && !selectedTemplate) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep === 3 && contacts.length === 0) {
      toast({
        title: "Error",
        description: "Please upload contacts CSV",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const createCampaign = async () => {
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      const whatsappApi = new WhatsAppAPI();
      let mediaId = '';

      // Upload media if template has media header and media file is selected
      if (selectedTemplate.header_type === 'IMAGE' && mediaFile) {
        try {
          console.log('Uploading media file for campaign...');
          mediaId = await whatsappApi.uploadMediaForTemplate(mediaFile);
          console.log('Media uploaded with ID:', mediaId);
          toast({
            title: "Success",
            description: "Media uploaded successfully",
          });
        } catch (error) {
          console.error('Media upload error:', error);
          toast({
            title: "Warning",
            description: "Failed to upload media. Sending campaign without media header.",
            variant: "destructive",
          });
          // Continue without media instead of failing completely
        }
      }

      // Send messages to all contacts
      let successCount = 0;
      let errorCount = 0;

      for (const contact of contacts) {
        try {
          // Prepare template data
          const templateData: any = {
            name: selectedTemplate.name,
            language: {
              code: selectedTemplate.language
            }
          };

          // Add components if variables exist or media is available
          if (variables.length > 0 || mediaId) {
            templateData.components = [];

            // Add header component with media if exists
            if (selectedTemplate.header_type === 'IMAGE' && mediaId) {
              templateData.components.push({
                type: 'header',
                parameters: [
                  {
                    type: 'image',
                    image: {
                      id: mediaId
                    }
                  }
                ]
              });
            }

            // Add body component with variables if exists
            if (variables.length > 0) {
              const bodyParameters = variables.map(variable => ({
                type: 'text',
                text: contact.variables?.[variable] || variable
              }));

              templateData.components.push({
                type: 'body',
                parameters: bodyParameters
              });
            }
          }

          console.log(`Sending template to ${contact.phone_number}:`, templateData);
          await whatsappApi.sendTemplate(contact.phone_number, templateData);
          successCount++;
        } catch (error) {
          console.error(`Error sending to ${contact.phone_number}:`, error);
          errorCount++;
        }
      }

      toast({
        title: "Campaign Completed",
        description: `Sent to ${successCount} contacts. ${errorCount} failed.`,
      });

      navigate('/broadcasts');
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Campaign Name';
      case 2: return 'Select Template';
      case 3: return 'Upload Contacts';
      case 4: return 'Review & Send';
      default: return 'Create Campaign';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/broadcasts')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Broadcasts
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
                <p className="text-gray-600 mt-2">Step {currentStep} of 4: {getStepTitle()}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-8">
              {/* Step 1: Campaign Name */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Campaign Name</h2>
                    <p className="text-gray-600">Give your campaign a descriptive name</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                      id="campaign-name"
                      placeholder="e.g., Summer Sale 2024"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Select Template */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Select Template</h2>
                    <p className="text-gray-600">Choose an approved WhatsApp template for your campaign</p>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Template</Label>
                    <Select onValueChange={(value) => {
                      const template = templates.find(t => t.id === value);
                      setSelectedTemplate(template || null);
                    }}>
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">Template Preview</h3>
                      <div className="text-sm text-gray-600 whitespace-pre-wrap">
                        {selectedTemplate.header_content && (
                          <div className="mb-2 font-medium">
                            {selectedTemplate.header_type === 'IMAGE' ? '[IMAGE]' : selectedTemplate.header_content}
                          </div>
                        )}
                        {selectedTemplate.body_text}
                      </div>
                      
                      {variables.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700">Variables detected:</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {variables.map((variable) => (
                              <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {variable}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Upload Contacts */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Upload Contacts</h2>
                    <p className="text-gray-600">Upload a CSV file with phone numbers and variable values</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csv-upload">CSV File</Label>
                      <div className="mt-2">
                        <input
                          id="csv-upload"
                          type="file"
                          accept=".csv"
                          onChange={handleCsvUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('csv-upload')?.click()}
                          className="w-full max-w-md"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {csvFile ? csvFile.name : 'Upload CSV File'}
                        </Button>
                      </div>
                    </div>

                    {variables.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">CSV Format Required</h3>
                        <p className="text-sm text-blue-800 mb-3">
                          Your CSV must include these columns:
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• <code>phone</code> or <code>mobile</code> or <code>number</code> - Phone numbers</li>
                          {variables.map((variable, index) => (
                            <li key={variable}>
                              • <code>var{variable.replace(/[{}]/g, '')}</code> - Values for {variable}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {contacts.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h3 className="font-medium text-green-900 mb-2">
                          {contacts.length} Contacts Loaded
                        </h3>
                        <div className="text-sm text-green-800">
                          <p>Sample contact:</p>
                          <p>Phone: {contacts[0].phone_number}</p>
                          {Object.keys(contacts[0].variables || {}).length > 0 && (
                            <p>Variables: {JSON.stringify(contacts[0].variables)}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Media Upload for Templates with Image Header */}
                    {selectedTemplate?.header_type === 'IMAGE' && (
                      <div className="space-y-2">
                        <Label htmlFor="media-upload">Header Media (Image)</Label>
                        <div className="mt-2">
                          <input
                            id="media-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleMediaUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('media-upload')?.click()}
                            className="w-full max-w-md"
                          >
                            <Image className="w-4 h-4 mr-2" />
                            {mediaFile ? mediaFile.name : 'Upload Header Image'}
                          </Button>
                        </div>
                        {mediaFile && (
                          <p className="text-sm text-green-600">
                            ✓ Image selected: {mediaFile.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review & Send */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Review & Send</h2>
                    <p className="text-gray-600">Review your campaign details before sending</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Campaign Details</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {campaignName}</p>
                        <p><strong>Template:</strong> {selectedTemplate?.name}</p>
                        <p><strong>Recipients:</strong> {contacts.length} contacts</p>
                        {selectedTemplate?.header_type === 'IMAGE' && mediaFile && (
                          <p><strong>Media:</strong> {mediaFile.name}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h3 className="font-medium text-yellow-900 mb-2">⚠️ Important</h3>
                      <p className="text-sm text-yellow-800">
                        Once sent, this campaign cannot be stopped. Make sure all details are correct.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button onClick={nextStep}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    onClick={createCampaign}
                    disabled={loading}
                    className="whatsapp-green hover:bg-green-600"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Campaign
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateCampaign;
