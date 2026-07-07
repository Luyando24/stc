import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Metadata } from "next";
import { BookOpen, Calendar, Clock, User, Search, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "News & Shipping Insights | STC Logistics",
  description: "Stay updated with the latest cargo tips, warehouse updates, destination customs compliance, and business shipping advice for shipping from China to Africa.",
  openGraph: {
    title: "News & Shipping Insights | STC Logistics",
    description: "Stay updated with the latest cargo tips, warehouse updates, destination customs compliance, and business shipping advice for shipping from China to Africa.",
    type: "website",
  },
};

interface NewsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

const CATEGORIES = [
  "All",
  "Shipping Updates",
  "Cargo Tips",
  "Destination Notices",
  "Loading Updates",
  "Business Shipping Advice",
  "Seasonal Content",
];

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const selectedCategory = params.category || "All";
  const searchQuery = params.search || "";

  const supabase = await createClient();

  // Build query
  let query = supabase
    .from("blog_posts")
    .select("*")
    .lte("published_date", new Date().toISOString())
    .order("published_date", { ascending: false });

  if (selectedCategory !== "All") {
    query = query.eq("category", selectedCategory);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error("Error loading blog posts:", error);
  }

  const featuredPost = posts && posts.length > 0 ? posts[0] : null;
  const remainingPosts = posts && posts.length > 1 ? posts.slice(1) : [];

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="page-container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-brand-650 font-bold text-xs uppercase tracking-widest bg-brand-50 border border-brand-100 px-3 py-1 rounded-full">
            Insights Portal
          </span>
          <h1 className="text-4xl font-display font-black text-slate-900 mt-4 tracking-tight sm:text-5xl">
            News &amp; Cargo Insights
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-3 leading-relaxed">
            Expert logistics advice, customs guides, and warehouse updates to optimize your China-to-Africa supply chain.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-slate-200 pb-6 mb-8">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              const href = cat === "All" ? "/news" : `/news?category=${encodeURIComponent(cat)}`;
              return (
                <Link
                  key={cat}
                  href={href}
                  className={`text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-brand-650 text-white border-brand-650 shadow-sm"
                      : "bg-white text-slate-650 border-slate-200 hover:border-slate-350 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>

          {/* Search form */}
          <form method="GET" action="/news" className="relative w-full md:w-80 shrink-0">
            {selectedCategory !== "All" && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
            <input
              type="text"
              name="search"
              placeholder="Search articles..."
              defaultValue={searchQuery}
              className="input pl-10 pr-4 py-2 text-sm w-full bg-white border border-slate-200 focus:border-brand-650"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </form>
        </div>

        {/* Search Results / No posts */}
        {(!posts || posts.length === 0) && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No articles found</h3>
            <p className="text-slate-500 text-xs mt-1">
              Try adjusting your search query or switching categories.
            </p>
            <Link href="/news" className="btn bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs mt-4 inline-flex">
              Reset Filters
            </Link>
          </div>
        )}

        {posts && posts.length > 0 && (
          <div className="space-y-12">
            {/* Featured Post Card */}
            {featuredPost && !searchQuery && selectedCategory === "All" && (
              <Link
                href={`/news/${featuredPost.slug}`}
                className="group grid md:grid-cols-2 gap-6 bg-white border border-slate-200 hover:border-slate-300/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Image placeholder with nice gradient and icon */}
                <div className="bg-gradient-to-br from-brand-600 to-accent-600 min-h-[250px] md:min-h-full flex items-center justify-center relative p-8">
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  <BookOpen className="w-16 h-16 text-white/40 group-hover:scale-110 transition-transform duration-300" />
                  <span className="absolute top-4 left-4 text-[10px] font-bold tracking-wider uppercase bg-brand-650 text-white px-2.5 py-1 rounded">
                    {featuredPost.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(featuredPost.published_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.read_time} min read
                    </span>
                  </div>

                  <h2 className="text-xl font-display font-bold text-slate-900 group-hover:text-brand-650 transition-colors line-clamp-2 md:text-2xl leading-snug">
                    {featuredPost.title}
                  </h2>

                  <p className="text-slate-500 text-xs sm:text-sm mt-3 line-clamp-3 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex items-center gap-2 mt-6 text-xs text-slate-550 border-t border-slate-100 pt-4">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{featuredPost.author}</span>
                  </div>

                  <div className="mt-6 flex items-center gap-1.5 text-brand-650 font-bold text-xs uppercase group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            )}

            {/* Grid of Other Posts */}
            {(searchQuery || selectedCategory !== "All" ? posts : remainingPosts).length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchQuery || selectedCategory !== "All" ? posts : remainingPosts).map((post) => (
                  <Link
                    key={post.id}
                    href={`/news/${post.slug}`}
                    className="group flex flex-col bg-white border border-slate-200 hover:border-slate-350 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all h-full"
                  >
                    {/* Cover image placeholder */}
                    <div className="bg-gradient-to-br from-brand-650 to-brand-500 h-48 flex items-center justify-center relative">
                      <span className="absolute top-4 left-4 text-[9px] font-bold tracking-wider uppercase bg-white text-brand-650 px-2 py-0.5 rounded border border-brand-100">
                        {post.category}
                      </span>
                      <BookOpen className="w-10 h-10 text-white/30 group-hover:scale-105 transition-transform duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3.5 text-[11px] text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.published_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.read_time} min read
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-slate-900 group-hover:text-brand-650 transition-colors line-clamp-2 text-base leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-slate-500 text-xs mt-2 line-clamp-3 leading-relaxed flex-1">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-1.5 mt-4 text-[11px] text-slate-700 border-t border-slate-100 pt-3">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold">{post.author}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
