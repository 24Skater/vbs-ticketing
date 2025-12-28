/**
 * Main Layout Component
 * Wraps pages with Header and Footer
 */

import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, hideHeader = false, hideFooter = false }) {
  return (
    <div className="site-layout">
      {!hideHeader && <Header />}
      <main className="site-main">
        {children}
      </main>
      {!hideFooter && <Footer />}
      
      <style>{`
        .site-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .site-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}

