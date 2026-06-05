"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="bg-gray-50 min-h-screen pt-20 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Have a question or custom request? We&apos;d love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="p-8 md:p-12 bg-brand-dark text-white">
                        <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>

                        <div className="space-y-8">
                            <div className="flex items-start space-x-4">
                                <MapPin className="w-6 h-6 text-accent mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Our Location</h3>
                                    <p className="text-gray-300">GR Tex, Namachivaya street<br />Old Washermentpet, chennai-600021</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Mail className="w-6 h-6 text-accent mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Email Us</h3>
                                    <p className="text-gray-300">renuu0510@gmail.com</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Phone className="w-6 h-6 text-accent mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Call Us</h3>
                                    <p className="text-gray-300">+91 9444230925</p>
                                    <p className="text-sm text-gray-400 mt-1">Mon-Sat, 9am - 9pm IST</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur-sm">
                            <p className="italic text-gray-200">&quot;Customer service is not a department, it&apos;s the entire company.&quot;</p>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">First Name</label>
                                    <Input placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                                    <Input placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <Input type="email" placeholder="john@example.com" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Subject</label>
                                <Input placeholder="Inquiry about..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Message</label>
                                <textarea
                                    className="w-full min-h-[150px] p-3 rounded-md border border-gray-300 focus:outline-non focus:ring-2 focus:ring-brand resize-none"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>

                            <Button className="w-full">Send Message</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
