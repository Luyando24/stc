import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Ship, ShoppingCart, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import QuoteCalculator from '@/components/QuoteCalculator.jsx';

const BookingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    service_type: '',
    origin: '',
    destination: '',
    cargo_details: '',
    weight: '',
    dimensions: '',
    special_requirements: ''
  });

  const services = [
    {
      type: 'air_cargo',
      icon: Plane,
      title: 'Air Cargo',
      description: 'Fast delivery, 24-48 hours'
    },
    {
      type: 'sea_cargo',
      icon: Ship,
      title: 'Sea Cargo',
      description: 'Cost-effective for bulk'
    },
    {
      type: 'procurement',
      icon: ShoppingCart,
      title: 'Procurement',
      description: 'End-to-end sourcing'
    }
  ];

  const handleServiceSelect = (serviceType) => {
    setFormData({ ...formData, service_type: serviceType });
    setStep(2);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit a booking');
      navigate('/login');
      return;
    }

    if (!formData.origin || !formData.destination || !formData.weight) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        ...formData,
        weight: parseFloat(formData.weight),
        status: 'pending',
        created_by: currentUser.id
      };

      await pb.collection('bookings').create(bookingData, { $autoCancel: false });
      
      toast.success('Booking submitted successfully. We\'ll contact you with a quote soon.');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to submit booking. Please try again.');
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Book a Shipment - Get Instant Quote | STC Logistics</title>
        <meta name="description" content="Book your air cargo, sea cargo, or procurement service. Get instant quotes and track your shipment in real-time." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <section className="py-24 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight" style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}>
                Book Your Shipment
              </h1>
              <p className="text-xl text-muted-foreground font-medium">
                Get an instant quote in 4 simple steps
              </p>
            </motion.div>

            <div className="flex justify-center mb-16">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <React.Fragment key={num}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all shadow-sm ${
                      step >= num ? 'bg-primary text-primary-foreground border-2 border-primary' : 'bg-card border-2 border-border text-muted-foreground'
                    }`}>
                      {step > num ? <Check className="w-6 h-6" /> : num}
                    </div>
                    {num < 4 && (
                      <div className={`w-12 h-1 transition-colors ${step > num ? 'bg-primary' : 'bg-border'}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-3xl shadow-md p-10 border border-border">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Select service type</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {services.map((service) => (
                      <button
                        key={service.type}
                        onClick={() => handleServiceSelect(service.type)}
                        className={`p-8 rounded-2xl border-2 transition-all text-left shadow-sm hover:shadow-md ${
                          formData.service_type === service.type
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                          formData.service_type === service.type ? 'bg-primary' : 'bg-accent/10 border border-accent/20'
                        }`}>
                          <service.icon className={`w-7 h-7 ${
                            formData.service_type === service.type ? 'text-primary-foreground' : 'text-primary'
                          }`} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
                        <p className="text-sm font-medium text-muted-foreground">{service.description}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-foreground mb-8">Cargo details</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label htmlFor="origin" className="block text-sm font-bold text-foreground mb-2">
                          Origin <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="origin"
                          name="origin"
                          value={formData.origin}
                          onChange={handleChange}
                          placeholder="City, Country"
                          required
                          className="bg-background border-border text-foreground font-medium focus-visible:ring-primary shadow-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="destination" className="block text-sm font-bold text-foreground mb-2">
                          Destination <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="destination"
                          name="destination"
                          value={formData.destination}
                          onChange={handleChange}
                          placeholder="City, Country"
                          required
                          className="bg-background border-border text-foreground font-medium focus-visible:ring-primary shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label htmlFor="weight" className="block text-sm font-bold text-foreground mb-2">
                          Weight (kg) <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="weight"
                          name="weight"
                          type="number"
                          value={formData.weight}
                          onChange={handleChange}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          required
                          className="bg-background border-border text-foreground font-medium focus-visible:ring-primary shadow-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="dimensions" className="block text-sm font-bold text-foreground mb-2">
                          Dimensions (L x W x H cm)
                        </label>
                        <Input
                          id="dimensions"
                          name="dimensions"
                          value={formData.dimensions}
                          onChange={handleChange}
                          placeholder="100 x 50 x 30"
                          className="bg-background border-border text-foreground font-medium focus-visible:ring-primary shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cargo_details" className="block text-sm font-bold text-foreground mb-2">
                        Cargo Description
                      </label>
                      <Textarea
                        id="cargo_details"
                        name="cargo_details"
                        value={formData.cargo_details}
                        onChange={handleChange}
                        placeholder="Describe your cargo..."
                        rows={3}
                        className="bg-background border-border text-foreground font-medium focus-visible:ring-primary resize-none shadow-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="special_requirements" className="block text-sm font-bold text-foreground mb-2">
                        Special Requirements
                      </label>
                      <Textarea
                        id="special_requirements"
                        name="special_requirements"
                        value={formData.special_requirements}
                        onChange={handleChange}
                        placeholder="Temperature control, fragile handling, etc."
                        rows={3}
                        className="bg-background border-border text-foreground font-medium focus-visible:ring-primary resize-none shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-10">
                    <Button variant="outline" size="lg" onClick={() => setStep(1)} className="font-bold border-border bg-background text-foreground hover:bg-muted shadow-sm">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>
                    <Button size="lg" onClick={() => setStep(3)} className="flex-1 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-foreground mb-8">Instant quote</h2>
                  
                  <QuoteCalculator 
                    serviceType={formData.service_type} 
                    weight={parseFloat(formData.weight) || 0}
                  />

                  <div className="mt-10 p-8 bg-muted rounded-2xl border border-border">
                    <h3 className="text-lg font-bold text-foreground mb-6">Shipment Summary</h3>
                    <div className="space-y-4 text-base">
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <span className="font-medium text-muted-foreground">Service:</span>
                        <span className="font-bold text-foreground capitalize">{formData.service_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <span className="font-medium text-muted-foreground">Route:</span>
                        <span className="font-bold text-foreground">{formData.origin} → {formData.destination}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-border pb-3">
                        <span className="font-medium text-muted-foreground">Weight:</span>
                        <span className="font-bold text-foreground">{formData.weight} kg</span>
                      </div>
                      {formData.dimensions && (
                        <div className="flex justify-between items-center pb-3">
                          <span className="font-medium text-muted-foreground">Dimensions:</span>
                          <span className="font-bold text-foreground">{formData.dimensions} cm</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 mt-10">
                    <Button variant="outline" size="lg" onClick={() => setStep(2)} className="font-bold border-border bg-background text-foreground hover:bg-muted shadow-sm">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>
                    <Button size="lg" onClick={() => setStep(4)} className="flex-1 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                      Continue
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-10">
                    <img 
                      src="https://horizons-cdn.hostinger.com/078706aa-f5fb-4d67-9332-07e46e25168e/91c3316b37877915e0b394987b992669.png"
                      alt="STC Logistics"
                      className="logo-md mx-auto mb-6 logo-responsive mix-blend-multiply"
                    />
                    <h2 className="text-2xl font-bold text-foreground">Confirm booking</h2>
                  </div>
                  
                  <div className="bg-muted rounded-2xl p-8 mb-10 border border-border">
                    <p className="text-base font-medium text-muted-foreground mb-6 text-center">
                      Review your booking details and submit. Our team will contact you within 24 hours with a final quote and next steps.
                    </p>
                    <div className="space-y-4 text-base">
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="font-medium text-muted-foreground">Service Type:</span>
                        <span className="font-bold text-foreground capitalize">{formData.service_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="font-medium text-muted-foreground">Origin:</span>
                        <span className="font-bold text-foreground">{formData.origin}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="font-medium text-muted-foreground">Destination:</span>
                        <span className="font-bold text-foreground">{formData.destination}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="font-medium text-muted-foreground">Weight:</span>
                        <span className="font-bold text-foreground">{formData.weight} kg</span>
                      </div>
                      {formData.dimensions && (
                        <div className="flex justify-between items-center py-3 border-b border-border">
                          <span className="font-medium text-muted-foreground">Dimensions:</span>
                          <span className="font-bold text-foreground">{formData.dimensions} cm</span>
                        </div>
                      )}
                      {formData.cargo_details && (
                        <div className="py-3 border-b border-border">
                          <span className="font-medium text-muted-foreground block mb-2">Cargo Details:</span>
                          <span className="font-bold text-foreground">{formData.cargo_details}</span>
                        </div>
                      )}
                      {formData.special_requirements && (
                        <div className="py-3">
                          <span className="font-medium text-muted-foreground block mb-2">Special Requirements:</span>
                          <span className="font-bold text-foreground">{formData.special_requirements}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" size="lg" onClick={() => setStep(3)} className="font-bold border-border bg-background text-foreground hover:bg-muted shadow-sm">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>
                    <Button 
                      size="lg"
                      onClick={handleSubmit} 
                      className="flex-1 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-3"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-3" />
                          Submit Booking
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default BookingPage;