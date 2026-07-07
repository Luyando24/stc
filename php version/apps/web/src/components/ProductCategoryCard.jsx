import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const ProductCategoryCard = ({ title, description, icon: Icon, onClick }) => {
  return (
    <div className="group relative bg-card text-card-foreground rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <div className="w-14 h-14 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground text-sm mb-6 flex-grow leading-relaxed">{description}</p>
      <button 
        onClick={onClick} 
        className="mt-auto inline-flex items-center text-sm font-semibold text-secondary group-hover:text-secondary/80 transition-colors w-fit"
      >
        Request Quote <ArrowUpRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>
    </div>
  );
};

export default ProductCategoryCard;