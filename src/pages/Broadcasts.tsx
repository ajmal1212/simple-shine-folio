
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, Send, Users, Calendar, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const Broadcasts = () => {
  const navigate = useNavigate();
  
  const campaigns = [
    {
      id: '1',
      name: 'Summer Sale 2024',
      status: 'sent',
      recipients: 1247,
      delivered: 1198,
      read: 856,
      sentAt: '2 hours ago',
      template: 'summer_sale_promo'
    },
    {
      id: '2',
      name: 'New Product Launch',
      status: 'scheduled',
      recipients: 2156,
      delivered: 0,
      read: 0,
      sentAt: 'Tomorrow, 9:00 AM',
      template: 'product_announcement'
    },
    {
      id: '3',
      name: 'Weekly Newsletter',
      status: 'draft',
      recipients: 0,
      delivered: 0,
      read: 0,
      sentAt: 'Not scheduled',
      template: 'newsletter_template'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Broadcast Messages</h1>
            <p className="text-gray-600 mt-2">Send WhatsApp template messages to multiple contacts</p>
          </div>
          
          <Button 
            size="sm" 
            className="whatsapp-green hover:bg-green-600"
            onClick={() => navigate('/broadcasts/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">47</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">24,847</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Delivery Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">96.2%</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <BarChart className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Read Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">78.4%</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-gray-600" />
              Recent Campaigns
            </CardTitle>
            <CardDescription>Monitor your broadcast message performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 border border-gray-200 rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900">{campaign.recipients.toLocaleString()}</p>
                          <p>Recipients</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{campaign.delivered.toLocaleString()}</p>
                          <p>Delivered</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{campaign.read.toLocaleString()}</p>
                          <p>Read</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{campaign.sentAt}</p>
                          <p>Sent</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {campaign.status === 'sent' && (
                        <Button variant="outline" size="sm">
                          <BarChart className="w-4 h-4 mr-2" />
                          Reports
                        </Button>
                      )}
                      {campaign.status === 'draft' && (
                        <Button size="sm" className="whatsapp-green hover:bg-green-600">
                          <Send className="w-4 h-4 mr-2" />
                          Send Now
                        </Button>
                      )}
                      {campaign.status === 'scheduled' && (
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          Reschedule
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/broadcasts/create')}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 whatsapp-green rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Create New Campaign</h3>
                <p className="text-sm text-gray-600">Start a new broadcast message campaign</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Manage Templates</h3>
                <p className="text-sm text-gray-600">Create and edit message templates</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-sm text-gray-600">View detailed campaign performance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Broadcasts;
