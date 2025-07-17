// client/src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Portal from './pages/Portal';
import ModpackDepot from './pages/ModpackDepot';
import ModpackDetails from './pages/ModpackDetails';
import PlayerGallery from './pages/PlayerGallery'; // <-- UPDATED IMPORT
import Admin from './pages/Admin';
import Status from './pages/Status';

// Define the theme type
export type Theme = 'mocha' | 'macchiato' | 'frappe' | 'latte';

function App() {
  const [theme, setTheme] = useState<Theme>('mocha');

  useEffect(() => {
    const savedTheme = localStorage.getItem("mrpack-depot-theme") as Theme || 'mocha';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("mrpack-depot-theme", theme);
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <Routes>
      <Route path="/" element={<Portal />} />
      <Route path="/" element={<Layout currentTheme={theme} onThemeChange={handleThemeChange} />}>
        <Route path="modpacks" element={<ModpackDepot />} />
        <Route path="modpacks/:filename" element={<ModpackDetails />} />
        <Route path="gallery" element={<PlayerGallery />} /> {/* <-- UPDATED ROUTE */}
        <Route path="admin" element={<Admin />} />
        <Route path="status" element={<Status />} />
      </Route>
      <Route path="*" element={
          <Layout currentTheme={theme} onThemeChange={handleThemeChange}>
              <div style={{ textAlign: 'center', padding: '50px' }}>
                  <h1>404 - Page Not Found</h1>
              </div>
          </Layout>
      } />
    </Routes>
  );
}

export default App;