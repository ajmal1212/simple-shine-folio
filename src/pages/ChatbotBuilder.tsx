
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChatbotFlowCanvas } from '@/components/chatbot/ChatbotFlow';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ChevronRight } from 'lucide-react';

const ChatbotBuilder = () => {
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get('flowId');

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Breadcrumbs */}
        <div className="p-4 border-b">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/flows">Flows</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {flowId ? 'Edit Flow' : 'Flow Builder'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Flow Canvas */}
        <div className="flex-1">
          <ReactFlowProvider>
            <ChatbotFlowCanvas />
          </ReactFlowProvider>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotBuilder;
