import React, { useState } from 'react';
import { useBibleStore } from '@/stores/bible.store';
import { BibleBookList } from '@/components/bible/BibleBookList';
import { ChapterList } from '@/components/bible/ChapterList';
import { BibleReader } from '@/components/bible/BibleReader';
import { BibleNavigation } from '@/components/bible/BibleNavigation';
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
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Minimalist Header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-gray-900 hover:text-gray-600 lg:hidden"
              >
                <span className="text-sm uppercase tracking-wider">目录</span>
              </button>

              {currentBook && currentChapter ? (
                <div className="flex items-baseline space-x-4">
                  <h2 className="text-xl font-light text-gray-900">
                    {currentBook.nameCn}
                  </h2>
                  <span className="text-lg text-gray-400 font-light">
                    第 {currentChapter.chapterNumber} 章
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-500 tracking-wide">选择经文开始阅读</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex gap-12">
          {/* Sidebar - Minimalist */}
          <div className={`
            ${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-gray-100 
            lg:static lg:block lg:w-72 lg:border-r-0 transition-transform duration-300 ease-in-out
            overflow-y-auto
          `}>
            <div className="p-8 lg:p-0">
              {showSidebar && (
                <div className="lg:hidden flex justify-between items-center mb-8">
                  <span className="text-sm font-bold uppercase tracking-widest">目录</span>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="text-gray-400 hover:text-gray-900"
                  >
                    关闭
                  </button>
                </div>
              )}

              <div className="space-y-8">
                {/* Current Book and Chapters */}
                {currentBook && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {currentBook.nameCn}
                      </h3>
                      <button
                        onClick={resetSelection}
                        className="text-xs uppercase tracking-wider text-gray-500 hover:text-gray-900"
                      >
                        更换
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
                    selectedBookId={undefined}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Minimalist */}
          <div className="flex-1 min-w-0">
            <div className="max-w-3xl mx-auto">
              <BibleReader onVerseRead={handleVerseRead} />
            </div>

            {currentBook && currentChapter && (
              <div className="mt-12 border-t border-gray-100 pt-8">
                <BibleNavigation onNavigate={handleNavigate} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-white/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};