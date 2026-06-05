import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LayoutContent from "@/components/LayoutContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "GR Tex | Premium Textiles",
  description: "Your destination for high-quality fabrics and textiles.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
