// frontend/src/app/layout.tsx
'use client';
import { Inter } from 'next/font/google';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth';

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-900 text-slate-100 antialiased`}>
        <AuthGuard>
          {isAuthPage ? (
            <main>{children}</main>
          ) : (
            <>
              <Sidebar />
              <div className="pl-64 min-h-screen">
                {children}
              </div>
            </>
          )}
        </AuthGuard>
      </body>
    </html>
  );
}