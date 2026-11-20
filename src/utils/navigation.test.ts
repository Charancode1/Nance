import { describe, it, expect } from 'vitest';
import {
  resolveCurrentPage,
  getPathForPage,
  getTitleForPage,
} from './navigation';

describe('Nance Habits Navigation & Page Routing', () => {
  it('resolves /weekly-wins to weekly_wins page', () => {
    expect(resolveCurrentPage('/weekly-wins', '', '', null)).toBe('weekly_wins');
  });

  it('resolves /save-first to save_first page', () => {
    expect(resolveCurrentPage('/save-first', '', '', null)).toBe('save_first');
  });

  it('defaults / or empty path to weekly_wins', () => {
    expect(resolveCurrentPage('/', '', '', null)).toBe('weekly_wins');
    expect(resolveCurrentPage('', '', '', null)).toBe('weekly_wins');
  });

  it('resolves query parameters ?page=save-first or ?tab=save_first to save_first', () => {
    expect(resolveCurrentPage('/', '?page=save-first', '', null)).toBe('save_first');
    expect(resolveCurrentPage('/', '?tab=save_first', '', null)).toBe('save_first');
    expect(resolveCurrentPage('/', '?page=weekly-wins', '', null)).toBe('weekly_wins');
  });

  it('resolves hash #/save-first to save_first', () => {
    expect(resolveCurrentPage('/', '', '#/save-first', null)).toBe('save_first');
    expect(resolveCurrentPage('/', '', '#/weekly-wins', null)).toBe('weekly_wins');
  });

  it('uses localStorage as fallback when path is root and no params exist', () => {
    expect(resolveCurrentPage('/', '', '', 'save_first')).toBe('save_first');
    expect(resolveCurrentPage('/', '', '', 'weekly_wins')).toBe('weekly_wins');
  });

  it('generates canonical paths and document titles for both pages', () => {
    expect(getPathForPage('weekly_wins')).toBe('/weekly-wins');
    expect(getPathForPage('save_first')).toBe('/save-first');

    expect(getTitleForPage('weekly_wins')).toBe('Weekly Wins • Nance Habits');
    expect(getTitleForPage('save_first')).toBe('Save First • Nance Habits');
  });
});
