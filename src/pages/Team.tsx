
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import UserManagement from '@/components/UserManagement';

const Team = () => {
  return (
    <DashboardLayout>
      <div className="p-8 h-full overflow-y-auto">
        <UserManagement />
      </div>
    </DashboardLayout>
  );
};

export default Team;
