"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Package, Truck, CheckCircle, Clock, Eye, Edit, Trash2, Printer } from 'lucide-react';

export default function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [statusModal, setStatusModal] = useState({ open: false, orderId: null, status: '', tracking: '' });
    const [detailsModal, setDetailsModal] = useState({ open: false, order: null, loading: false });
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [productForm, setProductForm] = useState({
        title: '', price: '', category: '', stock: '', image_url: '', description: '',
        colors: '', sizes: ''
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // if (user.role !== 'admin') router.push('/'); 
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const pRes = await api.get('/products');
            const oRes = await api.get('/orders/all');
            setProducts(pRes.data);
            setOrders(oRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...productForm };
            if (payload.colors && !payload.colors.startsWith('[')) {
                const colorsArray = payload.colors.split(',').map(c => c.trim()).filter(c => c);
                payload.colors = JSON.stringify(colorsArray);
            }
            if (isEditing) {
                await api.put(`/products/${editId}`, payload);
                alert('Product updated');
            } else {
                await api.post('/products', payload);
                alert('Product added');
            }

            setProductForm({ title: '', price: '', category: '', stock: '', image_url: '', description: '', colors: '', sizes: '' });
            setIsEditing(false);
            setEditId(null);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to save product');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to delete product');
        }
    };

    const startEditProduct = (product) => {
        let colorsStr = product.colors || '';
        try {
            const parsed = JSON.parse(product.colors);
            if (Array.isArray(parsed)) colorsStr = parsed.join(', ');
        } catch (e) { }

        setProductForm({
            title: product.title,
            price: product.price,
            category: product.category,
            stock: product.stock,
            image_url: product.image_url || '',
            description: product.description || '',
            colors: colorsStr,
            sizes: product.sizes || ''
        });
        setEditId(product.id);
        setIsEditing(true);
        setActiveTab('products');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleViewDetails = async (orderId) => {
        setDetailsModal({ open: true, order: null, loading: true });
        try {
            const res = await api.get(`/orders/${orderId}`);
            setDetailsModal({ open: true, order: res.data, loading: false });
        } catch (err) {
            alert('Failed to fetch order details');
            setDetailsModal({ open: false, order: null, loading: false });
        }
    };

    const handleUpdateStatus = async () => {
        try {
            await api.put(`/orders/${statusModal.orderId}/status`, {
                status: statusModal.status,
                tracking_number: statusModal.tracking
            });
            setStatusModal({ open: false, orderId: null, status: '', tracking: '' });
            fetchData();
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const printBill = async (orderId) => {
        try {
            // Fetch full details for the bill
            const res = await api.get(`/orders/${orderId}`);
            const order = res.data;

            const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price_at_purchase) * item.quantity), 0);
            const savings = subtotal - Number(order.total_amount);

            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('Please allow popups to print bill');
                return;
            }

            const itemsHtml = order.items.map(item => `
                <tr>
                    <td>${item.title} ${item.size ? `(${item.size})` : ''} ${item.color ? `(${item.color})` : ''}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">₹${item.price_at_purchase}</td>
                    <td style="text-align: right;">₹${(item.quantity * item.price_at_purchase).toFixed(2)}</td>
                </tr>
            `).join('');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Bill #${order.id}</title>
                        <style>
                            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                            .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                            .logo { font-size: 24px; font-weight: bold; color: #000; }
                            .invoice-info { text-align: right; }
                            h1 { margin-top: 0; color: #444; }
                            .bill-to { margin-bottom: 30px; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                            th { background-color: #f8f9fa; border-bottom: 2px solid #ddd; padding: 12px; text-align: left; font-weight: 600; }
                            td { border-bottom: 1px solid #ddd; padding: 12px; }
                            .total-section { display: flex; justify-content: flex-end; }
                            .total-table { width: 300px; }
                            .total-table td { border: none; padding: 5px 12px; }
                            .grand-total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #333 !important; padding-top: 10px !important; }
                            .footer { margin-top: 50px; text-align: center; color: #777; font-size: 0.9em; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="logo">GR Tex</div>
                            <div class="invoice-info">
                                <h1>INVOICE</h1>
                                <p><strong>Invoice #:</strong> ${order.id}</p>
                                <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> ${order.status}</p>
                            </div>
                        </div>

                        <div class="bill-to">
                            <h3>Bill To:</h3>
                            <p><strong>${order.user_name}</strong></p>
                            <p>${order.user_email}</p>
                            <p>${order.shipping_address}</p>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Item Description</th>
                                    <th style="text-align: center;">Qty</th>
                                    <th style="text-align: right;">Price</th>
                                    <th style="text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <div class="total-section">
                            <table class="total-table">
                                <tr>
                                    <td>Subtotal:</td>
                                    <td style="text-align: right;">₹${subtotal.toFixed(2)}</td>
                                </tr>
                                ${savings > 0 ? `
                                <tr>
                                    <td style="color: #4f46e5;">Bundle Savings:</td>
                                    <td style="text-align: right; color: #4f46e5;">-₹${savings.toFixed(2)}</td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td>Tax (0%):</td>
                                    <td style="text-align: right;">₹0.00</td>
                                </tr>
                                <tr class="grand-total">
                                    <td>Total:</td>
                                    <td style="text-align: right;">₹${Number(order.total_amount).toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>

                        <div class="footer">
                            <p>Thank you for your business!</p>
                            <p>For any queries, contact support@grtex.com</p>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();

        } catch (err) {
            console.error("Print error:", err);
            alert("Failed to generate bill.");
        }
    };

    const totalSales = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);

    if (loading) return <div className="p-12 text-center">Loading Dashboard...</div>;

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md flex-shrink-0">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-brand">Admin Panel</h1>
                </div>
                <nav className="mt-6">
                    <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-6 py-3 hover:bg-gray-50 ${activeTab === 'overview' ? 'border-r-4 border-brand bg-gray-50 font-medium' : ''}`}>Overview</button>
                    <button onClick={() => setActiveTab('products')} className={`w-full text-left px-6 py-3 hover:bg-gray-50 ${activeTab === 'products' ? 'border-r-4 border-brand bg-gray-50 font-medium' : ''}`}>Products</button>
                    <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-6 py-3 hover:bg-gray-50 ${activeTab === 'orders' ? 'border-r-4 border-brand bg-gray-50 font-medium' : ''}`}>Orders</button>
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-10 overflow-y-auto">
                {activeTab === 'overview' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm font-medium">Total Sales</h3>
                                <p className="text-3xl font-bold text-gray-900">₹{totalSales.toFixed(2)}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm font-medium">Total Orders</h3>
                                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
                                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Product Management</h2>

                        {/* Product Form */}
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                            <h3 className="text-lg font-semibold mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
                            <form onSubmit={handleProductSubmit} className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Title" className="border p-2 rounded" value={productForm.title} onChange={e => setProductForm({ ...productForm, title: e.target.value })} required />
                                <input type="number" placeholder="Price" className="border p-2 rounded" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                                <input type="text" placeholder="Category" className="border p-2 rounded" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} />
                                <input type="number" placeholder="Stock" className="border p-2 rounded" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} />

                                <input type="text" placeholder="Colors (comma separated)" className="border p-2 rounded" value={productForm.colors} onChange={e => setProductForm({ ...productForm, colors: e.target.value })} />
                                <input type="text" placeholder="Sizes (comma separated)" className="border p-2 rounded" value={productForm.sizes} onChange={e => setProductForm({ ...productForm, sizes: e.target.value })} />

                                <input type="text" placeholder="Image URL" className="border p-2 rounded col-span-2" value={productForm.image_url} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} />
                                <textarea placeholder="Description" className="border p-2 rounded col-span-2" rows="2" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}></textarea>

                                <div className="col-span-2 flex gap-2">
                                    <button type="submit" className="bg-brand text-white px-4 py-2 rounded hover:bg-brand-dark">{isEditing ? 'Update Product' : 'Add Product'}</button>
                                    {isEditing && <button type="button" onClick={() => { setIsEditing(false); setProductForm({ title: '', price: '', category: '', stock: '', image_url: '', description: '', colors: '', sizes: '' }); }} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>}
                                </div>
                            </form>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variants</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium">{p.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">₹{p.price}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{p.stock}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                                                {p.colors && JSON.stringify(p.colors).slice(0, 20)}...
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                <button onClick={() => startEditProduct(p)} className="text-blue-600 hover:text-blue-900 border rounded px-2 hover:bg-blue-50"><Edit className="h-4 w-4 inline" /></button>
                                                <button onClick={() => handleDeleteProduct(p.id)} className="text-red-600 hover:text-red-900 border rounded px-2 hover:bg-red-50"><Trash2 className="h-4 w-4 inline" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8">Order Management</h2>
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map(o => (
                                        <tr key={o.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold">#{o.id}</div>
                                                <div className="text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>{o.user_name}</div>
                                                <div className="text-xs text-gray-400">{o.user_email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">₹{o.total_amount}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                        o.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                            o.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" className="text-brand p-1 h-8" title="View Details" onClick={() => handleViewDetails(o.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="p-1 h-8" title="Update Status" onClick={() => setStatusModal({ open: true, orderId: o.id, status: o.status, tracking: o.tracking_number || '' })}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-gray-600 p-1 h-8" title="Print Bill" onClick={() => printBill(o.id)}>
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Modal - Unchanged but included for safety */}
            {statusModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg w-96 shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Update Order #{statusModal.orderId}</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={statusModal.status}
                                onChange={(e) => setStatusModal({ ...statusModal, status: e.target.value })}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Billed">Billed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        </div>
                        {statusModal.status === 'Shipped' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded"
                                    value={statusModal.tracking}
                                    onChange={(e) => setStatusModal({ ...statusModal, tracking: e.target.value })}
                                    placeholder="Enter tracking #"
                                />
                            </div>
                        )}
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setStatusModal({ ...statusModal, open: false })}>Cancel</Button>
                            <Button onClick={handleUpdateStatus}>Save Changes</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal - Unchanged */}
            {detailsModal.open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg w-[600px] max-h-[80vh] overflow-y-auto shadow-xl">
                        {detailsModal.loading ? (
                            <div className="text-center py-8">Loading Details...</div>
                        ) : detailsModal.order ? (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold">Order #{detailsModal.order.id}</h3>
                                        <p className="text-gray-500 text-sm">{new Date(detailsModal.order.created_at).toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => setDetailsModal({ open: false, order: null, loading: false })} className="text-gray-400 hover:text-gray-600">×</button>
                                </div>

                                <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-semibold text-gray-700">Customer</p>
                                        <p>{detailsModal.order.user_name}</p>
                                        <p className="text-gray-500">{detailsModal.order.user_email}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700">Shipping Address</p>
                                        <p>{detailsModal.order.shipping_address}</p>
                                    </div>
                                </div>

                                <h4 className="font-semibold mb-3 border-b pb-2">Order Items</h4>
                                <div className="space-y-4 mb-6">
                                    {detailsModal.order.items && detailsModal.order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                                            <div className="flex items-center">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={item.image_url} alt={item.title} className="w-12 h-12 rounded object-cover mr-4 bg-gray-100" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'} | Qty: {item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="font-medium">₹{item.price_at_purchase}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
                                    <span>Total Amount</span>
                                    <span>₹{detailsModal.order.total_amount}</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-red-500">Failed to load details</div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <Button onClick={() => setDetailsModal({ open: false, order: null, loading: false })}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
