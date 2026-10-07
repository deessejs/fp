import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import { GlobalLayout } from '@/components/layouts/global-layout';
import { Footer } from '@/components/footer';

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <GlobalLayout>{children}</GlobalLayout>
          <Footer />
        </RootProvider>
      </body>
    </html>
  );
}
