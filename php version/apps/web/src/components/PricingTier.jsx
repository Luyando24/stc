import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PricingTier = ({ name, price, features, highlighted }) => {
  return (
    <div className={`rounded-3xl p-8 sm:p-10 transition-all duration-300 ${
      highlighted 
        ? 'bg-vibrant-gradient text-white shadow-2xl shadow-primary/30 scale-105 border-0' 
        : 'bg-card border border-border shadow-md hover:shadow-xl hover:-translate-y-1'
    }`}>
      {highlighted && (
        <div className="text-sm font-bold tracking-widest uppercase bg-white/20 text-white py-1 px-3 rounded-full inline-block mb-4">
          Most Popular
        </div>
      )}
      <h3 className={`text-2xl font-extrabold mb-2 ${highlighted ? 'text-white' : 'text-foreground'}`}>
        {name}
      </h3>
      <div className="mb-8">
        <span className="text-5xl font-black tracking-tight">{price}</span>
        <span className={`font-semibold ml-2 ${highlighted ? 'text-white/80' : 'text-muted-foreground'}`}>/kg</span>
      </div>
      
      <ul className="space-y-4 mb-10">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-full p-1 ${highlighted ? 'bg-white/20' : 'bg-primary/10'}`}>
              <Check className={`w-4 h-4 flex-shrink-0 ${highlighted ? 'text-white' : 'text-primary'}`} />
            </div>
            <span className={`font-semibold leading-relaxed ${highlighted ? 'text-white/95' : 'text-foreground/80'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button 
        className="w-full" 
        size="lg" 
        variant={highlighted ? "secondary" : "outline"}
      >
        Get Started
      </Button>
    </div>
  );
};

export default PricingTier;