import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import { ToastContainer } from "@/components/Toast";
import { useSettingsStore } from './store/useSettingsStore';

export default function App() {
  const theme = useSettingsStore(state => state.theme);

  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-gold', 'theme-minimal', 'theme-trumpian');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}
