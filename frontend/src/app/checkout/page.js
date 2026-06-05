"use client";
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import api from '@/lib/api';
import Link from 'next/link';

export default function Checkout() {
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        zip: '',
    });
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [totals, setTotals] = useState({ subtotal: 0, savings: 0, total: 0 });

    const calculateTotals = (items) => {
        if (!items) return { subtotal: 0, savings: 0, total: 0 };

        let subtotal = 0;
        let savings = 0;

        const groups = {
            'Shirt': { count: 0, items: [] },
            'Pant': { count: 0, items: [], exclude: ['Track'] },
            'T-Shirt': { count: 0, items: [] },
            'Track Pant': { count: 0, items: [] }
        };

        const otherItems = [];

        items.forEach(item => {
            const price = Number(item.price);
            const totalItemPrice = price * item.quantity;
            subtotal += totalItemPrice;

            let matched = false;
            const title = item.title || '';
            if (title.toLowerCase().includes('track pant')) {
                groups['Track Pant'].count += item.quantity;
                groups['Track Pant'].items.push(item);
                matched = true;
            } else if (title.toLowerCase().includes('t-shirt')) {
                groups['T-Shirt'].count += item.quantity;
                groups['T-Shirt'].items.push(item);
                matched = true;
            } else if (title.toLowerCase().includes('shirt')) {
                groups['Shirt'].count += item.quantity;
                groups['Shirt'].items.push(item);
                matched = true;
            } else if (title.toLowerCase().includes('pant')) {
                groups['Pant'].count += item.quantity;
                groups['Pant'].items.push(item);
                matched = true;
            }

            if (!matched) {
                otherItems.push(item);
            }
        });

        // Apply Offer Rules
        const shirtBundles = Math.floor(groups['Shirt'].count / 3);
        savings += shirtBundles * ((399 * 3) - 999);

        const pantBundles = Math.floor(groups['Pant'].count / 2);
        savings += pantBundles * ((599 * 2) - 999);

        const tshirtBundles = Math.floor(groups['T-Shirt'].count / 6);
        savings += tshirtBundles * ((199 * 6) - 999);

        const trackBundles = Math.floor(groups['Track Pant'].count / 4);
        savings += trackBundles * ((299 * 4) - 999);

        return { subtotal, savings, total: subtotal - savings };
    };

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await api.get('/cart');
                setCartItems(res.data.items || []);
                setTotals(calculateTotals(res.data.items || []));
            } catch (err) {
                console.error("Failed to load cart for checkout", err);
            }
        };
        fetchCart();
    }, []);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const items = cartItems.map(i => ({ productId: i.product_id, quantity: i.quantity, price: i.price, size: i.size, color: i.color }));
            
            await api.post('/orders', {
                items,
                shippingAddress: `${formData.address}, ${formData.city} ${formData.zip}`
            });
            setOrderComplete(true);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Order failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderComplete) {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [orderComplete]);

    if (orderComplete) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-brand mb-4">Thank You!</h1>
                <p className="text-gray-600 mb-8">Your Cash on Delivery order has been placed successfully.</p>
                <Link href="/" className="bg-brand text-white px-6 py-3 rounded-md">Return Home</Link>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>

            {/* Steps Indicator */}
            <div className="flex mb-8 border-b pb-4">
                {[1, 2, 3].map(s => (
                    <div key={s} className={`mr-8 font-medium ${step === s ? 'text-brand border-b-2 border-brand' : 'text-gray-400'}`}>
                        Step {s}
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Address" className="w-full border p-2 rounded" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                            <input type="text" placeholder="City" className="w-full border p-2 rounded" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                            <input type="text" placeholder="ZIP Code" className="w-full border p-2 rounded" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} required />
                            <button onClick={() => setStep(2)} disabled={!formData.address || !formData.city || !formData.zip} className="bg-brand text-white px-6 py-2 rounded mt-4 disabled:opacity-50">Next: Payment</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Payment Selection</h2>
                        <div className="p-4 border border-brand bg-brand/5 rounded-xl mb-4 flex items-center justify-between">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="radio" checked readOnly className="form-radio text-brand" />
                                <span className="font-semibold text-brand-dark">Cash on Delivery (COD)</span>
                            </label>
                            <span className="text-xs text-brand font-medium bg-brand/10 px-2 py-1 rounded-full">COD Exclusive</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Pay securely with cash upon delivery of your products. No pre-payment is required.</p>
                        <div className="flex justify-between">
                            <button onClick={() => setStep(1)} className="text-gray-600">Back</button>
                            <button onClick={() => setStep(3)} className="bg-brand text-white px-6 py-2 rounded">Next: Review</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Order Review</h2>
                        <p className="mb-4 text-gray-600">Please review your shipping details and pricing summary below.</p>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-6 space-y-3">
                            <p className="text-sm"><strong>Shipping Address:</strong> {formData.address}, {formData.city} {formData.zip}</p>
                            <p className="text-sm"><strong>Payment Mode:</strong> Cash on Delivery (COD)</p>
                            <div className="border-t border-gray-200 pt-3 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal:</span>
                                    <span>₹{totals.subtotal.toFixed(2)}</span>
                                </div>
                                {totals.savings > 0 && (
                                    <div className="flex justify-between text-sm text-brand font-medium">
                                        <span>Combo Offer Savings:</span>
                                        <span>-₹{totals.savings.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-base font-bold text-brand-dark border-t border-gray-100 pt-2">
                                    <span>Total Amount:</span>
                                    <span>₹{totals.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <button onClick={() => setStep(2)} className="text-gray-600">Back</button>
                            <button onClick={handleSubmit} disabled={loading || cartItems.length === 0} className="bg-brand text-white px-6 py-2 rounded">
                                {loading ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
