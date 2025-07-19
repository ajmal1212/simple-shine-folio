import React, { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TemplateBuilder } from '@/components/templates/TemplateBuilder';
import { TemplateList } from '@/components/templates/TemplateList';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { whatsappApi } from '@/services/whatsappApi';
import { Template, ButtonComponent, Variable } from '@/types/template';

const Templates = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database response to Template interface with safe type conversion
      const mappedTemplates: Template[] = (data || []).map(dbTemplate => {
        // Safely convert buttons
        let buttons: ButtonComponent[] = [];
        if (dbTemplate.buttons && Array.isArray(dbTemplate.buttons)) {
          buttons = (dbTemplate.buttons as unknown as ButtonComponent[]).filter((btn: ButtonComponent) => 
            btn && typeof btn === 'object' && btn.id && btn.type && btn.text
          );
        }

        // Safely convert variables
        let variables: Variable[] = [];
        if (dbTemplate.variables && Array.isArray(dbTemplate.variables)) {
          variables = (dbTemplate.variables as unknown as Variable[]).filter((variable: Variable) => 
            variable && typeof variable === 'object' && variable.name && variable.sample
          );
        }

        return {
          id: dbTemplate.id,
          name: dbTemplate.name,
          category: dbTemplate.category,
          language: dbTemplate.language,
          header_type: dbTemplate.header_type || undefined,
          header_content: dbTemplate.header_content || undefined,
          body_text: dbTemplate.body_text,
          footer_text: dbTemplate.footer_text || undefined,
          buttons,
          variables,
          status: dbTemplate.status,
          created_at: dbTemplate.created_at,
          whatsapp_template_id: dbTemplate.whatsapp_template_id || undefined
        };
      });
      
      setTemplates(mappedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    }
  };

  const extractVariablesFromText = (text: string): Variable[] => {
    const variables: Variable[] = [];
    const matches = text.match(/\{\{\d+\}\}/g);
    
    if (matches) {
      const uniqueNumbers = [...new Set(matches.map(match => parseInt(match.replace(/[{}]/g, ''))))];
      uniqueNumbers.sort((a, b) => a - b);
      
      uniqueNumbers.forEach((number) => {
        variables.push({
          name: `variable_${number}`,
          sample: `Sample ${number}`
        });
      });
    }
    
    return variables;
  };

  const syncWhatsAppTemplates = async () => {
    setIsSyncing(true);
    try {
      const result = await whatsappApi.syncTemplatesFromWhatsApp();
      
      if (result.data && Array.isArray(result.data)) {
        let syncedCount = 0;
        
        for (const template of result.data) {
          try {
            // Check if template already exists
            const { data: existingTemplate } = await supabase
              .from('whatsapp_templates')
              .select('id')
              .eq('whatsapp_template_id', template.id)
              .single();

            if (!existingTemplate) {
              // Parse template components
              let headerType = 'NONE';
              let headerContent = '';
              let bodyText = '';
              let footerText = '';
              let buttons: any[] = [];
              let allVariables: Variable[] = [];

              if (template.components) {
                for (const component of template.components) {
                  switch (component.type) {
                    case 'HEADER':
                      headerType = component.format || 'TEXT';
                      if (component.text) {
                        headerContent = component.text;
                        // Extract variables from header text
                        const headerVars = extractVariablesFromText(component.text);
                        allVariables.push(...headerVars);
                      }
                      break;
                    case 'BODY':
                      bodyText = component.text || '';
                      // Extract variables from body text
                      const bodyVars = extractVariablesFromText(bodyText);
                      allVariables.push(...bodyVars);
                      break;
                    case 'FOOTER':
                      footerText = component.text || '';
                      // Extract variables from footer text
                      const footerVars = extractVariablesFromText(footerText);
                      allVariables.push(...footerVars);
                      break;
                    case 'BUTTONS':
                      buttons = component.buttons?.map((btn: any, index: number) => ({
                        id: `btn_${index}`,
                        type: btn.type,
                        text: btn.text,
                        url: btn.url,
                        phone_number: btn.phone_number,
                        flow_id: btn.flow_id,
                        flow_cta: btn.flow_cta,
                        flow_action: btn.flow_action
                      })) || [];
                      break;
                  }
                }
              }

              // Remove duplicates and sort variables
              const uniqueVariables = allVariables.reduce((acc: Variable[], current) => {
                const exists = acc.find(v => v.name === current.name);
                if (!exists) {
                  acc.push(current);
                }
                return acc;
              }, []);

              // Get current user
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('User not authenticated');

              // Insert template into database with proper language code - cast variables to Json
              const { error: insertError } = await supabase
                .from('whatsapp_templates')
                .insert({
                  name: template.name,
                  category: template.category || 'MARKETING',
                  language: template.language || 'en_US',
                  header_type: headerType,
                  header_content: headerContent,
                  body_text: bodyText,
                  footer_text: footerText,
                  buttons: buttons.length > 0 ? buttons : null,
                  variables: uniqueVariables.length > 0 ? uniqueVariables as any : null,
                  status: template.status || 'APPROVED',
                  whatsapp_template_id: template.id
                });

              if (!insertError) {
                syncedCount++;
                console.log(`Synced template: ${template.name} with ${uniqueVariables.length} variables`);
              } else {
                console.error('Error inserting template:', template.name, insertError);
              }
            }
          } catch (templateError) {
            console.error('Error processing template:', template.name, templateError);
          }
        }

        toast({
          title: "Success",
          description: `Synced ${syncedCount} new templates from WhatsApp`,
        });
        
        loadTemplates();
      } else {
        toast({
          title: "Info",
          description: "No new templates found to sync",
        });
      }
    } catch (error) {
      console.error('Error syncing templates:', error);
      toast({
        title: "Error",
        description: "Failed to sync templates from WhatsApp. Please check your WhatsApp settings.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const submitToWhatsApp = async (template: Template) => {
    try {
      const templateData = {
        name: template.name,
        category: template.category.toUpperCase(),
        language: template.language,
        components: []
      };

      // Add header component
      if (template.header_type && template.header_content) {
        templateData.components.push({
          type: 'HEADER',
          format: template.header_type,
          text: template.header_type === 'TEXT' ? template.header_content : undefined,
          example: template.header_type !== 'TEXT' ? {
            header_handle: [template.header_content]
          } : undefined
        });
      }

      // Add body component
      templateData.components.push({
        type: 'BODY',
        text: template.body_text
      });

      // Add footer component
      if (template.footer_text) {
        templateData.components.push({
          type: 'FOOTER',
          text: template.footer_text
        });
      }

      // Add buttons component
      if (template.buttons && Array.isArray(template.buttons) && template.buttons.length > 0) {
        templateData.components.push({
          type: 'BUTTONS',
          buttons: template.buttons
        });
      }

      const response = await whatsappApi.createTemplate(templateData);
      
      if (response.id) {
        // Update template with WhatsApp ID
        await supabase
          .from('whatsapp_templates')
          .update({ 
            whatsapp_template_id: response.id,
            status: 'PENDING'
          })
          .eq('id', template.id);

        toast({
          title: "Success",
          description: "Template submitted to WhatsApp for approval",
        });
        loadTemplates();
      }
    } catch (error) {
      console.error('Error submitting template:', error);
      toast({
        title: "Error",
        description: "Failed to submit template to WhatsApp",
        variant: "destructive"
      });
    }
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setIsBuilderOpen(true);
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.body_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isBuilderOpen) {
    return (
      <DashboardLayout>
        <div className="h-full">
          <TemplateBuilder
            editTemplate={editingTemplate}
            onSave={() => {
              setIsBuilderOpen(false);
              setEditingTemplate(null);
              loadTemplates();
            }}
            onCancel={() => {
              setIsBuilderOpen(false);
              setEditingTemplate(null);
            }}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp Templates</h1>
            <p className="text-gray-600 mt-2">Create and manage your WhatsApp message templates</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={syncWhatsAppTemplates}
              disabled={isSyncing}
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync WhatsApp Templates'}
            </Button>
            
            <Button 
              onClick={() => {
                setEditingTemplate(null);
                setIsBuilderOpen(true);
              }}
              className="whatsapp-green hover:bg-green-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search criteria' : 'Create your first template or sync from WhatsApp to get started'}
            </p>
          </div>
        ) : (
          <TemplateList
            templates={filteredTemplates}
            onDelete={deleteTemplate}
            onSubmitToWhatsApp={submitToWhatsApp}
            onEdit={handleEditTemplate}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Templates;
