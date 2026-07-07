import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Ship, Package, Truck, ArrowRight, Search, FileText, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>STC Logistics | Global Cargo & Shipping</title>
        <meta name="description" content="Ship with STC with Confidence. Air cargo, sea cargo, warehousing, and door-to-door delivery." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted">
        <Header />

        <main className="flex-1 pt-20">
          
          {/* A. HERO SECTION */}
          <section className="relative min-h-[90vh] flex items-center pt-10 pb-20">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1675297327297-3a88f1e599dd?auto=format&fit=crop&q=80&w=2000" 
                alt="Cargo port at twilight" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/80 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="max-w-4xl mx-auto"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-balance">
                  Ship with <span className="text-secondary">Confidence</span>. Ship with <span className="text-secondary">STC</span>.
                </h1>
                <p className="text-xl md:text-2xl text-blue-50/90 font-medium mb-12 max-w-3xl mx-auto leading-relaxed">
                  Air Cargo • Sea Cargo • Warehousing • Local Door-to-Door Delivery
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="h-14 px-8 text-base">
                    <Link to="/track">Track Shipment</Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="h-14 px-8 text-base">
                    <Link to="/contact">Get a Quote</Link>
                  </Button>
                  <Button asChild variant="white" size="lg" className="h-14 px-8 text-base">
                    <Link to="/contact">Download Invoice</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base border-white text-white hover:bg-white hover:text-primary">
                    <a href="https://wa.me/8613434313227" target="_blank" rel="noopener noreferrer">Contact WhatsApp</a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* B. MAIN SERVICES SECTION */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Our Core Services</h2>
                <div className="w-20 h-1 bg-secondary mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { icon: Plane, title: "Air Cargo", desc: "Fast, reliable air freight for urgent and high-value shipments to global destinations.", link: "/air-cargo" },
                  { icon: Ship, title: "Sea Cargo", desc: "Cost-effective ocean freight for large volumes, handling both FCL and LCL shipments.", link: "/sea-cargo-liberia" },
                  { icon: Package, title: "Warehousing", desc: "Secure storage, consolidation, and inventory management in our Guangzhou facilities.", link: "/contact" },
                  { icon: Truck, title: "Door-to-Door", desc: "End-to-end logistics solutions delivering straight to your business or home.", link: "/china-africa" }
                ].map((service, idx) => (
                  <Link key={idx} to={service.link} className="group bg-muted rounded-xl p-8 hover:bg-primary transition-colors duration-300 flex flex-col h-full">
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mb-6 group-hover:bg-secondary transition-colors">
                      <service.icon className="w-7 h-7 text-primary group-hover:text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-3 group-hover:text-white">{service.title}</h3>
                    <p className="text-muted-foreground group-hover:text-blue-100 flex-grow mb-6">{service.desc}</p>
                    <div className="text-secondary font-semibold flex items-center mt-auto group-hover:text-white">
                      Learn more <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* C. HOW THE PROCESS WORKS */}
          <section className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How It Works</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">From purchase to delivery, our streamlined process ensures your cargo is handled professionally at every step.</p>
              </div>

              <div className="relative max-w-4xl mx-auto">
                {/* Vertical Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform md:-translate-x-1/2 hidden md:block"></div>

                <div className="space-y-12 relative z-10">
                  {[
                    { step: 1, title: "Client Buys Goods", desc: "You purchase your goods from suppliers in China." },
                    { step: 2, title: "Delivery to STC", desc: "Supplier delivers the goods to our Guangzhou warehouse." },
                    { step: 3, title: "Receiving & Checking", desc: "Warehouse checks the goods and issues a Receiving Bill." },
                    { step: 4, title: "Labeling", desc: "Invoice Number is securely placed on the package." },
                    { step: 5, title: "Loading", desc: "Cargo is consolidated and loaded for air or sea shipment." },
                    { step: 6, title: "Invoicing & Tracking", desc: "Client receives the invoice and continuous tracking updates." },
                    { step: 7, title: "Arrival & Delivery", desc: "Cargo arrives at the destination and is delivered to you." }
                  ].map((item, idx) => (
                    <div key={idx} className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                      <div className="md:w-1/2 w-full flex justify-start md:justify-end">
                        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 w-full max-w-md ${idx % 2 !== 0 ? 'md:text-left' : 'md:text-right'}`}>
                          <h4 className="text-lg font-bold text-primary mb-2">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <div className="hidden md:flex w-16 h-16 shrink-0 bg-primary text-white rounded-full items-center justify-center font-bold text-xl border-4 border-muted z-10 relative">
                        {item.step}
                      </div>
                      <div className="md:w-1/2 hidden md:block"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* D. CLIENT TOOLS SECTION (Bento Grid) */}
          <section className="py-24 bg-primary text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Client Tools</h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-blue-100 max-w-2xl mx-auto">Everything you need to manage your shipments in one place.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/track" className="md:col-span-2 bg-white/10 hover:bg-white/20 p-8 rounded-2xl border border-white/10 transition-colors group flex flex-col justify-between">
                  <div>
                    <Search className="w-10 h-10 text-secondary mb-6" />
                    <h3 className="text-2xl font-bold mb-2">Track Container</h3>
                    <p className="text-blue-100 mb-6">Enter your tracking or invoice number for real-time location updates on your cargo.</p>
                  </div>
                  <div className="flex items-center text-sm font-semibold group-hover:text-secondary transition-colors">
                    Access Tracker <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </Link>

                <Link to="/contact" className="bg-white/10 hover:bg-white/20 p-8 rounded-2xl border border-white/10 transition-colors group">
                  <FileText className="w-10 h-10 text-secondary mb-6" />
                  <h3 className="text-xl font-bold mb-2">Download Invoice</h3>
                  <p className="text-blue-100 text-sm mb-6">Retrieve your shipping documents.</p>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link to="/contact" className="bg-white/10 hover:bg-white/20 p-8 rounded-2xl border border-white/10 transition-colors group">
                  <MapPin className="w-10 h-10 text-secondary mb-6" />
                  <h3 className="text-xl font-bold mb-2">Destination Code</h3>
                  <p className="text-blue-100 text-sm mb-6">Look up destination port codes.</p>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link to="/contact" className="bg-white/10 hover:bg-white/20 p-8 rounded-2xl border border-white/10 transition-colors group">
                  <Package className="w-10 h-10 text-secondary mb-6" />
                  <h3 className="text-xl font-bold mb-2">Request Quote</h3>
                  <p className="text-blue-100 text-sm mb-6">Get an estimate for your shipment.</p>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a href="https://wa.me/8613434313227" target="_blank" rel="noopener noreferrer" className="bg-secondary hover:bg-secondary/90 p-8 rounded-2xl transition-colors group flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">WhatsApp Support</h3>
                    <p className="text-white/90 mb-6">Chat with our team instantly for any questions.</p>
                  </div>
                  <div className="flex items-center text-sm font-bold">
                    Message Us <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </a>
              </div>
            </div>
          </section>

          {/* E. PROOF AND TRUST SECTION */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Real Cargo, Real Results</h2>
                <div className="w-20 h-1 bg-secondary mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="relative h-64 rounded-xl overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1699549196390-e31bfc88536d?auto=format&fit=crop&q=80&w=800" alt="Warehouse Operations" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                    <h3 className="text-white font-bold text-xl">Modern Warehousing</h3>
                  </div>
                </div>
                <div className="relative h-64 rounded-xl overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1583911026662-95161686d9a6?auto=format&fit=crop&q=80&w=800" alt="Air Cargo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                    <h3 className="text-white font-bold text-xl">Global Air Freight</h3>
                  </div>
                </div>
                <div className="relative h-64 rounded-xl overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1578335371893-da19ce4ba0cc?auto=format&fit=crop&q=80&w=800" alt="Sea Cargo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                    <h3 className="text-white font-bold text-xl">Ocean Logistics</h3>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-10 rounded-2xl max-w-4xl mx-auto border-l-4 border-secondary shadow-sm">
                <div className="flex gap-4 mb-4 text-secondary">
                  <CheckCircle2 className="w-6 h-6" />
                  <CheckCircle2 className="w-6 h-6" />
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-lg text-primary italic font-medium mb-6">"STC Logistics handled our heavy equipment shipment to Liberia with absolute precision. Their tracking system kept us informed, and the cargo arrived safely. Highly recommended for African imports."</p>
                <div className="font-bold text-primary">- Construction Importer, Liberia</div>
              </div>
            </div>
          </section>

          {/* F. BLOG/UPDATES SECTION */}
          <section className="py-24 bg-muted border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">Shipping Updates & Tips</h2>
                  <p className="text-muted-foreground">Latest news from the logistics world.</p>
                </div>
                <Button asChild variant="outline" className="hidden sm:inline-flex">
                  <Link to="/blog">View All Posts</Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: "New Customs Regulations for West Africa", category: "Destination Notices", date: "Jun 15, 2026", time: "4 min read" },
                  { title: "Maximizing Container Space for Electronics", category: "Cargo Tips", date: "Jun 10, 2026", time: "6 min read" },
                  { title: "Peak Season Shipping: How to Prepare", category: "Seasonal Content", date: "Jun 02, 2026", time: "5 min read" }
                ].map((post, idx) => (
                  <Link key={idx} to="/blog" className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <div className="p-6">
                      <div className="text-xs font-bold text-secondary tracking-wider uppercase mb-3">{post.category}</div>
                      <h3 className="text-xl font-bold text-primary mb-4 group-hover:text-secondary transition-colors">{post.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{post.date}</span>
                        <span>{post.time}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/blog">View All Posts</Link>
                </Button>
              </div>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;