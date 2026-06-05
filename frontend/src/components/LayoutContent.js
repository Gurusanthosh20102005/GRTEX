"use client";
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import AdminHeader from "@/components/AdminHeader";
import Footer from "@/components/Footer";

export default function LayoutContent({ children }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    return (
        <>
            {isAdmin ? <AdminHeader /> : <Navbar />}
            <main className="flex-grow">
                {children}
            </main>
            {!isAdmin && <Footer />}
        </>
    );
}
