import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Plane, Ship, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const ChinaAfricaPage = () => {
  return (
    <>
      <Helmet>
        <title>China to Africa Logistics | STC Logistics</title>
        <meta name="description" content="Air and Sea Cargo services from China to African destinations." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-white">
        <Header />

        <main className="flex-1 pt-20">
          <section className="bg-muted py-20 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary mb-6">
                Air & Sea Cargo from China to Africa
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
                Dedicated trade routes connecting Chinese manufacturers with growing African markets. Choose the speed of air or the economy of sea freight.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/contact">Get Quote</Link>
                </Button>
                <Button asChild size="lg">
                  <Link to="/track">Track Shipment</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  <a href="https://wa.me/8613434313227" target="_blank" rel="noopener noreferrer">Contact WhatsApp</a>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Air Cargo Option */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-64 overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1583911026662-95161686d9a6?auto=format&fit=crop&q=80&w=800" alt="Air Freight" className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full">
                      <Plane className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-primary mb-4">Express Air Cargo</h3>
                    <p className="text-muted-foreground mb-6">The optimal choice for electronics, medical supplies, and urgent inventory restocking. Typically reaches major African hubs in 3-7 days.</p>
                    <ul className="space-y-2 mb-8">
                      <li className="flex items-center text-sm font-medium text-primary"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2"></span> Fastest transit times</li>
                      <li className="flex items-center text-sm font-medium text-primary"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2"></span> High security for valuable goods</li>
                      <li className="flex items-center text-sm font-medium text-primary"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2"></span> Direct flights to major hubs</li>
                    </ul>
                  </div>
                </div>

                {/* Sea Cargo Option */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-64 overflow-hidden relative">
                    <img src="https://images.unsplash.com/photo-1578335371893-da19ce4ba0cc?auto=format&fit=crop&q=80&w=800" alt="Sea Freight" className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full">
                      <Ship className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-primary mb-4">Economic Sea Cargo</h3>
                    <p className="text-muted-foreground mb-6">Ideal for heavy machinery, vehicles, building materials, and bulk consumer goods. FCL and LCL options available.</p>
                    <ul className="space-y-2 mb-8">
                      <li className="flex items-center text-sm font-medium text-primary"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2"></span> Lowest cost per kg/CBM</li>
                      <li className="flex items-center text-sm font-medium text-primary"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2"></span> Perfect for large volume imports</li>
                      <li className="flex items-center text-sm font-medium text-primary"><span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2"></span> Regular sailings from Guangzhou</li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </section>

          <section className="py-20 bg-primary text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <MapPin className="w-12 h-12 text-secondary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-6">Major African Destinations</h2>
              <p className="text-blue-100 max-w-2xl mx-auto mb-8">We offer door-to-door delivery and port-to-port services to key African nations including Nigeria, Ghana, Kenya, South Africa, Tanzania, and Liberia.</p>
              <Button asChild variant="white" size="lg">
                <Link to="/contact">Check Route Availability</Link>
              </Button>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ChinaAfricaPage;