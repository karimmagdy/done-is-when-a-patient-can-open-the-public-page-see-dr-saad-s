import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Book a Session — Dr. Saad El Mahdy',
  description: 'Schedule an in-person therapy session with Dr. Saad El Mahdy, MD.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800 antialiased">{children}</body>
    </html>
  );
}
