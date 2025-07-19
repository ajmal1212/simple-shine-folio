
import React from 'react';
import { Zap, Plus, Play, Pause, Settings, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const Automations = () => {
  const automations = [
    {
      id: '1',
      name: 'Welcome New Customers',
      description: 'Send welcome message to new contacts',
      status: 'active',
      trigger: 'New Contact Added',
      actions: 3,
      totalTriggered: 847,
      lastTriggered: '2 minutes ago'
    },
    {
      id: '2',
      name: 'Follow-up Inactive Users',
      description: 'Re-engage users who haven\'t responded in 7 days',
      status: 'active',
      trigger: 'Inactivity (7 days)',
      actions: 2,
      totalTriggered: 234,
      lastTriggered: '1 hour ago'
    },
    {
      id: '3',
      name: 'Sales Lead Qualification',
      description: 'Qualify leads based on keyword responses',
      status: 'paused',
      trigger: 'Keyword: "pricing"',
      actions: 5,
      totalTriggered: 156,
      lastTriggered: '3 days ago'
    },
    {
      id: '4',
      name: 'Support Ticket Routing',
      description: 'Auto-assign support requests to available agents',
      status: 'draft',
      trigger: 'Keyword: "help"',
      actions: 4,
      totalTriggered: 0,
      lastTriggered: 'Never'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'draft':
        return <Settings className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
            <p className="text-gray-600 mt-2">Create automated workflows to engage customers and streamline processes</p>
          </div>
          
          <Button size="sm" className="whatsapp-green hover:bg-green-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Automation
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Automations</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Triggered</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">3,247</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Play className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">94.8%</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">15,847</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Automations List */}
        <Card className="border-0 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-gray-600" />
              All Automations
            </CardTitle>
            <CardDescription>Manage your automated workflows and monitor performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {automations.map((automation) => (
                <div key={automation.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">{automation.name}</h3>
                        <Badge className={`${getStatusColor(automation.status)} flex items-center space-x-1`}>
                          {getStatusIcon(automation.status)}
                          <span>{automation.status.charAt(0).toUpperCase() + automation.status.slice(1)}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{automation.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900">{automation.trigger}</p>
                          <p>Trigger</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{automation.actions}</p>
                          <p>Actions</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{automation.totalTriggered.toLocaleString()}</p>
                          <p>Total Triggered</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{automation.lastTriggered}</p>
                          <p>Last Triggered</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {automation.status === 'active' && (
                        <Button variant="outline" size="sm">
                          <Pause className="w-4 h-4 mr-2" />
                          Pause
                        </Button>
                      )}
                      {automation.status === 'paused' && (
                        <Button size="sm" className="whatsapp-green hover:bg-green-600">
                          <Play className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                      )}
                      {automation.status === 'draft' && (
                        <Button size="sm" className="whatsapp-green hover:bg-green-600">
                          <Play className="w-4 h-4 mr-2" />
                          Activate
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Automation Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Lead Nurturing</h3>
                <p className="text-sm text-gray-600">Automatically follow up with leads and move them through your sales funnel</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Customer Support</h3>
                <p className="text-sm text-gray-600">Route support tickets and provide instant responses to common questions</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 whatsapp-green rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Custom Workflow</h3>
                <p className="text-sm text-gray-600">Build your own automation from scratch with our visual flow builder</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Automations;
