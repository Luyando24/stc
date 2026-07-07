
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Phone, Mail, Globe, MapPin, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await pb.collection('contact_submissions').create(formData, { $autoCancel: false });
      toast.success("Message sent successfully. Our team will contact you shortly.");
      setFormData({ name: '', email: '', phone: '', service_type: '', message: '' });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to send message. Please try again or contact us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact STC Logistics | Get a Quote</title>
        <meta name="description" content="Contact STC Logistics for your air and sea cargo needs. Get a quote or track your shipment." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted">
        <Header />

        <main className="flex-1 pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Contact STC Logistics</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Get in touch with our team for quotes, tracking inquiries, or general questions about our logistics services.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Contact Info */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-primary text-white p-8 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-6">Reach Out Directly</h3>
                  
                  <ul className="space-y-6">
                    <li className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <div className="text-sm text-blue-100 font-medium">Phone / WhatsApp</div>
                        <a href="https://wa.me/8613434313227" className="text-lg font-bold hover:text-secondary transition-colors">+86 134 3431 3227</a>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <div className="text-sm text-blue-100 font-medium">Email</div>
                        <a href="mailto:sales@stc-logistics.com" className="text-lg font-bold hover:text-secondary transition-colors">sales@stc-logistics.com</a>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <div className="text-sm text-blue-100 font-medium">Company</div>
                        <div className="text-lg font-bold">STC Logistics</div>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <div className="text-sm text-blue-100 font-medium">Warehouse Address</div>
                        <div className="text-base font-medium leading-relaxed">
                          610, Simbo Sports City,<br/>
                          No. 202, Huanshi West Road,<br/>
                          Yuexiu District, Guangzhou, China
                        </div>
                      </div>
                    </li>
                  </ul>
                  
                  <div className="mt-10">
                    <Button asChild variant="secondary" className="w-full flex items-center gap-2">
                      <a href="https://wa.me/8613434313227" target="_blank" rel="noopener noreferrer">
                        <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-3">
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-2xl font-bold text-primary mb-6">Send an Inquiry</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-semibold text-primary">Full Name *</label>
                        <input 
                          type="text" 
                          id="name" 
                          name="name" 
                          required 
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold text-primary">Email Address *</label>
                        <input 
                          type="email" 
                          id="email" 
                          name="email" 
                          required 
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-semibold text-primary">Phone / WhatsApp *</label>
                        <input 
                          type="tel" 
                          id="phone" 
                          name="phone" 
                          required 
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="service_type" className="text-sm font-semibold text-primary">Service Needed</label>
                        <select 
                          id="service_type" 
                          name="service_type" 
                          value={formData.service_type}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-900"
                        >
                          <option value="" disabled>Select a service</option>
                          <option value="Air Cargo">Air Cargo</option>
                          <option value="Sea Cargo">Sea Cargo</option>
                          <option value="Warehousing">Warehousing</option>
                          <option value="Door-to-Door Delivery">Door-to-Door Delivery</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-semibold text-primary">Message details (weight, dimensions, destination) *</label>
                      <textarea 
                        id="message" 
                        name="message" 
                        rows="5" 
                        required 
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 resize-none"
                        placeholder="Please describe your cargo..."
                      ></textarea>
                    </div>

                    <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-16 bg-gray-200 h-[400px] rounded-2xl overflow-hidden relative">
              {/* Using a static map image since OpenStreetMap requires complex setup for a simple pin */}
              <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" alt="Map" className="w-full h-full object-cover opacity-60 grayscale" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-secondary" />
                  <div>
                    <div className="font-bold text-primary">STC Logistics Warehouse</div>
                    <div className="text-sm text-muted-foreground">Guangzhou, China</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ContactPage;
