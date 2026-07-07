import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { Search, Loader2, Filter } from 'lucide-react';
import { toast } from 'sonner';

const AdminActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Expanded for better filtering later
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const records = await pb.collection('admin_activity_logs').getList(pageNum, 50, {
        sort: '-timestamp,-created',
        $autoCancel: false,
        expand: 'performedBy'
      });
      setLogs(records.items);
      setTotalPages(records.totalPages);
      setPage(records.page);
    } catch (err) {
      toast.error('Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    if (['login_success', 'approve', 'reactivate'].includes(action)) return 'text-green-600 bg-green-100';
    if (['login_failed', 'deny', 'deactivate', 'delete'].includes(action)) return 'text-red-600 bg-red-100';
    if (['register'].includes(action)) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Helmet>
        <title>{`Activity Logs | STC Logistics Admin`}</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-extrabold text-foreground mb-2">System Audit Logs</h1>
        <p className="text-muted-foreground">Immutable record of all administrative actions across the platform.</p>
      </div>

      <div className="admin-table-container">
        {isLoading ? (
          <div className="flex justify-center items-center p-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No activity logs found.
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50">
                <th className="admin-th">Timestamp</th>
                <th className="admin-th">Action</th>
                <th className="admin-th">Performed By</th>
                <th className="admin-th">Target / Affected</th>
                <th className="admin-th">Details</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0 font-mono text-[13px]">
              {logs.map(log => {
                const date = new Date(log.timestamp || log.created);
                return (
                  <tr key={log.id} className="admin-tr">
                    <td className="admin-td text-muted-foreground whitespace-nowrap">
                      {date.toLocaleString()}
                    </td>
                    <td className="admin-td">
                      <span className={`px-2 py-1 rounded-md font-bold text-[11px] uppercase tracking-wider ${getActionColor(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="admin-td truncate max-w-[150px]">
                      {log.performedBy === 'system' ? 'System' : log.performedBy}
                    </td>
                    <td className="admin-td truncate max-w-[150px]">
                      {log.affectedAdmin}
                    </td>
                    <td className="admin-td text-muted-foreground break-words max-w-xs">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button 
            disabled={page === 1}
            onClick={() => fetchLogs(page - 1)}
            className="px-4 py-2 bg-card border border-border rounded-md text-sm disabled:opacity-50 hover:bg-muted transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-medium">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => fetchLogs(page + 1)}
            className="px-4 py-2 bg-card border border-border rounded-md text-sm disabled:opacity-50 hover:bg-muted transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminActivityLogsPage;