import React from 'react';
import { Calendar, MapPin, Ship, CheckCircle2 } from 'lucide-react';

const ShipmentStatusTimeline = ({ events }) => {
  if (!events || events.length === 0) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', {
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        
        return (
          <div key={index} className="relative flex gap-6">
            {!isLast && (
              <div className="absolute left-6 top-10 bottom-[-24px] w-0.5 bg-border rounded-full"></div>
            )}
            
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-card shadow-sm bg-primary/10 text-primary">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            
            <div className="pt-2 pb-4 flex-1">
              <p className="font-bold text-foreground text-lg mb-2">
                {event.status || 'Status Update'}
              </p>
              
              <div className="space-y-1.5 bg-muted/30 rounded-xl p-4 border border-border/50">
                {event.date && (
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-primary/70" /> 
                    {formatDate(event.date)}
                  </p>
                )}
                {event.location && (
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-primary/70" /> 
                    {event.location}
                  </p>
                )}
                {event.vessel && (
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2.5">
                    <Ship className="w-4 h-4 text-primary/70" /> 
                    Vessel: <span className="font-bold text-foreground">{event.vessel}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShipmentStatusTimeline;