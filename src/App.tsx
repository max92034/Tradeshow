import { useEffect } from 'react';
import Home from "@/pages/Home";
import { ToastContainer } from "@/components/Toast";
import { useSettingsStore } from './store/useSettingsStore';

export default function App() {
  const theme = useSettingsStore(state => state.theme);

  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-gold', 'theme-lakers');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <>
      <ToastContainer />
      <Home />
    </>
  );
}
