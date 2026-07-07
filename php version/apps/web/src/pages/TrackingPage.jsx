import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Navigation, AlertCircle, Package } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';

import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ShipmentStatusTimeline from '@/components/ShipmentStatusTimeline.jsx';
import apiServerClient from '@/lib/apiServerClient.js';

const CARRIER_ENDPOINTS = {
  'MAERSK': '/maersk/track',
  'CMA_CGM': '/cma',
  'MSC': '/msc',
  'HAPAG_LLOYD': '/hapag',
  'OOCL': '/oocl',
  'COSCO': '/cosco',
  'ZIM': '/zim',
  'ONE': '/one',
  'DHL': '/dhl',
  'FEDEX': '/fedex',
  'UPS': '/ups'
};

const CARRIER_NAMES = {
  'MAERSK': 'Maersk',
  'CMA_CGM': 'CMA CGM',
  'MSC': 'MSC',
  'HAPAG_LLOYD': 'HAPAG-Lloyd',
  'OOCL': 'OOCL',
  'COSCO': 'COSCO',
  'ZIM': 'ZIM',
  'ONE': 'ONE',
  'DHL': 'DHL',
  'FEDEX': 'FedEx',
  'UPS': 'UPS'
};

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
    <div className="mt-0.5 p-2 bg-background rounded-xl shadow-sm border border-border shrink-0">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 truncate">{label}</p>
      <p className="text-sm font-bold text-foreground truncate" title={value || 'N/A'}>{value || 'N/A'}</p>
    </div>
  </div>
);

