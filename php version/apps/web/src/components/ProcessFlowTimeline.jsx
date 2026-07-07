import React from 'react';
import { FileText, Search, FileCheck, CheckCircle, Package, Truck } from 'lucide-react';

const steps = [
  { icon: FileText, title: "Submit Request", desc: "Provide product details and requirements." },
  { icon: Search, title: "STC Reviews", desc: "Our team analyzes your sourcing needs." },
  { icon: FileCheck, title: "Quotation Prepared", desc: "We source and price the best options." },
  { icon: CheckCircle, title: "Client Confirms", desc: "You approve the quote and terms." },
  { icon: Package, title: "Goods to Warehouse", desc: "Products are secured at our facility." },
  { icon: Truck, title: "Shipment Arranged", desc: "We handle logistics to your destination." }
];

const ProcessFlowTimeline = () => {
  return (
    <div className="w-full py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Our streamlined 6-step procurement process ensures you get exactly what you need, when you need it.</p>
        </div>
        
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-white border-4 border-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:border-secondary group-hover:text-secondary transition-colors duration-300 shadow-sm relative">
                    <Icon className="w-6 h-6" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessFlowTimeline;