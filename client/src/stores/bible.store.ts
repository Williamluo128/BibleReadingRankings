import { create } from 'zustand';
import type { BibleBook, BibleChapter, BibleVerse } from '@bible-rankings/shared';
import { BibleAPI } from '@/services/bible.api';

interface BibleState {
  books: BibleBook[];
  currentBook: BibleBook | null;
  currentChapter: (BibleChapter & { verses: BibleVerse[] }) | null;
  chapters: BibleChapter[];
  searchResults: BibleVerse[];
  isLoading: boolean;
  error: string | null;
  language: 'cn' | 'en';
  
  // Actions
  loadBooks: () => Promise<void>;
  selectBook: (bookId: number) => Promise<void>;
  loadChapter: (bookId: number, chapterNumber: number) => Promise<void>;
  searchVerses: (query: string) => Promise<void>;
  setLanguage: (language: 'cn' | 'en') => void;
  clearError: () => void;
  resetSelection: () => void;
}

export const useBibleStore = create<BibleState>((set, get) => ({
  books: [],
  currentBook: null,
  currentChapter: null,
  chapters: [],
  searchResults: [],
  isLoading: false,
  error: null,
  language: 'cn',

  loadBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const books = await BibleAPI.getAllBooks();
      set({ books, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载书卷失败',
        isLoading: false 
      });
    }
  },

  selectBook: async (bookId: number) => {
    set({ isLoading: true, error: null });
    try {
      const [book, chapters] = await Promise.all([
        BibleAPI.getBook(bookId),
        BibleAPI.getChaptersByBook(bookId)
      ]);
      set({ 
        currentBook: book, 
        chapters,
        currentChapter: null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载书卷失败',
        isLoading: false 
      });
    }
  },

  loadChapter: async (bookId: number, chapterNumber: number) => {
    set({ isLoading: true, error: null });
    try {
      const chapter = await BibleAPI.getChapter(bookId, chapterNumber);
      
      // If we don't have the book loaded, load it
      if (!get().currentBook || get().currentBook?.id !== bookId) {
        const book = await BibleAPI.getBook(bookId);
        set({ currentBook: book });
      }
      
      set({ currentChapter: chapter, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '加载章节失败',
        isLoading: false 
      });
    }
  },

  searchVerses: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const results = await BibleAPI.searchVerses(query, 50);
      set({ searchResults: results.verses, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '搜索失败',
        isLoading: false 
      });
    }
  },

  setLanguage: (language: 'cn' | 'en') => {
    set({ language });
  },

  clearError: () => {
    set({ error: null });
  },

  resetSelection: () => {
    set({
      currentBook: null,
      currentChapter: null,
      chapters: [],
    });
  },
}));