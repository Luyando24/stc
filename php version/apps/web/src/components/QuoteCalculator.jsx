import React from 'react';

const QuoteCalculator = ({ serviceType, weight }) => {
  const calculateQuote = () => {
    if (!weight || weight <= 0) return 0;

    const rates = {
      air_cargo: 8.5,
      sea_cargo: 2.3,
      procurement: 5.0
    };

    const baseRate = rates[serviceType] || 5.0;
    let total = weight * baseRate;

    if (weight > 1000) {
      total *= 0.85;
    } else if (weight > 500) {
      total *= 0.9;
    }

    return total.toFixed(2);
  };

  const quote = calculateQuote();

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Estimated Quote</span>
        <div className="text-right">
          <span className="text-3xl font-bold text-primary">${quote}</span>
          <span className="text-sm text-muted-foreground ml-1">USD</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Based on {weight}kg via {serviceType.replace('_', ' ')}. Final quote may vary.
      </p>
    </div>
  );
};

export default QuoteCalculator;