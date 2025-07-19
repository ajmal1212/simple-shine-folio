
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Link, Smartphone, Save, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [whatsappSettings, setWhatsappSettings] = useState({
    access_token: '',
    graph_api_base_url: 'https://graph.facebook.com',
    api_version: 'v18.0',
    waba_id: '',
    phone_number_id: '',
    app_id: '',
    hub_verify_token: ''
  });

  useEffect(() => {
    loadWhatsAppSettings();
  }, []);

  const loadWhatsAppSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .single();

      if (data && !error) {
        setWhatsappSettings({
          access_token: data.access_token || '',
          graph_api_base_url: data.graph_api_base_url || 'https://graph.facebook.com',
          api_version: data.api_version || 'v18.0',
          waba_id: data.waba_id || '',
          phone_number_id: data.phone_number_id || '',
          app_id: data.app_id || '',
          hub_verify_token: data.hub_verify_token || ''
        });
      }
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
    }
  };

  const handleWhatsAppSettingsChange = (field: string, value: string) => {
    setWhatsappSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveWhatsAppSettings = async () => {
    setIsSaving(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive"
        });
        return;
      }

      // Check if settings already exist
      const { data: existingSettings } = await supabase
        .from('whatsapp_settings')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      const settingsData = {
        user_id: user.user.id,
        ...whatsappSettings,
        updated_at: new Date().toISOString()
      };

      let error;
      if (existingSettings) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('whatsapp_settings')
          .update(settingsData)
          .eq('user_id', user.user.id);
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('whatsapp_settings')
          .insert(settingsData);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "WhatsApp settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
      toast({
        title: "Error",
        description: "Failed to save WhatsApp settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 h-full overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your workspace preferences and integrations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Workspace Settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="w-5 h-5 mr-2 text-gray-600" />
                  Workspace Settings
                </CardTitle>
                <CardDescription>Configure your workspace details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input id="workspace-name" defaultValue="ChatFlow360 Demo" readOnly />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" defaultValue="UTC-5 (Eastern Time)" readOnly />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="business-phone">Business Phone Number</Label>
                  <div className="flex items-center space-x-2">
                    <Input id="business-phone" defaultValue="+1 234 567 8900" className="flex-1" readOnly />
                    <Badge className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  </div>
                </div>

                <Button className="whatsapp-green hover:bg-green-600">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* WhatsApp Business API Integration */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="w-5 h-5 mr-2 text-gray-600" />
                  WhatsApp Business API
                </CardTitle>
                <CardDescription>Configure your WhatsApp Business API connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="access-token">Access Token</Label>
                    <div className="relative">
                      <Input
                        id="access-token"
                        type={showAccessToken ? "text" : "password"}
                        value={whatsappSettings.access_token}
                        onChange={(e) => handleWhatsAppSettingsChange('access_token', e.target.value)}
                        placeholder="Enter your access token"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowAccessToken(!showAccessToken)}
                      >
                        {showAccessToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="graph-api-url">Graph API Base URL</Label>
                    <Input
                      id="graph-api-url"
                      value={whatsappSettings.graph_api_base_url}
                      onChange={(e) => handleWhatsAppSettingsChange('graph_api_base_url', e.target.value)}
                      placeholder="https://graph.facebook.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-version">API Version</Label>
                    <Input
                      id="api-version"
                      value={whatsappSettings.api_version}
                      onChange={(e) => handleWhatsAppSettingsChange('api_version', e.target.value)}
                      placeholder="v18.0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="waba-id">WABA ID</Label>
                    <Input
                      id="waba-id"
                      value={whatsappSettings.waba_id}
                      onChange={(e) => handleWhatsAppSettingsChange('waba_id', e.target.value)}
                      placeholder="Enter WABA ID"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone-number-id">Phone Number ID</Label>
                    <Input
                      id="phone-number-id"
                      value={whatsappSettings.phone_number_id}
                      onChange={(e) => handleWhatsAppSettingsChange('phone_number_id', e.target.value)}
                      placeholder="Enter Phone Number ID"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="app-id">App ID</Label>
                    <Input
                      id="app-id"
                      value={whatsappSettings.app_id}
                      onChange={(e) => handleWhatsAppSettingsChange('app_id', e.target.value)}
                      placeholder="Enter App ID"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hub-verify-token">Hub Verify Token</Label>
                  <Input
                    id="hub-verify-token"
                    value={whatsappSettings.hub_verify_token}
                    onChange={(e) => handleWhatsAppSettingsChange('hub_verify_token', e.target.value)}
                    placeholder="Enter webhook verify token"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Webhook URL</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Use this URL in your WhatsApp Business API webhook configuration:
                  </p>
                  <code className="text-sm bg-blue-100 px-2 py-1 rounded">
                    https://ayqbuorewgfnssadtyee.supabase.co/functions/v1/whatsapp-webhook
                  </code>
                </div>

                <Button 
                  onClick={saveWhatsAppSettings}
                  disabled={isSaving}
                  className="whatsapp-green hover:bg-green-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save WhatsApp Settings'}
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-gray-600" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive email alerts for new messages</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Configure
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Browser Notifications</h3>
                    <p className="text-sm text-gray-600">Show desktop notifications</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Enable
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Mobile Push</h3>
                    <p className="text-sm text-gray-600">Push notifications on mobile app</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Setup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile & Integrations Sidebar */}
          <div className="space-y-8">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-600" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900">{profile?.full_name || 'User'}</h3>
                  <p className="text-sm text-gray-600">{profile?.email}</p>
                  <Badge className="mt-2 capitalize">{profile?.role}</Badge>
                </div>
                
                <Button className="w-full" variant="outline">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-gray-600" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Auth</h3>
                    <p className="text-sm text-gray-600">Extra security for your account</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">
                    Disabled
                  </Badge>
                </div>
                
                <Button className="w-full" variant="outline" size="sm">
                  Enable 2FA
                </Button>
                
                <Button className="w-full" variant="outline" size="sm">
                  Change Password
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Link className="w-5 h-5 mr-2 text-gray-600" />
                  Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">n8n</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Zapier</span>
                    <Badge className="bg-gray-100 text-gray-800">Available</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Google Sheets</span>
                    <Badge className="bg-gray-100 text-gray-800">Available</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">CRM</span>
                    <Badge className="bg-gray-100 text-gray-800">Available</Badge>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline" size="sm">
                  Add Integration
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