const TrackingPage = () => {
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  
  const [isSearching, setIsSearching] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Safely extract error message from various error types
   * Always returns a string, never an object
   */
  const extractErrorMessage = (err) => {
    const defaultMessage = 'Unable to fetch tracking information. Please try again later.';
    
    // Handle Error objects
    if (err instanceof Error) {
      return err.message || defaultMessage;
    }
    
    // Handle objects with message property
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = err.message;
      return typeof msg === 'string' ? msg : defaultMessage;
    }
    
    // Handle strings
    if (typeof err === 'string') {
      return err;
    }
    
    // Fallback for unknown types
    return defaultMessage;
  };

  /**
   * Validate error message is user-friendly
   * Only allow specific custom messages, otherwise use default
   */
  const sanitizeErrorMessage = (message) => {
    const allowedMessages = [
      'Tracking number not found. Please verify and try again.',
      'Unable to fetch tracking information. Please try again later.'
    ];
    
    if (allowedMessages.includes(message)) {
      return message;
    }
    
    return 'Unable to fetch tracking information. Please try again later.';
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!selectedCarrier) {
      toast.error('Please select a carrier first');
      return;
    }

    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    setIsSearching(true);
    setError(null);
    setTrackingData(null);

    const formattedTrackingNumber = trackingNumber.trim().toUpperCase();

    try {
      const endpoint = CARRIER_ENDPOINTS[selectedCarrier];
      
      // Determine payload structure based on carrier
      const payload = selectedCarrier === 'MAERSK' 
        ? { trackingNumber: formattedTrackingNumber }
        : { tracking_number: formattedTrackingNumber };
      
      const carrierResponse = await apiServerClient.fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Handle non-OK responses
      if (!carrierResponse.ok) {
        if (carrierResponse.status === 404) {
          throw new Error('Tracking number not found. Please verify and try again.');
        } else {
          throw new Error('Unable to fetch tracking information. Please try again later.');
        }
      }

      // Parse response JSON safely
      let carrierData;
      try {
        carrierData = await carrierResponse.json();
      } catch (parseErr) {
        console.error('Failed to parse carrier response:', parseErr);
        throw new Error('Unable to fetch tracking information. Please try again later.');
      }

      // Set tracking data
      setTrackingData({
        ...carrierData,
        trackingNumber: carrierData.trackingNumber || carrierData.tracking_number || formattedTrackingNumber,
        carrier: carrierData.carrier || CARRIER_NAMES[selectedCarrier]
      });
      
      toast.success('Shipment located successfully');

    } catch (err) {
      console.error('Tracking error:', err);
      
      // Extract error message safely (always returns a string)
      const rawMessage = extractErrorMessage(err);
      
      // Sanitize to only show user-friendly messages
      const errorMessage = sanitizeErrorMessage(rawMessage);
      
      // Set error state with string only (never an object)
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Track Shipment | STC Logistics</title>
        <meta name="description" content="Select your carrier and enter your tracking number below to retrieve live updates on your shipment." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col relative">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-soft-light" 
             style={{ 
               backgroundImage: 'url("https://images.unsplash.com/photo-1586528116311-ad8ed7c80a71?q=80&w=2070&auto=format&fit=crop")',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               backgroundAttachment: 'fixed'
             }} 
        />

        <Header />

        <main className="flex-1 relative z-10 pt-32 pb-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header Area */}
            <div className="mb-12 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight" style={{letterSpacing: '-0.02em'}}>
                Track Shipment
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed mx-auto md:mx-0">
                Select your carrier and enter your tracking number below to retrieve live updates on your shipment.
              </p>
            </div>

            {/* Tracking Form */}
            <div className="rounded-3xl p-6 md:p-8 shadow-lg mb-12 border border-border bg-card/95 backdrop-blur-xl">
              <form onSubmit={handleSearch} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_auto] gap-4">
                  <div>
                    <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
                      <SelectTrigger className="h-14 bg-background border-border text-foreground font-semibold rounded-xl focus:ring-primary shadow-sm w-full">
                        <SelectValue placeholder="Select Carrier" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border max-h-[300px]">
                        {Object.entries(CARRIER_NAMES).map(([key, name]) => (
                          <SelectItem key={key} value={key} className="font-medium cursor-pointer py-3">
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter tracking number (e.g. MAEU1234567)"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="h-14 pl-5 pr-12 bg-background border-border text-foreground font-bold rounded-xl uppercase placeholder:normal-case placeholder:font-medium shadow-sm focus-visible:ring-primary text-lg tracking-wide w-full"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSearching}
                    className="h-14 px-10 font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-primary/20 w-full lg:w-auto"
                  >
                    {isSearching ? 'Locating...' : 'Track'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Loading State */}
            {isSearching && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="bg-card rounded-3xl p-8 shadow-lg border border-border"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 pb-8 border-b border-border/50">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-16 h-16 rounded-xl bg-muted" />
                    <div>
                      <Skeleton className="h-8 w-64 bg-muted mb-3" />
                      <Skeleton className="h-5 w-40 bg-muted" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-32 bg-muted rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full bg-muted rounded-2xl" />)}
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {!isSearching && error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-destructive/5 border border-destructive/20 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center shadow-sm"
              >
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Shipment Not Found</h3>
                <p className="text-muted-foreground max-w-lg mb-8 text-lg">{error}</p>
                <Button 
                  onClick={() => { setError(null); setTrackingNumber(''); }}
                  variant="outline"
                  className="rounded-xl font-semibold bg-background hover:bg-muted"
                >
                  Try another number
                </Button>
              </motion.div>
            )}

            {/* Results State */}
            {!isSearching && trackingData && !error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-card rounded-3xl p-6 md:p-10 shadow-lg border border-border"
              >
                {/* Result Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b border-border/50">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/20">
                      <Package className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        {trackingData.carrier || CARRIER_NAMES[selectedCarrier]} Shipment
                      </p>
                      <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight break-all">
                        {trackingData.trackingNumber}
                      </h2>
                    </div>
                  </div>
                  <div className="px-5 py-2.5 bg-primary/10 text-primary font-bold rounded-full border border-primary/20 text-sm tracking-wide shrink-0">
                    {trackingData.status || 'Status Unknown'}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                  <DetailItem icon={MapPin} label="Current Location" value={trackingData.currentLocation} />
                  <DetailItem icon={Calendar} label="Est. Delivery" value={trackingData.estimatedDelivery} />
                  <DetailItem icon={Navigation} label="Origin" value={trackingData.origin} />
                  <DetailItem icon={Navigation} label="Destination" value={trackingData.destination} />
                </div>

                {/* Events Timeline */}
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-8 tracking-tight">Tracking History</h3>
                  {trackingData.events && trackingData.events.length > 0 ? (
                    <div className="bg-background rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                      <ShipmentStatusTimeline events={trackingData.events} />
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-2xl border border-border border-dashed">
                      <p className="text-muted-foreground font-medium">No tracking events recorded yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TrackingPage;