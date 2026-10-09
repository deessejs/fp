import { Geist, Geist_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/marketing/site-header';
import './home.css';

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' });
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <div className={`fp-home ${geistSans.variable} ${geistMono.variable}`}>
      <SiteHeader />
      {children}
    </div>
  );
}
