import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-brand-dark text-gray-300 border-t border-white/10">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4 font-sans tracking-wide">GR Tex</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Premium quality textiles and fabrics for all your needs. Elegant designs, durable materials, and exceptional service.
                        </p>
                        <div className="flex space-x-4 mt-6">
                            <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-gray-400 hover:text-accent transition-colors"><Instagram size={20} /></a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4 font-sans tracking-wide">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/shop" className="hover:text-accent transition-colors flex items-center">Shop Collections</Link></li>
                            <li><Link href="/about" className="hover:text-accent transition-colors flex items-center">Our Story</Link></li>
                            <li><Link href="/contact" className="hover:text-accent transition-colors flex items-center">Contact Us</Link></li>
                            <li><Link href="/terms" className="hover:text-accent transition-colors flex items-center">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white text-lg font-bold mb-4 font-sans tracking-wide">Contact Info</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start space-x-3">
                                <MapPin size={18} className="text-accent mt-0.5" />
                                <span>GR Tex, Namachivaya street, Old Washermentpet, chennai-600021</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail size={18} className="text-accent" />
                                <span>renuu0510@gmail.com</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone size={18} className="text-accent" />
                                <span>+91 9444230925</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-800 pt-8 text-center">
                    <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Crafted by GR Software Developers, <br />GR Tex. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
