import React from 'react';
import { MessageSquare, Users, Bell, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Conversations',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Contacts',
      value: '1,423',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Messages Sent',
      value: '12,847',
      change: '+15.3%',
      trend: 'up',
      icon: Bell,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Response Rate',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'message',
      contact: 'Sarah Johnson',
      action: 'Sent a message',
      time: '2 minutes ago',
      status: 'delivered'
    },
    {
      id: 2,
      type: 'contact',
      contact: 'Mike Chen',
      action: 'Added to contacts',
      time: '15 minutes ago',
      status: 'completed'
    },
    {
      id: 3,
      type: 'broadcast',
      contact: '247 recipients',
      action: 'Broadcast campaign sent',
      time: '1 hour ago',
      status: 'in-progress'
    },
    {
      id: 4,
      type: 'automation',
      contact: 'Welcome Flow',
      action: 'Automation triggered',
      time: '2 hours ago',
      status: 'completed'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 h-full overflow-y-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your WhatsApp business.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{stat.change} from last month</span>
                    </p>
                  </div>
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 ml-3`}>
                    <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          {/* Recent Activity */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg md:text-xl">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 md:space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0">
                      {activity.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {activity.status === 'delivered' && (
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                      )}
                      {activity.status === 'in-progress' && (
                        <Clock className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        <span className="font-semibold">{activity.contact}</span> - {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
              <CardDescription>Common tasks to get you started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <button className="p-3 md:p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group">
                  <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-gray-900 text-sm md:text-base">Send Broadcast</h3>
                  <p className="text-xs md:text-sm text-gray-600">Message multiple contacts</p>
                </button>
                
                <button className="p-3 md:p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group">
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-gray-900 text-sm md:text-base">Add Contacts</h3>
                  <p className="text-xs md:text-sm text-gray-600">Import or create contacts</p>
                </button>
                
                <button className="p-3 md:p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group">
                  <Bell className="w-6 h-6 md:w-8 md:h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-gray-900 text-sm md:text-base">Create Automation</h3>
                  <p className="text-xs md:text-sm text-gray-600">Build automated flows</p>
                </button>
                
                <button className="p-3 md:p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-gray-900 text-sm md:text-base">View Analytics</h3>
                  <p className="text-xs md:text-sm text-gray-600">Track performance</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;