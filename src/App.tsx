import React, { useState, useEffect, useCallback } from 'react';
import { WeeklyWinsPage } from './pages/WeeklyWinsPage';
import { SaveFirstPage } from './pages/SaveFirstPage';
import { TopNavigation } from './components/TopNavigation';
import {
  PageId,
  PAGE_STORAGE_KEY,
  resolveCurrentPage,
  getPathForPage,
  getTitleForPage,
} from './utils/navigation';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>(() => resolveCurrentPage());

  // Navigate handler that performs actual client-side navigation with History API
  const navigateTo = useCallback((page: PageId, updateHistory = true) => {
    setCurrentPage(page);
    try {
      localStorage.setItem(PAGE_STORAGE_KEY, page);
      const targetPath = getPathForPage(page);
      document.title = getTitleForPage(page);

      if (updateHistory && window.location.pathname !== targetPath) {
        window.history.pushState({ page }, '', targetPath);
      }
    } catch {
      // Ignore History/Storage exceptions in restricted contexts
    }
  }, []);

  // Sync initial URL, document title, and handle browser Back / Forward buttons
  useEffect(() => {
    const targetPath = getPathForPage(currentPage);
    document.title = getTitleForPage(currentPage);

    // If visiting the root "/", canonicalize to target path
    if (window.location.pathname === '/' || window.location.pathname === '') {
      try {
        window.history.replaceState({ page: currentPage }, '', targetPath);
      } catch {
        // Ignore
      }
    }

    const handlePopState = () => {
      const pageFromUrl = resolveCurrentPage();
      setCurrentPage(pageFromUrl);
      document.title = getTitleForPage(pageFromUrl);
      try {
        localStorage.setItem(PAGE_STORAGE_KEY, pageFromUrl);
      } catch {
        // Ignore
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-slate-900/10 flex justify-center py-0 sm:py-6 px-0 sm:px-4 font-sans antialiased">
      {/* Mobile-First Centered Container */}
      <div className="w-full max-w-[420px] bg-white min-h-screen sm:min-h-[820px] sm:rounded-[36px] shadow-2xl border-x sm:border border-slate-200/90 flex flex-col overflow-hidden relative">
        {/* Top Navigation Bar with NANCE HABITS branding and active item highlight */}
        <TopNavigation currentPage={currentPage} onNavigate={navigateTo} />

        {/* Independent Page Display */}
        {currentPage === 'weekly_wins' ? (
          <WeeklyWinsPage />
        ) : (
          <SaveFirstPage />
        )}
      </div>
    </div>
  );
};

export default App;
