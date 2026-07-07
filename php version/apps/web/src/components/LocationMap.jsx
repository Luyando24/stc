import React from 'react';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';

const LocationMap = () => {
  return (
    <section id="contact" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Location Information */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Headquarters</h2>
            <p className="text-muted-foreground text-lg mb-10 text-balance">
              Located in the heart of Guangzhou, our operations hub sits at the crossroads of global trade, empowering us to serve your supply chain needs efficiently.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-1">Office Address</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    610, Simbo Sports City, No. 202<br />
                    Huanshi West Road, Yuexiu District<br />
                    Guangzhou, China
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-1">Contact Details</h3>
                  <p className="text-muted-foreground mb-1">Phone / WhatsApp: <a href="https://wa.me/8613434313227" className="text-primary hover:underline font-medium">+86 134 3431 3227</a></p>
                  <p className="text-muted-foreground">Email: <a href="mailto:sales@stc-logistics.com" className="hover:text-primary transition-colors">sales@stc-logistics.com</a></p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg mb-1">Operating Hours</h3>
                  <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM (CST)</p>
                  <p className="text-muted-foreground">Saturday - Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Embed Container */}
          <div className="bg-card border border-border shadow-lg rounded-3xl overflow-hidden h-[450px] lg:h-[600px] w-full relative">
            <iframe 
              title="STC Logistics Location Map"
              src="https://maps.google.com/maps?q=23.1291,113.2644&t=m&z=15&output=embed&iwloc=near" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full grayscale-[0.2] contrast-[0.9]"
            ></iframe>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default LocationMap;