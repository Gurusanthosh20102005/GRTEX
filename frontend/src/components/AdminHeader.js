"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function AdminHeader() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/admin/login');
    };

    return (
        <header className="bg-white shadow z-50 sticky top-0">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/admin/dashboard" className="text-2xl font-bold text-brand">
                    GR Tex <span className="text-gray-500 text-base font-normal">| Admin Panel</span>
                </Link>

                <div className="flex items-center space-x-6">
                    <span className="text-gray-600">Administrator</span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
}
