import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ServiceCard = ({ icon: Icon, title, description, link, features, accentColor = "primary" }) => {
  
  const colorMap = {
    primary: "text-primary bg-primary/10 border-primary/20 group-hover:bg-primary shadow-primary/20",
    secondary: "text-secondary bg-secondary/10 border-secondary/20 group-hover:bg-secondary shadow-secondary/20",
    accent: "text-accent bg-accent/10 border-accent/20 group-hover:bg-accent shadow-accent/20"
  };

  const currentTheme = colorMap[accentColor] || colorMap.primary;

  return (
    <div className={`group bg-card rounded-3xl p-8 border border-border hover:border-${accentColor}/50 transition-all duration-300 shadow-sm hover:shadow-2xl flex flex-col h-full hover:-translate-y-2`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border transition-all duration-500 ${currentTheme}`}>
        <Icon className="w-8 h-8 group-hover:text-white transition-colors duration-500" />
      </div>
      
      <h3 className="text-2xl font-bold mb-4 text-foreground text-balance">
        {title}
      </h3>
      
      <p className="text-muted-foreground font-medium leading-relaxed mb-8 flex-grow">
        {description}
      </p>

      {features && (
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-foreground font-semibold">
              <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-${accentColor}`}></span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-4">
        <Button asChild variant={accentColor === 'primary' ? 'default' : accentColor} className="w-full group/btn shadow-md">
          <Link to={link}>
            Learn More
            <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ServiceCard;