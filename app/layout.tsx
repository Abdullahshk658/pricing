import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Product Pricing Portal',
  description: 'Internal portal to manage retail and bulk pricing data',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
