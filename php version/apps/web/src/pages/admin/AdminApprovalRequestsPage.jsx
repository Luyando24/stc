import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { useAdminAuth } from '@/contexts/AdminAuthContext.jsx';
import { toast } from 'sonner';
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const AdminApprovalRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null);
  const { currentAdmin, logActivity } = useAdminAuth();

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('admins').getFullList({
        filter: 'status = "pending"',
        sort: '-created',
        $autoCancel: false
      });
      setRequests(records);
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (adminId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this admin request?`)) return;
    
    setIsProcessing(adminId);
    try {
      const newStatus = action === 'approve' ? 'active' : 'denied';
      await pb.collection('admins').update(adminId, {
        status: newStatus,
        approvedBy: currentAdmin.id,
        approvedAt: action === 'approve' ? new Date().toISOString() : null
      }, { $autoCancel: false });
      
      await logActivity(action, adminId, { statusChangedTo: newStatus });
      
      toast.success(`Admin request ${action}d successfully`);
      setRequests(requests.filter(req => req.id !== adminId));
    } catch (err) {
      toast.error(`Failed to ${action} request`, { description: err.message });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Helmet>
        <title>{`Approval Requests | STC Logistics Admin`}</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Approval Requests</h1>
          <p className="text-muted-foreground">Review and manage pending admin account registrations.</p>
        </div>
      </div>

      <div className="admin-table-container">
        {isLoading ? (
          <div className="flex justify-center items-center p-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Pending Requests</h3>
            <p className="text-muted-foreground mt-1">All admin registrations have been reviewed.</p>
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="admin-th">Name</th>
                <th className="admin-th">Email</th>
                <th className="admin-th">Phone</th>
                <th className="admin-th">Department</th>
                <th className="admin-th">Request Date</th>
                <th className="admin-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {requests.map(req => (
                <tr key={req.id} className="admin-tr">
                  <td className="admin-td font-medium">{req.fullName}</td>
                  <td className="admin-td">{req.email}</td>
                  <td className="admin-td">{req.phone}</td>
                  <td className="admin-td">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-semibold">
                      {req.department}
                    </span>
                  </td>
                  <td className="admin-td">{new Date(req.created).toLocaleDateString()}</td>
                  <td className="admin-td text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleAction(req.id, 'approve')}
                        disabled={isProcessing === req.id}
                        className="px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 flex items-center"
                      >
                        {isProcessing === req.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />} Approve
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, 'deny')}
                        disabled={isProcessing === req.id}
                        className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-md text-sm font-semibold transition-colors disabled:opacity-50 flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Deny
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminApprovalRequestsPage;