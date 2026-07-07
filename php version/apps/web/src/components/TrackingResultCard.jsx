import React, { useState } from 'react';
import { Package, Calendar, Info, ExternalLink, MapPin, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ShipmentStatusTimeline from '@/components/ShipmentStatusTimeline.jsx';
import { Button } from '@/components/ui/button';

const FALLBACK_URLS = {
  'MAERSK': 'https://www.maersk.com/tracking',
  'CMA_CGM': 'https://www.cma-cgm.com/ebusiness/tracking',
  'MSC': 'https://www.msc.com/track-trace',
  'EVERGREEN': 'https://www.evergreen-shipping.com/tracking',
  'OOCL': 'https://www.oocl.com/eng/Pages/tracking.aspx',
  'COSCO': 'https://www.cosco.com/en/tracking',
  'HAPAG_LLOYD': 'https://www.hapag-lloyd.com/en/online-services/track-and-trace',
  'ZIM': 'https://www.zim.com/tracking',
  'ONE': 'https://www.one-line.com/en/online-services/track-trace'
};

const TrackingResultCard = ({ data, error, carrier, onRetry }) => {
  const [copied, setCopied] = useState(false);

  if (!data && !error) return null;

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Tracking number copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Error State
  if (error) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-8 shadow-sm text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-destructive/20">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mb-3">Tracking Error</h2>
        <p className="text-lg text-muted-foreground font-medium mb-8 max-w-md mx-auto">
          {typeof error === 'string' ? error : error.message || 'Unable to track shipment. Please try again or select carrier manually.'}
        </p>
        {onRetry && (
          <Button 
            onClick={onRetry} 
            size="lg" 
            variant="outline" 
            className="h-12 px-8 font-bold rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  const trackingNumber = data?.tracking_number || data?.reference || data?.containerNumber || '';
  const displayCarrier = carrier || data?.carrier || 'Carrier';
  const hasEvents = data?.events && data.events.length > 0;

  // 3. Fallback / No Events State
  if (!hasEvents) {
    const fallbackUrl = FALLBACK_URLS[displayCarrier] || FALLBACK_URLS[displayCarrier.replace('-', '_').toUpperCase()];

    return (
      <div className="bg-card border border-border rounded-3xl p-8 shadow-md text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
          <Info className="w-8 h-8 text-blue-500" />
        </div>
        
        <h2 className="text-2xl font-extrabold text-foreground mb-4 flex justify-center items-center gap-3">
          No Shipment Found
        </h2>
        
        <div className="space-y-2 mb-8">
          <p className="text-lg text-foreground font-semibold">
            We couldn't find real-time events for this shipment.
          </p>
          <p className="text-muted-foreground text-sm max-w-md mx-auto font-medium">
            Please visit the {displayCarrier} tracking portal directly and copy-paste your tracking number.
          </p>
        </div>

        <div className="bg-muted/40 p-6 rounded-2xl border border-border mb-8 inline-block min-w-[320px] shadow-sm">
          <p className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">
            Tracking Number
          </p>
          <div className="flex items-center justify-between gap-4 bg-background border border-border py-3 px-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-muted-foreground" />
              <span className="text-xl font-extrabold text-foreground tracking-wide font-mono">
                {trackingNumber}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCopy(trackingNumber)}
              className="h-9 px-3 hover:bg-secondary/80 transition-all font-semibold"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-green-600 dark:text-green-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div>
          {fallbackUrl ? (
            <Button 
              asChild 
              size="lg" 
              className="h-14 px-8 font-bold text-base bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] w-full sm:w-auto"
            >
              <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                Track on {displayCarrier} Portal
                <ExternalLink className="w-5 h-5 ml-2.5" />
              </a>
            </Button>
          ) : (
            <div className="text-sm font-medium text-destructive bg-destructive/10 py-3 rounded-lg">
              Portal link is currently unavailable for {displayCarrier}.
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Success State with Events
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'N/A') return 'Not available';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const sortedEvents = [...data.events].sort((a, b) => {
    const timeA = new Date(a.timestamp || a.date).getTime();
    const timeB = new Date(b.timestamp || b.date).getTime();
    return isNaN(timeB) || isNaN(timeA) ? 0 : timeB - timeA;
  });

  const latestEvent = sortedEvents[0] || null;
  const currentStatus = data.current_status || latestEvent?.status || latestEvent?.eventType || 'Status Unknown';
  const currentLocation = data.current_location || latestEvent?.location || latestEvent?.locationCode || 'Location Unknown';

  return (
    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-md">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pb-8 border-b border-border">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-primary/10 text-primary font-bold text-sm rounded-lg border border-primary/20 tracking-wide uppercase">
              {displayCarrier}
            </span>
            <span className="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-bold bg-accent/10 text-accent border border-accent/20">
              {currentStatus}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-foreground flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-muted-foreground/60" />
            {trackingNumber}
          </h2>
          {latestEvent && (
            <p className="text-muted-foreground font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Latest: {currentLocation}
            </p>
          )}
        </div>
        
        <div className="text-left md:text-right bg-muted/40 p-5 rounded-2xl border border-border min-w-[200px] shadow-sm">
          <p className="text-sm font-bold text-muted-foreground mb-1.5 flex items-center gap-2 md:justify-end">
            <Calendar className="w-4 h-4" /> Estimated Delivery
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatDate(data.estimated_delivery || data.estimatedDelivery)}
          </p>
        </div>
      </div>

      <div className="relative">
        <h3 className="text-xl font-bold text-foreground mb-8">Tracking Timeline</h3>
        <ShipmentStatusTimeline events={data.events} />
      </div>
    </div>
  );
};

export default TrackingResultCard;