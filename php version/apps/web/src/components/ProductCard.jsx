
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import pb from '@/lib/pocketbaseClient.js';

const ProductCard = ({ product, onRequestQuote }) => {
  const fallbackImage = 'https://images.unsplash.com/photo-1586528116311-ad8ed7fc51f7?auto=format&fit=crop&w=800&q=80';
  
  // Robust image extraction handling arrays, JSON strings, direct URLs, and File fields
  const getProductImage = (prod) => {
    if (!prod) return fallbackImage;

    // 1. Check imageUrls (JSON field which might be an array, stringified array, or direct string URL)
    if (prod.imageUrls) {
      if (Array.isArray(prod.imageUrls) && prod.imageUrls.length > 0) {
        return prod.imageUrls[0];
      } else if (typeof prod.imageUrls === 'string' && prod.imageUrls.trim() !== '') {
        try {
          const parsed = JSON.parse(prod.imageUrls);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
          return prod.imageUrls; // If parsed is a string but not an array, or parsing fails
        } catch (e) {
          // If it fails to parse, it might be a direct URL string
          return prod.imageUrls;
        }
      }
    }

    // 2. Check productImage file field (used in procurement_products)
    if (prod.productImage) {
      return pb.files.getURL(prod, prod.productImage);
    }

    // 3. Check image file field (used in standard products)
    if (prod.image) {
      return pb.files.getURL(prod, prod.image);
    }

    return fallbackImage;
  };

  const [imgSrc, setImgSrc] = useState(() => getProductImage(product));

  useEffect(() => {
    setImgSrc(getProductImage(product));
  }, [product]);

  const handleError = () => {
    if (imgSrc !== fallbackImage) {
      setImgSrc(fallbackImage);
    }
  };

  return (
    <div className="group flex flex-col h-full bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-square overflow-hidden bg-white dark:bg-muted/20 shrink-0 p-6 flex items-center justify-center">
        <img 
          src={imgSrc} 
          alt={product.productName || product.name || 'Product Image'} 
          onError={handleError}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-background/90 backdrop-blur-sm text-foreground text-xs font-semibold rounded-full shadow-sm border border-border/50">
            {product.category || 'Machinery'}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2 leading-tight">
          {product.productName || product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {product.description}
          </p>
        )}
        
        <div className="mt-auto pt-4 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">Estimated Price</p>
            <p className="text-2xl font-extrabold text-primary">
              {product.price ? `$${product.price.toFixed(2)}` : 'Price on Request'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <Button asChild variant="outline" className="flex-1 rounded-xl font-semibold border-border hover:bg-muted">
            <Link to={`/product/${product.id}`}>
              Details
            </Link>
          </Button>
          <Button onClick={() => onRequestQuote(product)} className="flex-1 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
            Request Quote
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
