"use client";
import Link from 'next/link';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    return (
        <nav className="bg-brand/95 backdrop-blur-md text-white shadow-lg sticky top-0 z-50 border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/">
                            <span className="text-2xl font-bold tracking-wider font-sans text-transparent bg-clip-text bg-gradient-to-r from-white to-accent-light">
                                GR Tex
                            </span>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <Link href="/" className="hover:text-accent transition-colors px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                            <Link href="/shop" className="hover:text-accent transition-colors px-3 py-2 rounded-md text-sm font-medium">Shop</Link>
                            <Link href="/about" className="hover:text-accent transition-colors px-3 py-2 rounded-md text-sm font-medium">About Us</Link>
                            <Link href="/contact" className="hover:text-accent transition-colors px-3 py-2 rounded-md text-sm font-medium">Contact</Link>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6 space-x-4">
                            <Link href="/cart" className="p-2 rounded-full hover:bg-white/10 hover:text-accent transition-all focus:outline-none relative group">
                                <ShoppingCart className="h-5 w-5" />
                                {/* <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-brand-dark">0</span> */}
                            </Link>
                            <Link href={user ? "/profile" : "/login"} className="p-2 rounded-full hover:bg-white/10 hover:text-accent transition-all focus:outline-none flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {user && <span className="text-xs font-medium hidden lg:block">{(user.name || user.email || 'User').split(' ')[0]}</span>}
                            </Link>
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-white/10 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-brand-dark border-t border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/" className="text-gray-300 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
                        <Link href="/shop" className="text-gray-300 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium">Shop</Link>
                        <Link href="/about" className="text-gray-300 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium">About</Link>
                        <Link href="/contact" className="text-gray-300 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium">Contact</Link>
                        <Link href="/cart" className="text-gray-300 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium">Cart</Link>
                        <Link href={user ? "/profile" : "/login"} className="text-gray-300 hover:text-white hover:bg-white/10 block px-3 py-2 rounded-md text-base font-medium">
                            {user ? 'Profile' : 'Login'}
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
