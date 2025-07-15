
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Sleep Tracker',
  description: 'Reliable sleep tracking for professional care providers.',
  icons: {
    icon: '/logo.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
       <body className={cn(poppins.className, "min-h-screen bg-background text-foreground")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
