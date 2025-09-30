import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBibleStore } from '@/stores/bible.store';
import { useAuthStore } from '@/stores/auth.store';
import { BibleBookList } from '@/components/bible/BibleBookList';
import { ChapterList } from '@/components/bible/ChapterList';
import { BibleReader } from '@/components/bible/BibleReader';
import { BibleNavigation } from '@/components/bible/BibleNavigation';
import { Button } from '@/components/ui/Button';
import { Navigation } from '@/components/Navigation';
import type { BibleBook, BibleVerse } from '@bible-rankings/shared';

export const BiblePage: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { 
    currentBook, 
    currentChapter, 
    chapters, 
    selectBook, 
    loadChapter,
    resetSelection,
    isLoading 
  } = useBibleStore();
  
  const { user, logout } = useAuthStore();

  const handleBookSelect = async (book: BibleBook) => {
    await selectBook(book.id);
    setShowSidebar(false);
  };

  const handleChapterSelect = async (chapterNumber: number) => {
    if (currentBook) {
      await loadChapter(currentBook.id, chapterNumber);
    }
  };

  const handleNavigate = async (bookId: number, chapterNumber: number) => {
    await loadChapter(bookId, chapterNumber);
  };

  const handleVerseRead = (verse: BibleVerse) => {
    // TODO: Implement reading progress tracking
    console.log('Verse read:', verse);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Bible-specific header with sidebar toggle */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="text-sm text-gray-600">选择书卷和章节开始阅读</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentBook && currentChapter && (
                <div className="hidden sm:flex items-center text-sm text-gray-600">
                  <span>{currentBook.nameCn} {currentChapter.chapterNumber}章</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className={`
            ${showSidebar ? 'block' : 'hidden'} lg:block
            w-full lg:w-80 xl:w-96 bg-white rounded-lg shadow-sm p-6
            ${showSidebar ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : ''}
          `}>
            {showSidebar && (
              <div className="lg:hidden mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">菜单</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Mobile Navigation */}
                <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
                  <Link
                    to="/"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowSidebar(false)}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>返回主页</span>
                  </Link>
                  <Link
                    to="/"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowSidebar(false)}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>查看排行榜</span>
                  </Link>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Current Book and Chapters */}
              {currentBook && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {currentBook.nameCn}
                    </h3>
                    <button
                      onClick={resetSelection}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      更换书卷
                    </button>
                  </div>
                  
                  <ChapterList
                    chapters={chapters}
                    onChapterSelect={handleChapterSelect}
                    selectedChapter={currentChapter?.chapterNumber}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {/* Book Selection */}
              {!currentBook && (
                <BibleBookList
                  onBookSelect={handleBookSelect}
                  selectedBookId={currentBook?.id}
                />
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <BibleReader onVerseRead={handleVerseRead} />
            </div>
            
            {currentBook && currentChapter && (
              <BibleNavigation onNavigate={handleNavigate} />
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};