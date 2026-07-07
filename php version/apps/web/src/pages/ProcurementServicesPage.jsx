import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Tractor, Lightbulb, Car, Hammer, DoorOpen, AppWindow, Grid2X2, IceCream } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProductCategoryCard from '@/components/ProductCategoryCard.jsx';
import ProcessFlowTimeline from '@/components/ProcessFlowTimeline.jsx';
import ProcurementQuoteForm from '@/components/ProcurementQuoteForm.jsx';

const CATEGORIES = [
  { title: 'Agricultural Machinery', icon: Tractor, desc: 'Tractors, harvesters, and farming equipment sourced directly from top manufacturers.' },
  { title: 'Lighting Equipment', icon: Lightbulb, desc: 'Commercial and residential lighting solutions, LEDs, and fixtures.' },
  { title: 'Cars', icon: Car, desc: 'New and used vehicles, auto parts, and accessories for personal or commercial use.' },
  { title: 'Heavy Equipment', icon: Hammer, desc: 'Construction machinery, excavators, loaders, and industrial tools.' },
  { title: 'Doors', icon: DoorOpen, desc: 'Security doors, interior doors, and custom entryways for construction projects.' },
  { title: 'Windows', icon: AppWindow, desc: 'Aluminum, UPVC, and custom window frames and glass panels.' },
  { title: 'Tiles', icon: Grid2X2, desc: 'Ceramic, porcelain, and marble tiles for flooring and wall applications.' },
  { title: 'Ice Cream Machines', icon: IceCream, desc: 'Commercial soft serve and gelato machines for food service businesses.' }
];

const ProcurementServicesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const formRef = useRef(null);

  const handleRequestQuote = (categoryTitle) => {
    setSelectedCategory(categoryTitle);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{`Procurement Services | STC Logistics`}</title>
        <meta name="description" content="Source products from China with STC Logistics. We handle quotation, supplier communication, and shipping for machinery, vehicles, building materials, and more." />
      </Helmet>

      <Header />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-navy-gradient text-primary-foreground py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8ed7e66a5a?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                STC Procurement Services
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed mb-8">
                Simplify your sourcing from China. We assist with supplier communication, negotiate the best quotations, and handle the entire logistics chain from the factory floor to your door.
              </p>
              <button 
                onClick={() => handleRequestQuote('')}
                className="px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-lg hover:bg-secondary/90 transition-colors shadow-lg hover:shadow-xl"
              >
                Start Sourcing Today
              </button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">What We Source</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We specialize in sourcing high-quality products across various industries. Select a category below to request a customized quote.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {CATEGORIES.map((cat, idx) => (
                <ProductCategoryCard 
                  key={idx}
                  title={cat.title}
                  description={cat.desc}
                  icon={cat.icon}
                  onClick={() => handleRequestQuote(cat.title)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Process Flow */}
        <section className="bg-white border-y border-border">
          <ProcessFlowTimeline />
        </section>

        {/* Quote Form Section */}
        <section ref={formRef} className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Request a Quotation</h2>
              <p className="text-muted-foreground">
                Fill out the form below with your requirements. Our specialized agents will review your request and get back to you with a comprehensive quote.
              </p>
            </div>
            
            <ProcurementQuoteForm preselectedCategory={selectedCategory} />
            
            <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <p className="text-sm text-muted-foreground text-center">
                <strong className="text-primary">Disclaimer:</strong> Product prices may vary depending on specifications, quantity, supplier availability, exchange rate, and shipping method. Please request a quotation for the most accurate price.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProcurementServicesPage;