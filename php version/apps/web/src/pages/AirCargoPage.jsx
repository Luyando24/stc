import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, Briefcase, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const AirCargoPage = () => {
  return (
    <>
      <Helmet>
        <title>Air Cargo Services | STC Logistics</title>
        <meta name="description" content="Fast and reliable air cargo from China to America and global destinations." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-white">
        <Header />

        <main className="flex-1 pt-20">
          <section className="bg-navy-gradient text-white py-24 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 hidden lg:block">
              <img src="https://images.unsplash.com/photo-1583911026662-95161686d9a6?auto=format&fit=crop&q=80&w=1000" alt="Airplane" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent"></div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="max-w-2xl">
                <span className="inline-block py-1 px-3 rounded-full bg-secondary/20 text-secondary text-sm font-bold tracking-wider mb-6">PREMIUM FREIGHT</span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                  Air Cargo from China to America
                </h1>
                <p className="text-lg md:text-xl text-blue-100 mb-10 leading-relaxed">
                  When time is money, our air cargo services deliver. We provide rapid, secure transport for business goods, supplier purchases, e-commerce items, samples, and urgent shipments.
                </p>
                <div className="flex flex-wrap gap-4">
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
            </div>
          </section>

          <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-primary mb-6">Why Choose Our Air Cargo?</h2>
                  <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                    STC Logistics specializes in navigating complex air freight routes. Whether you are importing electronics, fashion samples, or urgent manufacturing components, we ensure priority boarding and rapid customs clearance.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Zap className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-primary">Fast Delivery</h4>
                        <p className="text-muted-foreground">Minimized transit times to meet your strictest deadlines.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-primary">Reliable & Secure</h4>
                        <p className="text-muted-foreground">High-value goods are monitored and protected end-to-end.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Briefcase className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-primary">Professional Handling</h4>
                        <p className="text-muted-foreground">Expert documentation and careful cargo management.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <img src="https://images.unsplash.com/photo-1583911026662-95161686d9a6?auto=format&fit=crop&q=80&w=800" alt="Air Cargo Loading" className="rounded-2xl shadow-xl" />
                  <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 hidden md:block">
                    <div className="flex items-center gap-4 text-primary font-bold">
                      <Clock className="w-8 h-8 text-secondary" />
                      <div>
                        <div className="text-2xl">24/7</div>
                        <div className="text-sm text-muted-foreground">Operation Support</div>
                      </div>
                    </div>
                  </div>
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

export default AirCargoPage;