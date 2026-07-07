import React from 'react';
import { Quote } from 'lucide-react';

const TestimonialCard = ({ quote, author, company, role, image, accentColor = 'primary' }) => {
  
  const colorMap = {
    primary: "text-primary bg-primary/10 border-primary/20",
    secondary: "text-secondary bg-secondary/10 border-secondary/20",
    accent: "text-accent bg-accent/10 border-accent/20"
  };

  const themeClass = colorMap[accentColor] || colorMap.primary;

  return (
    <div className={`bg-card rounded-3xl p-8 border-t-4 border-t-${accentColor} border-x border-b border-border shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col`}>
      <Quote className={`w-12 h-12 mb-6 opacity-40 text-${accentColor}`} />
      
      <p className="text-foreground text-lg leading-relaxed font-medium mb-8 flex-grow">
        "{quote}"
      </p>
      
      <div className="flex items-center gap-4 mt-auto">
        {image ? (
          <img 
            src={image} 
            alt={`${author} profile`}
            className={`w-14 h-14 rounded-full object-cover border-2 border-${accentColor} shadow-sm`}
          />
        ) : (
          <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${themeClass}`}>
            {author.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
        )}
        
        <div>
          <p className="font-extrabold text-foreground">{author}</p>
          <p className="text-sm font-semibold text-muted-foreground">{role}, <span className={`text-${accentColor}`}>{company}</span></p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;