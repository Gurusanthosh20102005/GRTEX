import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Award, Users, Globe } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen pt-20 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Story</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Weaving tradition with modern innovation to bring you the finest textiles in the world.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                    <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:-rotate-1 transition-transform duration-500">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="https://images.unsplash.com/photo-1528459801416-a9e53bbf4e05?q=80&w=2555&auto=format&fit=crop"
                            alt="Fabric Workshop"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-6 text-brand-dark">Passion for Quality</h2>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Founded in 2000, GR Tex began with a simple mission: to provide designers, creators, and homeowners with fabrics that tell a story. We believe that every thread counts.
                        </p>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Our collection is curated from artisanal mills across the globe, ensuring that every yard of fabric you purchase meets our rigorous standards for quality, sustainability, and aesthetic appeal.
                        </p>
                        <Link href="/shop">
                            <Button size="lg">Explore Our Collection</Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose GR Tex?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md mb-6">
                                <Award className="w-8 h-8 text-brand" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Excellence</h3>
                            <p className="text-gray-600">Uncompromised quality in every product we offer.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md mb-6">
                                <Users className="w-8 h-8 text-accent-dark" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Community</h3>
                            <p className="text-gray-600">Supporting artisans and creators worldwide.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md mb-6">
                                <Globe className="w-8 h-8 text-brand-light" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Sustainability</h3>
                            <p className="text-gray-600">Eco-friendly practices are at the heart of our operations.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
