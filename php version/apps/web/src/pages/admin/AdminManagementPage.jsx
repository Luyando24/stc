import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { toast } from 'sonner';
import { Search, Loader2, Edit, UserX, UserCheck, Trash2 } from 'lucide-react';

const AdminManagementPage = () => {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { currentAdmin, logActivity } = useAdminAuth();

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const filterStr = [];
      if (searchQuery) {
        filterStr.push(`(fullName ~ "${searchQuery}" || email ~ "${searchQuery}")`);
      }
      if (statusFilter) {
        filterStr.push(`status = "${statusFilter}"`);
      }
      
      const records = await pb.collection('admins').getFullList({
        filter: filterStr.join(' && '),
        sort: '-created',
        $autoCancel: false
      });
      setAdmins(records);
    } catch (err) {
      toast.error('Failed to load admins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [searchQuery, statusFilter]);

  const handleStatusChange = async (admin, newStatus) => {
    if (admin.email === 'sales@stc-logistics.com') {
      toast.error("Cannot modify Super Admin account");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to ${newStatus} this account?`)) return;

    try {
      await pb.collection('admins').update(admin.id, { status: newStatus }, { $autoCancel: false });
      
      // Determine action string for logging based on new status
      let action = 'edit';
      if (newStatus === 'deactivated') action = 'deactivate';
      if (newStatus === 'active') action = 'reactivate';
      if (newStatus === 'denied') action = 'deny';
      
      await logActivity(action, admin.id, { previousStatus: admin.status, newStatus });
      toast.success(`Account marked as ${newStatus}`);
      fetchAdmins();
    } catch (err) {
      toast.error('Failed to update account', { description: err.message });
    }
  };

  const getStatusBadge = (status) => {
    const classes = {
      'pending': 'badge-pending',
      'active': 'badge-active',
      'deactivated': 'badge-inactive',
      'denied': 'badge-denied'
    };
    return <span className={classes[status] || classes['pending']}>{status.toUpperCase()}</span>;
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Helmet>
        <title>{`Manage Admins | STC Logistics Admin`}</title>
      </Helmet>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Manage Admins</h1>
          <p className="text-muted-foreground">View and manage all system administrators and their roles.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-background border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="deactivated">Deactivated</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        {isLoading ? (
          <div className="flex justify-center items-center p-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No administrators found matching your criteria.
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="admin-th">User Info</th>
                <th className="admin-th">Department</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Created</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {admins.map(admin => {
                const isSuper = admin.email === 'sales@stc-logistics.com';
                return (
                  <tr key={admin.id} className="admin-tr">
                    <td className="admin-td">
                      <div className="font-semibold text-foreground">{admin.fullName} {isSuper && <span className="text-xs ml-2 text-primary">(Super Admin)</span>}</div>
                      <div className="text-xs text-muted-foreground">{admin.email} • {admin.phone}</div>
                    </td>
                    <td className="admin-td font-medium">{admin.department || 'All'}</td>
                    <td className="admin-td">{getStatusBadge(admin.status)}</td>
                    <td className="admin-td text-muted-foreground">{new Date(admin.created).toLocaleDateString()}</td>
                    <td className="admin-td text-right">
                      {!isSuper && (
                        <div className="flex justify-end gap-2">
                          {admin.status === 'active' && (
                            <button 
                              onClick={() => handleStatusChange(admin, 'deactivated')}
                              className="p-2 text-orange-600 hover:bg-orange-100 rounded-md transition-colors"
                              title="Deactivate"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          {(admin.status === 'deactivated' || admin.status === 'denied') && (
                            <button 
                              onClick={() => handleStatusChange(admin, 'active')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                              title="Reactivate"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminManagementPage;