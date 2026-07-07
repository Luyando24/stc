import React from 'react';
import { 
  Package, 
  Upload, 
  Ship, 
  RefreshCcw, 
  MapPin, 
  Download, 
  CheckCircle, 
  Clock 
} from 'lucide-react';

const EventTimelineItem = ({ event, isLast }) => {
  const { eventType, dateTime, location, vesselName, status } = event;

  // Determine styling and icon based on event type
  const getEventConfig = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('receive')) return { icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' };
    if (t.includes('load')) return { icon: Upload, color: 'text-indigo-400', bg: 'bg-indigo-400/10' };
    if (t.includes('depart')) return { icon: Ship, color: 'text-teal-400', bg: 'bg-teal-400/10' };
    if (t.includes('transship')) return { icon: RefreshCcw, color: 'text-orange-400', bg: 'bg-orange-400/10' };
    if (t.includes('arriv')) return { icon: MapPin, color: 'text-primary', bg: 'bg-primary/10' };
    if (t.includes('discharge')) return { icon: Download, color: 'text-purple-400', bg: 'bg-purple-400/10' };
    if (t.includes('pickup') || t.includes('deliver')) return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' };
    return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  const config = getEventConfig(eventType);
  const Icon = config.icon;

  // Status badge styling
  const getStatusBadge = (s) => {
    const st = (s || '').toLowerCase();
    if (st === 'completed') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (st === 'in-transit' || st === 'active') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="relative flex gap-6 pb-8">
      {/* Vertical Line */}
      {!isLast && (
        <div className="absolute left-6 top-14 bottom-0 w-px bg-border -translate-x-1/2" />
      )}

      {/* Icon */}
      <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-border/50 ${config.bg}`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 bg-card/50 rounded-2xl p-5 border border-border/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
          <div>
            <h4 className="text-base font-semibold text-foreground capitalize">
              {eventType?.replace(/_/g, ' ') || 'Status Update'}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              {dateTime ? new Date(dateTime).toLocaleString(undefined, { 
                month: 'short', day: 'numeric', year: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              }) : 'Date unavailable'}
            </p>
          </div>
          
          {status && (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(status)}`}>
              {status.toUpperCase()}
            </span>
          )}
        </div>

        {(location || vesselName) && (
          <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {location && (
              <div className="flex flex-col">
                <span className="text-muted-foreground/70 text-xs font-medium uppercase tracking-wider mb-1">Location</span>
                <span className="text-foreground">{location}</span>
              </div>
            )}
            {vesselName && (
              <div className="flex flex-col">
                <span className="text-muted-foreground/70 text-xs font-medium uppercase tracking-wider mb-1">Vessel</span>
                <span className="text-foreground">{vesselName}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTimelineItem;