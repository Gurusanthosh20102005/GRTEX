"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { ShoppingCart, Star, Shield, Info, ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

export default function ProductDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [sizes, setSizes] = useState([]);

    // New State for Color and Reviews
    const [selectedColor, setSelectedColor] = useState(null);
    const [colors, setColors] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);



    const fetchProductData = useCallback(async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setProduct(res.data);

            // Parse sizes
            if (res.data.sizes) {
                const sizeArray = res.data.sizes.split(',').map(s => s.trim());
                setSizes(sizeArray);
                if (sizeArray.length === 1) setSelectedSize(sizeArray[0]);
            }

            // Parse colors
            if (res.data.colors) {
                try {
                    const colorArray = JSON.parse(res.data.colors);
                    setColors(colorArray);
                    if (colorArray.length === 1) setSelectedColor(colorArray[0]);
                } catch (e) {
                    // Fallback if not JSON
                    const colorArray = res.data.colors.split(',').map(c => c.trim());
                    setColors(colorArray);
                }
            }

            // Fetch Reviews
            try {
                const reviewsRes = await api.get(`/products/${id}/reviews`);
                setReviews(reviewsRes.data);
            } catch (err) {
                console.warn("Could not fetch reviews", err);
            }

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchProductData();
        }
    }, [id, fetchProductData]);

    const addToCart = async () => {
        if (sizes.length > 0 && !selectedSize) {
            alert('Please select a size');
            setAdding(false);
            return;
        }
        if (colors.length > 0 && !selectedColor) {
            alert('Please select a color');
            setAdding(false);
            return;
        }

        try {
            setAdding(true);
            await api.post('/cart/add', {
                productId: product.id,
                quantity: quantity,
                size: selectedSize,
                color: selectedColor
            });

            // Success Animation
            setAdded(true);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF6B6B', '#4ECDC4', '#FFE66D'] // Example vibrant colors
            });

            setTimeout(() => setAdded(false), 3000);

        } catch (err) {
            console.error(err);
            alert('Failed to add to cart (Ensure you are logged in)');
        } finally {
            setAdding(false);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await api.post(`/products/${id}/reviews`, newReview);
            // Refresh reviews
            const reviewsRes = await api.get(`/products/${id}/reviews`);
            setReviews(reviewsRes.data);
            setNewReview({ rating: 5, comment: '' });
            alert('Review submitted!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };


    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
    );

    if (!product) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <Button onClick={() => router.push('/shop')}>Back to Shop</Button>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Button variant="ghost" className="mb-8 pl-0 hover:pl-2 transition-all" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
                </Button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image */}
                        <div className="bg-gray-100 h-[500px] md:h-full relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={product.image_url}
                                alt={product.title}
                                className="w-full h-full object-cover transition-transform duration-500"
                                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=800&auto=format&fit=crop"; }}
                            />
                        </div>

                        {/* Details */}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <div className="mb-6">
                                <span className="text-sm font-bold tracking-wider text-brand uppercase bg-brand/10 px-3 py-1 rounded-full">{product.category}</span>
                            </div>

                            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.title}</h1>
                            <div className="flex items-center space-x-2 mb-6 text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-5 w-5 ${i < Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)) ? 'fill-current' : 'text-gray-300'}`} />
                                ))}
                                <span className="text-gray-400 text-sm ml-2">({reviews.length} Reviews)</span>
                            </div>

                            <p className="text-3xl font-bold text-brand mb-8">₹{product.price}</p>

                            <div className="prose prose-lg text-gray-600 mb-8 border-b border-gray-100 pb-8">
                                <p>{product.description}</p>
                            </div>

                            {/* Color Selector */}
                            {colors.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Select Color</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {colors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${selectedColor === color
                                                    ? 'border-brand bg-brand text-white shadow-md'
                                                    : 'border-gray-200 text-gray-900 hover:border-brand/50'
                                                    }`}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                    {!selectedColor && <p className="text-red-500 text-xs mt-2">Please select a color</p>}
                                </div>
                            )}

                            {/* Size Selector */}
                            {sizes.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Select Size</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-4 py-2 border rounded-md text-sm font-medium transition-all ${selectedSize === size
                                                    ? 'border-brand bg-brand text-white shadow-md'
                                                    : 'border-gray-200 text-gray-900 hover:border-brand/50'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                    {!selectedSize && <p className="text-red-500 text-xs mt-2">Please select a size</p>}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <Shield className="h-5 w-5 text-brand mr-2" />
                                    <span className="text-sm">Premium Warranty</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Info className="h-5 w-5 text-brand mr-2" />
                                    <span className="text-sm">Care Instructions</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 mt-auto">
                                <div className="flex items-center border border-gray-300 rounded-full bg-gray-50">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-5 py-3 hover:bg-gray-200 text-lg rounded-l-full transition-colors"
                                    >-</button>
                                    <span className="px-5 py-3 font-bold w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-5 py-3 hover:bg-gray-200 text-lg rounded-r-full transition-colors"
                                    >+</button>
                                </div>
                                <div className="flex-1">
                                    <AnimatePresence mode='wait'>
                                        {!added ? (
                                            <motion.div
                                                key="add-to-cart"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                <Button
                                                    onClick={addToCart}
                                                    disabled={adding}
                                                    size="lg"
                                                    className="w-full rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                                                >
                                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                                    {adding ? 'Adding...' : 'Add to Cart'}
                                                </Button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="added"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                            >
                                                <Button
                                                    disabled
                                                    size="lg"
                                                    className="w-full bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg"
                                                >
                                                    <Check className="mr-2 h-5 w-5" />
                                                    Added to Cart!
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

                    {/* Review Form */}
                    <form onSubmit={submitReview} className="mb-8 bg-gray-50 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                        className="focus:outline-none"
                                    >
                                        <Star className={`h-6 w-6 ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                            <textarea
                                className="w-full border rounded-md p-2"
                                rows="3"
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <Button type="submit" disabled={submittingReview}>
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </form>

                    {/* Reviews List */}
                    <div className="space-y-6">
                        {reviews.length === 0 ? (
                            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                        ) : (
                            reviews.map((review) => (
                                <div key={review.id} className="border-b pb-6 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600">{review.comment}</p>
                                    <span className="text-xs text-gray-400 mt-2 block">{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
