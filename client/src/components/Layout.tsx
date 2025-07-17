// client/src/components/Layout.tsx
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import type { Theme } from '../App';
import '../assets/css/style.css'; // Import the main app styles here

interface LayoutProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  children?: React.ReactNode; 
}

const Layout: React.FC<LayoutProps> = ({ currentTheme, onThemeChange }) => {

  // THIS IS THE FIX: This hook now targets the #root div
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('root-app-layout'); // Apply the main app layout
    }
    // This cleanup function runs when you navigate away
    return () => {
      if (root) {
        root.classList.remove('root-app-layout');
      }
    };
  }, []);

  return (
    // We can remove the extra div wrapper here. The layout is handled by #root now.
    <>
      <Header />
      <main className="site-main">
        <Outlet />
      </main>
      <Footer currentTheme={currentTheme} onThemeChange={onThemeChange} />
    </>
  );
};

export default Layout;