import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Clock, Calendar } from 'lucide-react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const SAMPLE_POSTS = [
  {
    id: 1,
    title: "New Customs Regulations for West Africa Starting Next Month",
    category: "Destination Notices",
    date: "2026-06-15",
    readTime: 4,
    excerpt: "Important updates regarding import duties and documentation required for shipments bound for major West African ports.",
  },
  {
    id: 2,
    title: "Maximizing Container Space for Electronics Exports",
    category: "Cargo Tips",
    date: "2026-06-10",
    readTime: 6,
    excerpt: "Learn how to efficiently pack LCL and FCL shipments to minimize damage risk while maximizing cost-efficiency per CBM.",
  },
  {
    id: 3,
    title: "Peak Season Shipping: How to Prepare Your Business",
    category: "Seasonal Content",
    date: "2026-06-02",
    readTime: 5,
    excerpt: "Avoid delays during the busy Q3/Q4 shipping seasons by understanding carrier schedules and early booking strategies.",
  },
  {
    id: 4,
    title: "Guangzhou Warehouse Expansion Complete",
    category: "Shipping Updates",
    date: "2026-05-28",
    readTime: 3,
    excerpt: "We've added 10,000 sqm of secure storage space to better serve our growing client base importing from China.",
  },
  {
    id: 5,
    title: "Understanding Demurrage and Detention Charges",
    category: "Business Shipping Advice",
    date: "2026-05-15",
    readTime: 7,
    excerpt: "A comprehensive guide to port fees, how they are calculated, and best practices to avoid unexpected logistics costs.",
  },
  {
    id: 6,
    title: "Current Vessel Loading Schedules for Monrovia",
    category: "Loading Updates",
    date: "2026-05-10",
    readTime: 2,
    excerpt: "Review the upcoming departure dates and cutoff times for sea freight bound for Liberia.",
  }
];

const CATEGORIES = ["All", "Shipping Updates", "Cargo Tips", "Destination Notices", "Loading Updates", "Business Shipping Advice", "Seasonal Content"];

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts = activeCategory === "All" 
    ? SAMPLE_POSTS 
    : SAMPLE_POSTS.filter(post => post.category === activeCategory);

  return (
    <>
      <Helmet>
        <title>Shipping Updates & Tips | STC Logistics Blog</title>
        <meta name="description" content="Stay informed with the latest shipping updates, cargo tips, and logistics advice from STC Logistics." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-muted">
        <Header />

        <main className="flex-1 pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Shipping Updates & Tips</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Industry insights, operational updates, and expert advice to help you navigate global logistics.</p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeCategory === cat 
                      ? 'bg-secondary text-white shadow-md' 
                      : 'bg-white text-primary hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map(post => (
                <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer group">
                  <div className="p-8 flex flex-col h-full">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 block">
                      {post.category}
                    </span>
                    <h2 className="text-xl font-bold text-primary mb-4 group-hover:text-secondary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground text-sm mb-6 flex-grow line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 font-medium pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {post.readTime} min read
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredPosts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <p className="text-muted-foreground text-lg">No posts found for this category.</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPage;