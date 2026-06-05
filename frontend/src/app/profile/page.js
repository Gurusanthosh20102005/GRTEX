"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Package, User } from 'lucide-react';

export default function ProfilePage() {
    const { user, logout, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchOrders();
        }
    }, [user, authLoading, router]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || (!user && loading)) {
        return <div className="min-h-screen flex justify-center items-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <div className="bg-white shadow rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6 border border-gray-100">
                    <div className="bg-brand-light/10 p-4 rounded-full">
                        <User className="h-16 w-16 text-brand" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                        <p className="text-gray-500">{user?.email}</p>
                        <div className="mt-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand/10 text-brand">
                                {user?.role || 'Customer'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <Button variant="outline" onClick={logout} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
                            Log Out
                        </Button>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Package className="mr-3 h-6 w-6 text-brand" />
                        Order History
                    </h2>

                    {loading ? (
                        <div className="text-center py-10">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-100">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                            <p className="text-gray-500 mb-6">Start shopping to see your orders here.</p>
                            <Button onClick={() => router.push('/shop')}>Start Shopping</Button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <ul className="divide-y divide-gray-100">
                                {orders.map((order) => {
                                    const createdAt = new Date(order.created_at);
                                    const diffHours = (new Date() - createdAt) / (1000 * 60 * 60);
                                    const canCancel = order.status === 'Pending' && diffHours < 24;

                                    const handleCancel = async () => {
                                        if (!confirm(`Are you sure you want to cancel Order #${order.id}?`)) return;
                                        try {
                                            await api.put(`/orders/${order.id}/cancel`);
                                            alert('Order cancelled successfully.');
                                            fetchOrders();
                                        } catch (err) {
                                            console.error(err);
                                            alert(err.response?.data?.message || 'Failed to cancel order.');
                                        }
                                    };

                                    return (
                                        <li key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Order #{order.id}</p>
                                                    <p className="text-lg font-bold text-gray-900">₹{order.total_amount}</p>
                                                    <p className="text-sm text-gray-400">Placed: {new Date(order.created_at).toLocaleString()}</p>
                                                    {order.payment_status && (
                                                        <p className="text-xs text-gray-500 mt-1">Payment Status: {order.payment_status}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                                                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                                    'bg-yellow-100 text-yellow-800'}`}>
                                                        {order.status}
                                                    </span>
                                                    {canCancel && (
                                                        <Button 
                                                            onClick={handleCancel}
                                                            variant="outline" 
                                                            size="sm"
                                                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 h-8 text-xs font-medium"
                                                        >
                                                            Cancel Order
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
