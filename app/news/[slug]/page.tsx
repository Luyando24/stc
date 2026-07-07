import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { Calendar, Clock, User, ArrowLeft, BookOpen, Share2 } from "lucide-react";

interface DetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DetailPageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, category")
    .eq("slug", slug)
    .maybeSingle();

  if (!post) {
    return {
      title: "Article Not Found | STC Logistics",
    };
  }

  return {
    title: `${post.title} | STC Logistics`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function NewsArticleDetailPage({ params }: DetailPageProps) {
  const slug = (await params).slug;
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !post) {
    notFound();
  }

  // Schema.org structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.published_date,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Person",
      "name": post.author || "STC Logistics Team",
    },
    "publisher": {
      "@type": "Organization",
      "name": "STC Logistics",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_APP_URL}/favicon.ico`,
      },
    },
  };

  // Basic Markdown-to-HTML formatter (Headings, lists, bold, quotes, paragraphs)
  function formatMarkdown(content: string) {
    const lines = content.split("\n");
    let inList = false;
    const elements: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Handle blank lines
      if (!trimmed) {
        if (inList) {
          elements.push(
            <ul key={`ul-${index}`} className="list-disc pl-6 my-4 space-y-2 text-slate-700 text-sm sm:text-base leading-relaxed">
              {listItems}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        return;
      }

      // Parse inline styling: Bold (**text**)
      const parseInline = (text: string) => {
        const parts = text.split(/\*\*([^*]+)\*\*/g);
        return parts.map((part, i) => {
          if (i % 2 === 1) {
            return <strong key={i} className="font-bold text-slate-900">{part}</strong>;
          }
          return part;
        });
      };

      // Headings
      if (trimmed.startsWith("# ")) {
        elements.push(
          <h1 key={index} className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-8 mb-4 tracking-tight">
            {parseInline(trimmed.substring(2))}
          </h1>
        );
      } else if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={index} className="text-xl sm:text-2xl font-display font-bold text-slate-900 mt-6 mb-3 tracking-tight">
            {parseInline(trimmed.substring(3))}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={index} className="text-lg font-display font-bold text-slate-900 mt-4 mb-2">
            {parseInline(trimmed.substring(4))}
          </h3>
        );
      }
      // Horizontal Rules
      else if (trimmed === "---") {
        elements.push(<hr key={index} className="border-t border-slate-200 my-6" />);
      }
      // Blockquotes
      else if (trimmed.startsWith("> ")) {
        elements.push(
          <blockquote key={index} className="border-l-4 border-brand-650 bg-slate-50 pl-4 py-2 my-4 text-slate-700 italic text-xs sm:text-sm">
            {parseInline(trimmed.substring(2))}
          </blockquote>
        );
      }
      // Unordered Lists
      else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        inList = true;
        listItems.push(
          <li key={`li-${index}`}>
            {parseInline(trimmed.substring(2))}
          </li>
        );
      }
      // Standard Paragraph
      else {
        if (inList) {
          elements.push(
            <ul key={`ul-${index}`} className="list-disc pl-6 my-4 space-y-2 text-slate-700 text-sm sm:text-base leading-relaxed">
              {listItems}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        elements.push(
          <p key={index} className="text-slate-700 text-sm sm:text-base leading-relaxed my-4">
            {parseInline(trimmed)}
          </p>
        );
      }
    });

    // Handle trailing open list
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key="ul-trailing" className="list-disc pl-6 my-4 space-y-2 text-slate-700 text-sm sm:text-base leading-relaxed">
          {listItems}
        </ul>
      );
    }

    return elements;
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Schema.org JSON-LD Script injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="page-container max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link href="/news" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-semibold text-xs sm:text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Insights
        </Link>

        {/* Article Container */}
        <article className="card p-6 sm:p-10 bg-white border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.015)] rounded-2xl space-y-6">
          {/* Tag & Share */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-650 border border-brand-100 px-3 py-1 rounded-full">
              {post.category}
            </span>
            <button className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-xs transition-colors">
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-slate-900 leading-snug tracking-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-6 border-b border-slate-100">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.published_date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.read_time} min read
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800">{post.author || "STC Logistics Team"}</span>
            </span>
          </div>

          {/* Featured Image Placeholder (Nice colored block if no image) */}
          <div className="bg-gradient-to-br from-brand-650 to-brand-500 h-64 sm:h-80 rounded-xl flex items-center justify-center relative overflow-hidden shadow-inner">
            <BookOpen className="w-20 h-20 text-white/20" />
          </div>

          {/* Excerpt */}
          <p className="text-slate-600 font-medium text-sm sm:text-base border-l-2 border-brand-500/30 pl-4 py-1 italic leading-relaxed">
            {post.excerpt}
          </p>

          {/* Rich Content Area */}
          <div className="prose max-w-none prose-slate mt-8">
            {formatMarkdown(post.content)}
          </div>
        </article>
      </div>
    </main>
  );
}
