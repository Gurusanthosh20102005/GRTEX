"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, X } from 'lucide-react';

export default function Shop() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        minPrice: '',
        maxPrice: ''
    });



    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = useCallback(() => {
        let result = products;

        if (filters.category) {
            result = result.filter(p => p.category === filters.category);
        }

        if (filters.search) {
            const q = filters.search.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q)
            );
        }

        if (filters.minPrice) {
            result = result.filter(p => Number(p.price) >= Number(filters.minPrice));
        }

        if (filters.maxPrice) {
            result = result.filter(p => Number(p.price) <= Number(filters.maxPrice));
        }

        setFilteredProducts(result);
    }, [products, filters]);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [products, filters, applyFilters]);

    const uniqueCategories = [...new Set(products.map(p => p.category))];

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-brand-dark mb-4 md:mb-0">Shop Collection</h1>
                    <p className="text-gray-500">{filteredProducts.length} Premium Articles</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-1/4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <div className="flex items-center gap-2 mb-6 text-brand-dark">
                                <Filter size={20} />
                                <h2 className="text-lg font-bold">Filters</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search fabrics..."
                                            className="pl-9"
                                            value={filters.search}
                                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 transition-all"
                                        value={filters.category}
                                        onChange={e => setFilters({ ...filters, category: e.target.value })}
                                    >
                                        <option value="">All Categories</option>
                                        {uniqueCategories.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {(filters.category || filters.search || filters.minPrice || filters.maxPrice) && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setFilters({ category: '', search: '', minPrice: '', maxPrice: '' })}
                                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X size={16} className="mr-2" /> Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                                <p className="text-gray-500 mt-1">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredProducts.map((product) => (
                                    <Link key={product.id} href={`/product/${product.id}`} className="group block">
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                                            <div className="h-64 bg-gray-200 relative overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={product.image_url || `https://source.unsplash.com/random/600x400?fabric&sig=${product.id}`}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=800&auto=format&fit=crop"; }}
                                                />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-dark shadow-sm">
                                                    {product.category}
                                                </div>
                                            </div>
                                            <div className="p-6 flex flex-col flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand transition-colors mb-2">{product.title}</h3>
                                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                                                <div className="mt-auto flex justify-between items-end border-t border-gray-100 pt-4">
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-semibold">Price</p>
                                                        <span className="text-xl font-bold text-brand">₹{product.price}</span>
                                                    </div>
                                                    <Button size="sm" variant="secondary" className="group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-colors">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
