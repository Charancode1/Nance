export type PageId = 'weekly_wins' | 'save_first';

export const PAGE_STORAGE_KEY = 'nance_active_habit_page';

/**
 * Resolves the active habit page from URL pathname, query param, hash, or localStorage.
 * Defaults to 'weekly_wins'.
 */
export function resolveCurrentPage(
  pathname = typeof window !== 'undefined' ? window.location.pathname : '',
  search = typeof window !== 'undefined' ? window.location.search : '',
  hash = typeof window !== 'undefined' ? window.location.hash : '',
  storageValue = typeof localStorage !== 'undefined' ? localStorage.getItem(PAGE_STORAGE_KEY) : null
): PageId {
  // 1. Check pathname (e.g. /save-first or /weekly-wins)
  const lowerPath = pathname.toLowerCase();
  if (lowerPath.includes('save-first') || lowerPath.includes('save_first')) {
    return 'save_first';
  }
  if (lowerPath.includes('weekly-wins') || lowerPath.includes('weekly_wins')) {
    return 'weekly_wins';
  }

  // 2. Check query params (e.g. ?page=save-first or ?tab=save_first)
  try {
    const params = new URLSearchParams(search);
    const param = params.get('page') || params.get('tab');
    if (param === 'save_first' || param === 'save-first') {
      return 'save_first';
    }
    if (param === 'weekly_wins' || param === 'weekly-wins') {
      return 'weekly_wins';
    }
  } catch {
    // Ignore invalid search query
  }

  // 3. Check hash (e.g. #/save-first)
  const lowerHash = hash.toLowerCase();
  if (lowerHash.includes('save-first') || lowerHash.includes('save_first')) {
    return 'save_first';
  }
  if (lowerHash.includes('weekly-wins') || lowerHash.includes('weekly_wins')) {
    return 'weekly_wins';
  }

  // 4. Check localStorage fallback
  if (storageValue === 'save_first' || storageValue === 'weekly_wins') {
    return storageValue;
  }

  return 'weekly_wins';
}

export function getPathForPage(page: PageId): string {
  return page === 'save_first' ? '/save-first' : '/weekly-wins';
}

export function getTitleForPage(page: PageId): string {
  return page === 'save_first'
    ? 'Save First • Nance Habits'
    : 'Weekly Wins • Nance Habits';
}
