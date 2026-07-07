
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import QuoteFormModal from '@/components/QuoteFormModal.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Loader2, CheckCircle2, ChevronRight, Image as ImageIcon } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1586528116311-ad8ed7fc51f7?auto=format&fit=crop&w=800&q=80';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setImageError(false);
        const record = await pb.collection('procurement_products').getOne(id, {
          $autoCancel: false
        });
        setProduct(record);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you are looking for does not exist or has been removed.</p>
          <Button asChild>
            <Link to="/procurement">Back to Gallery</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Robust image extraction handling arrays, JSON strings, direct URLs, and File fields
  let firstImage = fallbackImage;
  
  if (product.imageUrls) {
    if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      firstImage = product.imageUrls[0];
    } else if (typeof product.imageUrls === 'string' && product.imageUrls.trim() !== '') {
      try {
        const parsed = JSON.parse(product.imageUrls);
        if (Array.isArray(parsed) && parsed.length > 0) {
          firstImage = parsed[0];
        } else {
          firstImage = product.imageUrls;
        }
      } catch (e) {
        // If it's a plain string URL (like https://horizons-cdn...) and fails JSON parse
        firstImage = product.imageUrls;
      }
    }
  } else if (product.productImage) {
    firstImage = pb.files.getURL(product, product.productImage);
  } else if (product.image) {
    firstImage = pb.files.getURL(product, product.image);
  }

  const productName = product.productName || product.name || 'Product';
  const isSeedPlanter = productName.toLowerCase().includes('seed planter');
  
  // Parse specifications
  const specsList = product.specifications ? product.specifications.split('|').map(s => s.trim()) : [];

  const currentImgSrc = imageError ? fallbackImage : firstImage;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{`${productName} | STC Logistics`}</title>
        <meta name="description" content={product.description || "View product details and request a quote."} />
      </Helmet>

      <Header />

      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-8">
            <Link to="/procurement" className="hover:text-primary transition-colors">Procurement</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{product.category || 'Products'}</span>
            <ChevronRight className="w-4 h-4" />
            <span className="truncate max-w-[200px] text-foreground">{productName}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Single Large Image */}
            <div className="flex flex-col">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white dark:bg-muted/20 border border-border shadow-sm p-8 flex items-center justify-center">
                <img 
                  src={currentImgSrc}
                  alt={productName} 
                  onError={() => setImageError(true)}
                  className="w-full h-full object-contain drop-shadow-sm transition-opacity duration-300"
                />
                {imageError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 backdrop-blur-sm text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-sm font-medium">Image unavailable</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <span className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider w-max mb-4">
                {product.category || 'Machinery'}
              </span>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 leading-tight">
                {productName}
              </h1>
              
              <div className="text-3xl font-black text-primary mb-8">
                {product.price ? `$${product.price.toFixed(2)} USD` : 'Price on Request'}
              </div>

              <div className="prose prose-slate max-w-none text-muted-foreground mb-10 leading-relaxed text-lg">
                <p>{product.description}</p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-10 shadow-sm">
                <h3 className="text-xl font-bold text-foreground mb-6">Technical Specifications</h3>
                {specsList.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {specsList.map((spec, i) => {
                      const parts = spec.split(':');
                      const label = parts[0];
                      const value = parts.length > 1 ? parts.slice(1).join(':') : '';
                      
                      return (
                        <li key={i} className="flex flex-col border-b border-border/50 pb-3 last:border-0 last:pb-0 sm:last:border-b sm:last:pb-3 sm:nth-last-2:border-0 sm:nth-last-2:pb-0">
                          {value ? (
                            <>
                              <span className="text-sm text-muted-foreground font-medium mb-1">{label.trim()}</span>
                              <span className="text-foreground font-semibold">{value.trim()}</span>
                            </>
                          ) : (
                            <span className="text-foreground font-semibold">{spec.trim()}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">Detailed specifications available upon request.</p>
                )}
              </div>

              {isSeedPlanter && (
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-foreground mb-5">Key Features</h3>
                  <ul className="space-y-4">
                    {[
                      "Precision seed placement for optimal crop yields",
                      "Synchronized fertilizer distribution along 4 rows",
                      "Engineered for large-scale farming efficiency",
                      "Durable construction for demanding agricultural environments"
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-6 h-6 text-secondary shrink-0" />
                        <span className="text-foreground font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto pt-6 border-t border-border flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1 text-lg font-bold h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md transition-all active:scale-[0.98]" onClick={() => setIsQuoteModalOpen(true)}>
                  Inquire Now
                </Button>
                <Button size="lg" variant="outline" asChild className="h-14 px-8 rounded-xl font-bold text-foreground hover:bg-muted border-border transition-all active:scale-[0.98]">
                  <a href="https://wa.me/8613434313227" target="_blank" rel="noopener noreferrer">
                    Chat on WhatsApp
                  </a>
                </Button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />

      {isQuoteModalOpen && (
        <QuoteFormModal 
          product={product} 
          onClose={() => setIsQuoteModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
