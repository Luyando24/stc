import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, ArrowDownAZ, ArrowUpZA, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const CategoryPage = () => {
  const { category } = useParams();
  
  // Un-slugify category (e.g. 'agricultural-machinery' -> 'Agricultural Machinery')
  const displayCategory = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let sortQuery = '-created'; // Default newest
        if (sortOption === 'price-asc') sortQuery = 'price';
        if (sortOption === 'price-desc') sortQuery = '-price';
        if (sortOption === 'name-asc') sortQuery = 'name';

        const result = await pb.collection('products').getList(1, 50, {
          filter: `category = "${displayCategory}"`,
          sort: sortQuery,
          $autoCancel: false
        });
        setProducts(result.items);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [displayCategory, sortOption]);

  return (
    <>
      <Helmet>
        <title>{`${displayCategory} | STC Procurement`}</title>
      </Helmet>

      <div className="min-h-[100dvh] flex flex-col bg-background">
        <Header />

        <main className="flex-1 pt-28 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-muted-foreground mb-6 overflow-x-auto whitespace-nowrap">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <Link to="/procurement" className="hover:text-primary transition-colors">Procurement</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-foreground font-medium">{displayCategory}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-border">
              <div>
                <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3 text-muted-foreground hover:text-foreground">
                  <Link to="/procurement">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
                  </Link>
                </Button>
                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight text-balance">
                  {displayCategory}
                </h1>
                <p className="text-muted-foreground mt-3 max-w-2xl text-lg">
                  Browse our verified global catalog of {displayCategory.toLowerCase()}. Request quotes for bulk purchasing and international logistics handling.
                </p>
              </div>

              <div className="w-full md:w-48 shrink-0">
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">
                      <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> Newest Arrivals</div>
                    </SelectItem>
                    <SelectItem value="price-asc">
                      <div className="flex items-center"><ArrowDownAZ className="w-4 h-4 mr-2" /> Price: Low to High</div>
                    </SelectItem>
                    <SelectItem value="price-desc">
                      <div className="flex items-center"><ArrowUpZA className="w-4 h-4 mr-2" /> Price: High to Low</div>
                    </SelectItem>
                    <SelectItem value="name-asc">
                      <div className="flex items-center">Name: A to Z</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="procurement-card p-4 space-y-4">
                    <Skeleton className="w-full aspect-square rounded-xl bg-muted" />
                    <Skeleton className="h-5 w-3/4 bg-muted" />
                    <Skeleton className="h-6 w-1/3 bg-muted" />
                    <Skeleton className="h-10 w-full bg-muted mt-4" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="procurement-card flex flex-col h-full bg-card overflow-hidden"
                  >
                    <div className="p-6 bg-white aspect-square flex items-center justify-center border-b border-border">
                      {product.image ? (
                        <img 
                          src={pb.files.getURL(product, product.image)} 
                          alt={product.title || product.name} 
                          className="max-h-full object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="text-muted-foreground text-sm">No Image</div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                        {product.description || 'No description provided.'}
                      </p>
                      <div className="font-bold text-xl text-foreground mb-4">
                        ${product.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <Button asChild className="w-full mt-auto font-semibold active:scale-[0.98] transition-all">
                        <Link to={`/procurement/product/${product.id}`}>
                          View Details & Quote
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed border-border">
                <p className="text-lg font-medium text-foreground mb-2">No products found</p>
                <p className="text-muted-foreground">We currently don't have any listings in this category.</p>
              </div>
            )}

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CategoryPage;