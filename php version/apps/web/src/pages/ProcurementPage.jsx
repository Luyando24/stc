import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Tractor, Lightbulb, Car, Factory, DoorClosed, LayoutPanelTop, Home, IceCream2, Package } from 'lucide-react';

import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = [
  { name: 'Agricultural Machinery', icon: Tractor, slug: 'agricultural-machinery' },
  { name: 'Lighting Equipment', icon: Lightbulb, slug: 'lighting-equipment' },
  { name: 'Cars', icon: Car, slug: 'cars' },
  { name: 'Heavy Equipment', icon: Factory, slug: 'heavy-equipment' },
  { name: 'Doors', icon: DoorClosed, slug: 'doors' },
  { name: 'Windows', icon: LayoutPanelTop, slug: 'windows' },
  { name: 'Tiles', icon: Home, slug: 'tiles' },
  { name: 'Ice Cream Machines', icon: IceCream2, slug: 'ice-cream-machines' },
];

const SEED_PRODUCTS = [
  { name: 'Tractor 100HP', category: 'Agricultural Machinery', price: 15000, description: '100 horsepower agricultural tractor', specifications: 'Engine: 100HP, Fuel: Diesel' },
  { name: 'Combine Harvester', category: 'Agricultural Machinery', price: 45000, description: 'Modern combine harvester for grain crops', specifications: 'Capacity: 5 tons/hour' },
  { name: 'Plow Set', category: 'Agricultural Machinery', price: 3500, description: 'Complete plow set for soil preparation', specifications: 'Width: 2.5m' },
  { name: 'LED Panel 500W', category: 'Lighting Equipment', price: 800, description: 'High-efficiency LED panel', specifications: 'Power: 500W, Lumens: 50000' },
  { name: 'Industrial Floodlight', category: 'Lighting Equipment', price: 1200, description: 'Heavy-duty industrial floodlight', specifications: 'Power: 1000W, Coverage: 500sqm' },
  { name: 'Street Light 150W', category: 'Lighting Equipment', price: 950, description: 'Energy-efficient street lighting', specifications: 'Power: 150W, Height: 8m' },
  { name: 'Sedan 2024', category: 'Cars', price: 25000, description: 'Modern sedan with latest features', specifications: 'Engine: 2.0L, Fuel: Petrol' },
  { name: 'SUV 4x4', category: 'Cars', price: 35000, description: 'All-terrain SUV with 4x4 capability', specifications: 'Engine: 3.0L, Transmission: Automatic' },
  { name: 'Pickup Truck', category: 'Cars', price: 28000, description: 'Heavy-duty pickup truck', specifications: 'Payload: 1500kg, Engine: 2.8L Diesel' },
  { name: 'Excavator CAT 320', category: 'Heavy Equipment', price: 85000, description: 'CAT 320 excavator for construction', specifications: 'Bucket: 1.6 cubic meters' },
  { name: 'Bulldozer D6', category: 'Heavy Equipment', price: 120000, description: 'Caterpillar D6 bulldozer', specifications: 'Blade: 3.7m wide' },
  { name: 'Crane 50T', category: 'Heavy Equipment', price: 95000, description: '50-ton mobile crane', specifications: 'Boom: 40m, Capacity: 50T' },
  { name: 'Wooden Door', category: 'Doors', price: 400, description: 'Premium wooden entry door', specifications: 'Material: Teak, Size: 80x200cm' },
  { name: 'Steel Security Door', category: 'Doors', price: 600, description: 'Heavy-duty steel security door', specifications: 'Material: Steel, Thickness: 5cm' },
  { name: 'Glass Sliding Door', category: 'Doors', price: 800, description: 'Modern glass sliding door system', specifications: 'Material: Tempered Glass, Width: 150cm' },
  { name: 'Aluminum Window', category: 'Windows', price: 350, description: 'Lightweight aluminum window frame', specifications: 'Material: Aluminum, Size: 100x120cm' },
  { name: 'Wooden Window', category: 'Windows', price: 450, description: 'Traditional wooden window', specifications: 'Material: Oak, Size: 100x120cm' },
  { name: 'Glass Sliding Window', category: 'Windows', price: 550, description: 'Modern sliding glass window', specifications: 'Material: Tempered Glass, Size: 150x120cm' },
  { name: 'Ceramic Tile 60x60', category: 'Tiles', price: 25, description: 'Standard ceramic floor tile', specifications: 'Size: 60x60cm, Finish: Glossy' },
  { name: 'Porcelain Tile 80x80', category: 'Tiles', price: 35, description: 'Premium porcelain tile', specifications: 'Size: 80x80cm, Finish: Matte' },
  { name: 'Marble Tile', category: 'Tiles', price: 80, description: 'Natural marble tile', specifications: 'Size: 60x60cm, Finish: Polished' },
  { name: 'Soft Serve Machine', category: 'Ice Cream Machines', price: 5000, description: 'Commercial soft serve ice cream machine', specifications: 'Capacity: 20L, Power: 2.2kW' },
  { name: 'Gelato Machine', category: 'Ice Cream Machines', price: 8000, description: 'Professional gelato production machine', specifications: 'Capacity: 30L, Temperature: -12°C' },
  { name: 'Display Freezer', category: 'Ice Cream Machines', price: 3500, description: 'Commercial ice cream display freezer', specifications: 'Capacity: 500L, Power: 1.5kW' }
];

const ProcurementPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        // Auto-seed check
        const check = await pb.collection('products').getList(1, 1, { $autoCancel: false });
        
        if (check.totalItems === 0) {
          console.log('Products collection is empty. Starting auto-seed...');
          
          const wasValid = pb.authStore.isValid;
          const oldToken = pb.authStore.token;
          const oldModel = pb.authStore.model;

          try {
            await pb.collection('users').authWithPassword('system@stclogistics.local', 'SystemAdmin@2024', { $autoCancel: false });
            console.log('Authenticated as system admin. Creating products...');
            
            for (const p of SEED_PRODUCTS) {
              await pb.collection('products').create(p, { $autoCancel: false });
            }
            console.log('Successfully seeded 24 products.');
            
          } catch (seedErr) {
            console.error('Failed during auto-seeding process:', seedErr);
          } finally {
            // Restore previous auth state so we don't accidentally leave the user logged in as admin
            if (!wasValid) {
              pb.authStore.clear();
            } else {
              pb.authStore.save(oldToken, oldModel);
            }
          }
        }

        // Fetch featured (grab newest 6 items)
        const result = await pb.collection('products').getList(1, 6, {
          sort: '-created',
          $autoCancel: false
        });
        setFeaturedProducts(result.items);
      } catch (err) {
        console.error('Error fetching procurement data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Basic client-side routing for search
      const lowerQuery = searchQuery.toLowerCase();
      const matchedCat = CATEGORIES.find(c => c.name.toLowerCase().includes(lowerQuery));
      if (matchedCat) {
        navigate(`/procurement/${matchedCat.slug}`);
      } else {
        // Fallback demo redirect
        navigate(`/procurement/agricultural-machinery`); 
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Global Procurement Hub | STC Logistics</title>
      </Helmet>

      <div className="min-h-[100dvh] flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden border-b border-border">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1689942010216-dc412bb1e7a9" 
                alt="Global logistics and procurement"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-background/90 dark:bg-background/95 backdrop-blur-sm"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-foreground mb-6 text-balance tracking-tight"
              >
                Global Sourcing & Procurement
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-balance"
              >
                Access verified manufacturers for industrial machinery, construction materials, and commercial equipment. End-to-end purchasing and logistics handled by STC.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto bg-card p-2 rounded-2xl shadow-lg border border-border"
              >
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input 
                      type="text"
                      placeholder="Search products or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-14 pl-12 bg-transparent border-none shadow-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 text-base"
                    />
                  </div>
                  <Button type="submit" className="h-14 px-8 rounded-xl font-bold">
                    Search
                  </Button>
                </form>
              </motion.div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="py-24 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h2 className="text-3xl font-extrabold text-foreground mb-4">Browse Categories</h2>
                <p className="text-muted-foreground text-lg">Explore our specialized procurement divisions.</p>
              </div>

              <div className="category-grid">
                {CATEGORIES.map((cat, index) => {
                  const Icon = cat.icon;
                  return (
                    <motion.div
                      key={cat.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link 
                        to={`/procurement/${cat.slug}`}
                        className="group flex items-center gap-4 bg-card border border-border p-6 rounded-2xl hover:border-primary/50 hover:shadow-lg transition-all"
                      >
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="w-7 h-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                            {cat.name}
                          </h3>
                          <span className="text-sm text-muted-foreground flex items-center mt-1">
                            View Catalog <ArrowRight className="w-3 h-3 ml-1" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Featured Products */}
          <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-extrabold text-foreground mb-4">Featured Products</h2>
                  <p className="text-muted-foreground text-lg">Recently added equipment and materials.</p>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="procurement-card p-4 space-y-4">
                      <Skeleton className="w-full aspect-video rounded-xl bg-muted" />
                      <Skeleton className="h-6 w-3/4 bg-muted" />
                      <Skeleton className="h-10 w-full bg-muted mt-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="procurement-card flex flex-col bg-card overflow-hidden">
                      <div className="p-8 bg-white aspect-video flex items-center justify-center border-b border-border">
                        {product.image ? (
                          <img 
                            src={pb.files.getURL(product, product.image)} 
                            alt={product.title || product.name} 
                            className="max-h-full object-contain mix-blend-multiply"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                          {product.category}
                        </span>
                        <h3 className="font-bold text-foreground text-xl mb-4 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="font-bold text-xl text-foreground">
                            ${product.price?.toLocaleString()}
                          </span>
                          <Button asChild size="sm" className="font-semibold">
                            <Link to={`/procurement/product/${product.id}`}>Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProcurementPage;