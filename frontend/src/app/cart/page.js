"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await api.get('/cart');
            setCart(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (itemId) => {
        try {
            await api.delete(`/cart/${itemId}`);
            fetchCart();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
    );

    if (!cart || !cart.items || cart.items.length === 0) return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-6">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md">Looks like you haven&apos;t added anything to your cart yet. Explore our premium collection to find something you love.</p>
            <Link href="/shop">
                <Button size="lg">Start Shopping</Button>
            </Link>
        </div>
    );

    // Bundle Logic
    const calculateTotals = () => {
        if (!cart || !cart.items) return { subtotal: 0, savings: 0, total: 0 };

        let subtotal = 0;
        let savings = 0;

        // Group items by base title to apply cross-size bundles
        // We match by keywords: "Shirt", "Pant", "T-Shirt", "Track Pant"
        const groups = {
            'Shirt': { count: 0, items: [] },
            'Pant': { count: 0, items: [], exclude: ['Track'] }, // Exclude Track Pant from Pant
            'T-Shirt': { count: 0, items: [] },
            'Track Pant': { count: 0, items: [] }
        };

        const otherItems = [];

        cart.items.forEach(item => {
            const price = Number(item.price);
            const totalItemPrice = price * item.quantity;
            subtotal += totalItemPrice;

            let matched = false;
            // Check specific matches first
            if (item.title.toLowerCase().includes('track pant')) {
                groups['Track Pant'].count += item.quantity;
                groups['Track Pant'].items.push(item);
                matched = true;
            } else if (item.title.toLowerCase().includes('t-shirt')) {
                groups['T-Shirt'].count += item.quantity;
                groups['T-Shirt'].items.push(item);
                matched = true;
            } else if (item.title.toLowerCase().includes('shirt')) { // Will match T-Shirt if not careful, but handled above
                groups['Shirt'].count += item.quantity;
                groups['Shirt'].items.push(item);
                matched = true;
            } else if (item.title.toLowerCase().includes('pant')) {
                groups['Pant'].count += item.quantity;
                groups['Pant'].items.push(item);
                matched = true;
            }

            if (!matched) {
                otherItems.push(item);
            }
        });

        // Apply Offer Rules
        // 1. Shirt - 399rs/shirt if 999/3 shirt
        const shirtBundles = Math.floor(groups['Shirt'].count / 3);
        savings += shirtBundles * ((399 * 3) - 999);

        // 2. Pant - 599rs/pant if 999/2 pant
        const pantBundles = Math.floor(groups['Pant'].count / 2);
        savings += pantBundles * ((599 * 2) - 999);

        // 3. T-shirt - 199rs/t shirt if 999/6 t shirt
        const tshirtBundles = Math.floor(groups['T-Shirt'].count / 6);
        savings += tshirtBundles * ((199 * 6) - 999);

        // 4. Track pant - 299rs/ track pant if 999/4 track pant
        const trackBundles = Math.floor(groups['Track Pant'].count / 4);
        savings += trackBundles * ((299 * 4) - 999);

        return { subtotal, savings, total: subtotal - savings };
    };

    const { subtotal, savings, total } = calculateTotals();

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8 text-brand-dark flex items-center gap-3">
                    <ShoppingBag className="h-8 w-8 text-brand" />
                    Shopping Cart
                </h1>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Cart Items */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {cart.items.map((item) => (
                                <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50 transition-colors">
                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.image_url || `https://source.unsplash.com/random/200x200?fabric&sig=${item.id}`}
                                            alt={item.title}
                                            className="h-full w-full object-cover object-center"
                                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=200&auto=format&fit=crop"; }}
                                        />
                                    </div>
                                    <div className="flex-1 w-full flex flex-col sm:flex-row justify-between items-center sm:items-start text-center sm:text-left">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h3>
                                            {item.size && <p className="text-sm text-gray-500 mb-1">Size: {item.size}</p>}
                                            <p className="text-brand font-semibold">₹{Number(item.price).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-6 mt-4 sm:mt-0">
                                            <div className="text-sm border border-gray-200 rounded-lg px-3 py-1 bg-white">
                                                <span className="text-gray-500 mr-2">Qty:</span>
                                                <span className="font-bold">{item.quantity}</span>
                                            </div>
                                            <p className="font-bold text-lg w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                                title="Remove Item"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-96">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <p>Subtotal</p>
                                    <p className="font-medium">₹{subtotal.toFixed(2)}</p>
                                </div>
                                {savings > 0 && (
                                    <div className="flex justify-between text-brand font-medium">
                                        <p>Bundle Savings</p>
                                        <p>-₹{savings.toFixed(2)}</p>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <p>Shipping</p>
                                    <p className="text-green-600 font-medium">Free</p>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <p>Tax Estimate</p>
                                    <p className="font-medium">₹0.00</p>
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-bold text-brand-dark">
                                    <p>Total</p>
                                    <p>₹{total.toFixed(2)}</p>
                                </div>
                            </div>

                            <Link href="/checkout" className="block">
                                <Button size="lg" className="w-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                                    Proceed to Checkout
                                </Button>
                            </Link>

                            <div className="mt-6 flex justify-center space-x-2">
                                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                                <div className="h-6 w-10 bg-gray-200 rounded"></div>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-2">Secure Checkout</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
