"use client";

import Footer from "@/src/components/Footer";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import API from "@/src/services/api";

interface BlogDetail {
  id: number;
  title: string;
  content: string;
  author: string;
  imageUrl?: string;
  createdAt: string;
}

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/blogs/${id}`)
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setBlog(res.data.data);
        } else {
          setError("Failed to locate this blog post.");
        }
      })
      .catch(() => {
        setError("Error loading blog details. Please check connection.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdf6f0]/50">
        <div className="animate-spin text-5xl">🐝</div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center pt-24 pb-16" style={{ backgroundColor: "var(--color-cream)" }}>
          <div className="text-center max-w-sm px-6">
            <span className="text-5xl block mb-4">📖</span>
            <h1 className="text-xl font-bold font-lora text-gray-800 mb-2">Blog Post Not Found</h1>
            <p className="text-xs text-gray-400 mb-6">{error || "The requested article is unavailable."}</p>
            <Link href="/" className="btn-primary px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
              Return to Home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main
        className="min-h-screen pt-4 pb-20 animate-fadeIn"
        style={{ backgroundColor: "var(--color-cream)" }}
      >
        <div className="max-w-3xl mx-auto px-6">
          
          {/* Back link */}
          <div className="mb-6">
            <Link href="/" className="text-xs font-bold text-[#b5374a] hover:underline flex items-center gap-1.5">
              ← Back to Home
            </Link>
          </div>

          <article className="space-y-6">
            
            {/* Header info */}
            <div>
              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
                Store Article
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold font-lora text-gray-800 leading-tight">
                {blog.title}
              </h1>
              <div className="flex items-center gap-3 mt-4 text-xs text-gray-400 font-semibold border-b pb-4 border-gray-100">
                <span className="text-[#b5374a] font-bold">By {blog.author || "Admin"}</span>
                <span>•</span>
                <span>
                  {new Date(blog.createdAt).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </span>
              </div>
            </div>

            {/* Banner cover image */}
            {blog.imageUrl && (
              <div className="w-full aspect-[21/9] rounded-3xl overflow-hidden border bg-white/50 p-2 border-gray-250/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.imageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            )}

            {/* Content body */}
            <div className="text-gray-700 text-sm leading-relaxed space-y-5 font-lora">
              {blog.content.split("\n").map((para, i) => {
                if (!para.trim()) return null;
                return (
                  <p key={i} className="text-justify">
                    {para.trim()}
                  </p>
                );
              })}
            </div>

          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
