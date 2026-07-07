
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import QuoteFormModal from '@/components/QuoteFormModal.jsx';
import { PackageSearch, AlertCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Button } from '@/components/ui/button.jsx';

const CATEGORIES = [
  'All Products',
  'Agricultural Machinery',
  'Lighting Equipment',
  'Cars',
  'Heavy Equipment',
  'Doors',
  'Windows',
  'Tiles',
  'Ice Cream Machines'
];

const ProcurementGallery = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // TASK 1 & 2: INVESTIGATION & FILTERING LOGIC FIXES
  // 1. Collection Name: Querying 'procurement_products'
  // 2. Filter Logic: Array-based filter joining with '&&' to ensure clean syntax
  // 3. Field Name: Using exact field 'category' for matching
  // 4. Fetch/Render: Using getList() for pagination support, rendering via ProductCard
  // 5. Error Handling: Try/catch block captures 403s (auth issues) or network errors
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`[ProcurementGallery] Applying category filter: ${activeCategory}`);
      
      const filters = ['status = "active"'];
      if (activeCategory !== 'All Products') {
        // Ensure exact case-sensitive match for category field
        filters.push(`category = "${activeCategory}"`);
      }

      const filterString = filters.join(' && ');
      console.log(`[ProcurementGallery] Fetching procurement_products with filter query: ${filterString}`);

      // Using getList to match debugging requirements and handle potential large datasets
      const response = await pb.collection('procurement_products').getList(1, 100, {
        filter: filterString,
        sort: 'displayOrder,-created',
        $autoCancel: false
      });
      
      console.log('[ProcurementGallery] Raw response from pb.collection(\'procurement_products\').getList():', response);
      console.log('[ProcurementGallery] Filtered products array:', response.items);
      console.log(`[ProcurementGallery] Products count after filtering: ${response.items.length}`);
      
      setProducts(response.items);
    } catch (err) {
      console.error('[ProcurementGallery] Fetch error in API call:', err);
      
      // Handle specific PocketBase errors (like 403 Forbidden due to listRule)
      if (err.status === 403) {
        setError('You must be logged in to view the procurement gallery. Please sign in.');
      } else {
        setError(err.message || 'An unexpected error occurred while fetching products.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{`Procurement Gallery | STC Logistics`}</title>
        <meta name="description" content="Browse our catalog of verified products sourced from top manufacturers in China. Request custom quotes for machinery, vehicles, and building materials." />
      </Helmet>

      <Header />

      <main className="flex-grow pt-24 pb-20">
        {/* Gallery Header */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight" style={{letterSpacing: '-0.02em'}}>
              Procurement Product Gallery
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
              Explore our verified supplier catalog. Select products to request customized shipping and purchasing quotes tailored to your destination.
            </p>
          </div>
        </section>

        {/* Gallery Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Category Tabs */}
          <div className="mb-10 overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex gap-2 min-w-max">
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                    activeCategory === category 
                      ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                      : 'bg-card text-foreground border-border hover:bg-muted hover:border-primary/30'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-6 flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">
              Showing <strong className="text-foreground">{products.length}</strong> products in {activeCategory}
            </span>
          </div>

          {/* Grid / States */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-sm">
                  <Skeleton className="aspect-square w-full rounded-none" />
                  <div className="p-6 flex flex-col flex-grow gap-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="mt-auto pt-4">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                    <div className="flex gap-3 mt-2">
                      <Skeleton className="h-10 flex-1 rounded-xl" />
                      <Skeleton className="h-10 flex-1 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 bg-destructive/5 rounded-3xl border border-destructive/20 text-center px-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Failed to load products</h3>
              <p className="text-muted-foreground max-w-md mb-8">{error}</p>
              <Button onClick={fetchProducts} className="rounded-xl font-semibold gap-2">
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border text-center px-4">
              <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center shadow-sm mb-6 border border-border">
                <PackageSearch className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md">We currently don't have any active products listed in the "{activeCategory}" category. Please check back later or contact us for custom sourcing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
              {products.map((product, index) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <ProductCard 
                    product={product} 
                    onRequestQuote={(p) => setSelectedProduct(p)} 
                  />
                </div>
              ))}
            </div>
          )}

        </section>
      </main>

      <Footer />

      {selectedProduct && (
        <QuoteFormModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
};

export default ProcurementGallery;
