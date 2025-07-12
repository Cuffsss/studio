import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MFSFD - Sleep Tracker',
  description: 'A simple app to track sleep sessions.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
       <body className={cn(inter.className, "min-h-screen bg-gradient-to-br from-background to-purple-950/20 text-foreground")}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
