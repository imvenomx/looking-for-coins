import type { Metadata } from "next";
import { Poppins, Montserrat, Rubik, Rethink_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/Footer";
import BodyClassController from "@/components/BodyClassController";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const rethinkSans = Rethink_Sans({
  variable: "--font-rethink-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Looking For Coins",
  description: "Compete in a variety of gamemodes such as box fights, build fights, and zone wars!",
  viewport: "width=device-width, initial-scale=1.0",
};

function getBodyClass(pathname: string = '') {
  // Remove any query parameters and hash from the pathname
  const cleanPathname = pathname.split('?')[0].split('#')[0];
  const isSinglePage = ['/matches', '/leaderboard'].some(path => 
    cleanPathname === path || cleanPathname.startsWith(`${path}/`)
  );
  
  return [
    poppins.variable,
    montserrat.variable,
    rubik.variable,
    rethinkSans.variable,
    isSinglePage ? 'single-page' : ''
  ].filter(Boolean).join(' ');
}

import { AuthProvider } from "../context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Base classes for fonts
  const baseClasses = [
    poppins.variable,
    montserrat.variable,
    rubik.variable,
    rethinkSans.variable
  ].filter(Boolean).join(' ');
  
  return (
    <html lang="en">
      <body>
        <BodyClassController />
        <AuthProvider>
          <div className="main-wrapper">
            {children}
            <Footer />
          </div>
        </AuthProvider>
        
        {/* FontAwesome Script */}
        
        {/* Client-side pathname handler */}
        <Script id="single-page-class-handler" strategy="afterInteractive">
          {`
            (function() {
              try {
                const pathname = window.location.pathname;
                const body = document.body;
                const singlePagePaths = ['/matches', '/leaderboard'];
                const isSinglePage = singlePagePaths.some(path => 
                  pathname === path || pathname.startsWith(path + '/')
                );
                
                // Add single-page class without removing existing classes
                if (isSinglePage) {
                  body.classList.add('single-page');
                } else {
                  body.classList.remove('single-page');
                }
              } catch (e) {
                console.error('Error in pathname handler:', e);
              }
            })();
            
            // Handle client-side navigation
            const handleRouteChange = () => {
              const pathname = window.location.pathname;
              const singlePagePaths = ['/matches', '/leaderboard'];
              const isSinglePage = singlePagePaths.some(path => 
                pathname === path || pathname.startsWith(path + '/')
              );
              
              if (isSinglePage) {
                document.body.classList.add('single-page');
              } else {
                document.body.classList.remove('single-page');
              }
            };
            
            // Listen for route changes
            window.addEventListener('routeChangeComplete', handleRouteChange);
            
            // Clean up
            return () => {
              window.removeEventListener('routeChangeComplete', handleRouteChange);
            };
          `}
        </Script>
        <Script 
          src="https://kit.fontawesome.com/64e5989b68.js" 
          strategy="afterInteractive"
        />
        
        {/* jQuery and Slick Carousel */}
        <Script 
          src="https://code.jquery.com/jquery-3.7.1.min.js"
          integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
          strategy="afterInteractive"
        />
        <Script 
          src="//cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js"
          strategy="afterInteractive"
        />
        
        {/* Custom JavaScript */}
        <Script src="/assets/js/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
