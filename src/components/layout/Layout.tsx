import React from 'react';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Kadi Tiri - Traditional Card Game',
  description = 'Experience the traditional Ethiopian card game Kadi Tiri online. Play with friends, bid strategically, and enjoy authentic gameplay.',
  className = ''
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="/og-image.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content="/og-image.png" />
        
        {/* Game-specific meta tags */}
        <meta name="theme-color" content="#059669" />
        <meta name="application-name" content="Kadi Tiri" />
        <meta name="keywords" content="kadi tiri, card game, ethiopian, traditional, online, multiplayer, bidding" />
        
        {/* Preload important fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Prevent zoom on mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <div className="min-vh-100 d-flex flex-column">
        <main className="flex-grow-1">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;