import React, { useState } from 'react';
import { useBibleStore } from '@/stores/bible.store';
import { useReadingStore } from '@/stores/reading.store';
import { BibleBookList } from '@/components/bible/BibleBookList';
import { ChapterList } from '@/components/bible/ChapterList';
import { BibleReader } from '@/components/bible/BibleReader';
import { BibleNavigation } from '@/components/bible/BibleNavigation';
import { BibleTopBar } from '@/components/bible/BibleTopBar';
import { SiteFooter } from '@/components/SiteFooter';
import { SHELL_WIDE } from '@/components/PageShell';
import type { BibleBook, BibleVerse } from '@bible-rankings/shared';

export const BiblePage: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const {
    currentBook,
    currentChapter,
    chapters,
    chapterProgress,
    selectBook,
    loadChapter,
    resetSelection,
    resetBookProgress,
    isLoading,
  } = useBibleStore();
  const { loadReadStatus } = useReadingStore();

  const handleBookSelect = async (book: BibleBook) => {
    await selectBook(book.id);
  };

  const handleChapterSelect = async (chapterNumber: number) => {
    if (currentBook) {
      await loadChapter(currentBook.id, chapterNumber);
      setShowSidebar(false);
    }
  };

  const handleNavigate = async (bookId: number, chapterNumber: number) => {
    await loadChapter(bookId, chapterNumber);
  };

  const handleVerseRead = (verse: BibleVerse) => {
    console.log('Verse read:', verse);
  };

  const handleResetBook = async () => {
    if (!currentBook) return;

    const confirmed = window.confirm(
      `确定要重置「${currentBook.nameCn}」的章节阅读标记吗？\n\n章节书签将恢复为未读，可重新阅读本书。您的累计阅读统计不会减少。`,
    );
    if (!confirmed) return;

    setIsResetting(true);
    try {
      await resetBookProgress(currentBook.id);
      if (currentChapter?.verses) {
        await loadReadStatus(currentChapter.verses.map((v) => v.id), currentBook.id);
      }
    } catch (error) {
      console.error('Failed to reset book progress:', error);
      window.alert('重置失败，请稍后重试');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bone flex flex-col">
      <BibleTopBar
        bookName={currentBook?.nameCn}
        chapterNumber={currentChapter?.chapterNumber}
        onToggleSidebar={() => setShowSidebar((v) => !v)}
      />

      <div className={`${SHELL_WIDE} mx-auto px-8 py-8 flex-1 w-full`}>
        <div className="flex gap-12">
          <div
            className={`
            ${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
            fixed inset-y-0 left-0 z-40 w-80 bg-surface border-r border-border-warm
            lg:static lg:block lg:w-72 lg:border-r-0 transition-transform duration-300 ease-in-out
            overflow-y-auto top-16 lg:top-auto
          `}
          >
            <div className="p-8 lg:p-0">
              {showSidebar && (
                <div className="lg:hidden flex justify-between items-center mb-8">
                  <span className="text-sm font-bold uppercase tracking-widest">目录</span>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="text-muted hover:text-ink focus-ring"
                    type="button"
                  >
                    关闭
                  </button>
                </div>
              )}

              <div className="space-y-8">
                {currentBook && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border-warm pb-4">
                      <h3 className="text-lg font-medium text-ink">{currentBook.nameCn}</h3>
                      <button
                        onClick={resetSelection}
                        className="text-xs uppercase tracking-wider text-muted hover:text-ink focus-ring"
                        type="button"
                      >
                        更换
                      </button>
                    </div>

                    <ChapterList
                      chapters={chapters}
                      chapterProgress={chapterProgress}
                      onChapterSelect={handleChapterSelect}
                      selectedChapter={currentChapter?.chapterNumber}
                      isLoading={isLoading}
                      onReset={handleResetBook}
                      isResetting={isResetting}
                    />
                  </div>
                )}

                {!currentBook && (
                  <BibleBookList onBookSelect={handleBookSelect} selectedBookId={undefined} />
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="max-w-3xl mx-auto">
              <BibleReader onVerseRead={handleVerseRead} />
            </div>

            {currentBook && currentChapter && (
              <div className="mt-12 border-t border-border-warm pt-8">
                <BibleNavigation onNavigate={handleNavigate} />
              </div>
            )}
          </div>
        </div>
      </div>

      {showSidebar && (
        <div
          className="fixed inset-0 bg-surface/45 backdrop-blur-[2px] z-30 lg:hidden top-16"
          onClick={() => setShowSidebar(false)}
          aria-hidden
        />
      )}

      <SiteFooter />
    </div>
  );
};
