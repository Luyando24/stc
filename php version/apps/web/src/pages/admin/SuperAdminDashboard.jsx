import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { Users, FileText, CheckCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const { currentAdmin, isSuperAdmin } = useAdminAuth();
  const [stats, setStats] = useState({
    pendingQuotes: 0,
    totalQuotes: 0,
    activeAdmins: 0,
    pendingAdmins: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch Quotes
        const filter = isSuperAdmin ? '' : `productCategory = "${currentAdmin.department}"`;
        const quotesReq = await pb.collection('quotes').getList(1, 1, { filter, $autoCancel: false });
        const pendingQuotesReq = await pb.collection('quotes').getList(1, 1, { 
          filter: isSuperAdmin ? 'status = "pending"' : `status = "pending" && productCategory = "${currentAdmin.department}"`,
          $autoCancel: false 
        });

        // Fetch Admins (Only Super Admin cares about global admin stats)
        let activeAdmins = 0;
        let pendingAdmins = 0;
        if (isSuperAdmin) {
          const activeAdminsReq = await pb.collection('admins').getList(1, 1, { filter: 'status = "active"', $autoCancel: false });
          const pendingAdminsReq = await pb.collection('admins').getList(1, 1, { filter: 'status = "pending"', $autoCancel: false });
          activeAdmins = activeAdminsReq.totalItems;
          pendingAdmins = pendingAdminsReq.totalItems;
        }

        setStats({
          totalQuotes: quotesReq.totalItems,
          pendingQuotes: pendingQuotesReq.totalItems,
          activeAdmins,
          pendingAdmins
        });
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isSuperAdmin, currentAdmin]);

  const StatCard = ({ title, value, icon: Icon, color, linkTo }) => {
    const content = (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-foreground">{isLoading ? '-' : value}</h3>
        </div>
      </div>
    );

    return linkTo ? <Link to={linkTo} className="block">{content}</Link> : content;
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Helmet>
        <title>{`Admin Dashboard | STC Logistics`}</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">
          Welcome back, {currentAdmin?.fullName.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground">
          {isSuperAdmin 
            ? "Here's an overview of your platform operations and team." 
            : `Managing operations for the ${currentAdmin?.department} department.`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Pending Quotes" 
          value={stats.pendingQuotes} 
          icon={FileText} 
          color="bg-yellow-100 text-yellow-700"
        />
        <StatCard 
          title="Total Quotes Processed" 
          value={stats.totalQuotes} 
          icon={CheckCircle} 
          color="bg-green-100 text-green-700" 
        />
        {isSuperAdmin && (
          <>
            <StatCard 
              title="Pending Admin Approvals" 
              value={stats.pendingAdmins} 
              icon={Users} 
              color="bg-red-100 text-red-700"
              linkTo="/admin/approval-requests"
            />
            <StatCard 
              title="Active Admins" 
              value={stats.activeAdmins} 
              icon={Package} 
              color="bg-blue-100 text-blue-700"
              linkTo="/admin/manage-admins"
            />
          </>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm p-8 mt-8">
        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-muted/50 rounded-xl border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-sm font-semibold">
            Create Manual Quote
          </button>
          <button className="flex items-center justify-center p-4 bg-muted/50 rounded-xl border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-sm font-semibold">
            View Recent Inquiries
          </button>
          {isSuperAdmin && (
            <Link to="/admin/manage-admins" className="flex items-center justify-center p-4 bg-muted/50 rounded-xl border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-sm font-semibold">
              Manage Department Roles
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;