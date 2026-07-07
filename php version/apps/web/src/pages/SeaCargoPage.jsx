import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FileText, Tags, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const SeaCargoPage = () => {
  return (
    <>
      <Helmet>
        <title>Sea Cargo to Liberia | STC Logistics</title>
        <meta name="description" content="Specialized sea freight services from China to Liberia." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-white">
        <Header />

        <main className="flex-1 pt-20">
          <section className="bg-navy-gradient text-white py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
                Sea Cargo to Liberia
              </h1>
              <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-10">
                Our specialized route for Liberian importers. We handle consolidation in China and manage the complex logistics to ensure safe arrival in Monrovia.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/contact">Get Quote</Link>
                </Button>
                <Button asChild size="lg" variant="white">
                  <Link to="/track">Track Shipment</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <a href="https://wa.me/8613434313227" target="_blank" rel="noopener noreferrer">Contact WhatsApp</a>
                </Button>
              </div>
            </div>
          </section>

          <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-primary mb-4">Our Secure Process</h2>
                <p className="text-muted-foreground">How we ensure your cargo is tracked and identified correctly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                <div>
                  <img src="https://images.unsplash.com/photo-1699549196390-e31bfc88536d?auto=format&fit=crop&q=80&w=800" alt="Guangzhou Warehouse" className="rounded-2xl shadow-lg" />
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">1</div>
                    <h3 className="text-2xl font-bold text-primary">Warehouse Receipt</h3>
                  </div>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    When your suppliers deliver goods to our China warehouse, our team immediately inspects the delivery. We issue a formal <strong className="text-primary">Receiving Bill</strong> containing a unique receipt number for your records.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-medium text-primary"><FileText className="w-5 h-5 text-secondary" /> Digital proof of receipt</li>
                    <li className="flex items-center gap-3 text-sm font-medium text-primary"><PackageCheck className="w-5 h-5 text-secondary" /> Condition verification</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">2</div>
                    <h3 className="text-2xl font-bold text-primary">Invoice Identification</h3>
                  </div>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    Before loading into the sea container, the <strong className="text-primary">Invoice Number is securely placed</strong> on all packages. This strict labeling protocol guarantees quick and accurate identification when the cargo arrives in Liberia.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-medium text-primary"><Tags className="w-5 h-5 text-secondary" /> Tamper-evident labeling</li>
                    <li className="flex items-center gap-3 text-sm font-medium text-primary"><PackageCheck className="w-5 h-5 text-secondary" /> Hassle-free destination pickup</li>
                  </ul>
                </div>
                <div className="order-1 md:order-2">
                  <img src="https://images.unsplash.com/photo-1578335371893-da19ce4ba0cc?auto=format&fit=crop&q=80&w=800" alt="Sea Container" className="rounded-2xl shadow-lg" />
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SeaCargoPage;