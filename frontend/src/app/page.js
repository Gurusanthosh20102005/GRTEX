"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-brand-dark text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-brand-light opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up">
            <span className="block text-white">Experience Genuine</span>
            <span className="block text-accent bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-light">Premium Textiles</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Elevate your style with our curated collection of high-quality fabrics. Designed for elegance, crafted for durability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop">
              <Button size="lg" className="rounded-full px-8 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="rounded-full px-8 text-lg font-bold border-white text-white hover:bg-white/10 hover:border-white transition-all backdrop-blur-sm">
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <ShieldCheck className="h-10 w-10 text-brand mb-4" />
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-gray-600">Sourced from the finest mills, ensuring durability and luxurious feel.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Star className="h-10 w-10 text-accent-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Modern Designs</h3>
              <p className="text-gray-600">Contemporary patterns and textures to suit every occasion and style.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Truck className="h-10 w-10 text-brand-light mb-4" />
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable shipping to get your fabrics to you on time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Collections</h2>
            <p className="text-gray-500 text-lg">Handpicked favorites just for you</p>
          </div>
          <Link href="/shop" className="hidden md:flex text-brand font-semibold hover:text-accent items-center transition-colors">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="h-72 bg-gray-200 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image || product.image_url || `https://source.unsplash.com/random/800x600?fabric,texture&sig=${product.id}`}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=800&auto=format&fit=crop"; }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                  <div className="absolute bottom-4 left-4 right-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <Link href={`/product/${product.id}`}>
                      <Button className="w-full bg-white/90 text-brand-dark hover:bg-white backdrop-blur-sm">View Details</Button>
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-brand transition-colors">{product.title}</h3>
                  <p className="text-gray-500 mb-4 line-clamp-2 text-sm">{product.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-brand">₹{product.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center md:hidden">
          <Link href="/shop">
            <Button variant="outline" className="w-full">View All Products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
