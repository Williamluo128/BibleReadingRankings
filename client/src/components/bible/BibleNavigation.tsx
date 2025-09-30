import React from 'react';
import { useBibleStore } from '@/stores/bible.store';

interface BibleNavigationProps {
  onNavigate: (bookId: number, chapterNumber: number) => void;
}

export const BibleNavigation: React.FC<BibleNavigationProps> = ({ onNavigate }) => {
  const { currentBook, currentChapter, chapters, books } = useBibleStore();

  if (!currentBook || !currentChapter) {
    return null;
  }

  const currentChapterNumber = currentChapter.chapterNumber;
  const totalChapters = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapterNumber)) : 0;
  
  // Find previous and next chapters
  const hasPrevious = currentChapterNumber > 1;
  const hasNext = currentChapterNumber < totalChapters;
  
  // Find previous and next books
  const currentBookIndex = books.findIndex(book => book.id === currentBook.id);
  const previousBook = currentBookIndex > 0 ? books[currentBookIndex - 1] : null;
  const nextBook = currentBookIndex < books.length - 1 ? books[currentBookIndex + 1] : null;

  const handlePrevious = () => {
    if (hasPrevious) {
      onNavigate(currentBook.id, currentChapterNumber - 1);
    } else if (previousBook) {
      // Get the last chapter of the previous book
      // For now, assume each book has at least one chapter
      onNavigate(previousBook.id, 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigate(currentBook.id, currentChapterNumber + 1);
    } else if (nextBook) {
      onNavigate(nextBook.id, 1);
    }
  };

  const canGoPrevious = hasPrevious || previousBook;
  const canGoNext = hasNext || nextBook;

  return (
    <div className="flex items-center justify-between py-4 border-t border-gray-200">
      <button
        onClick={handlePrevious}
        disabled={!canGoPrevious}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${canGoPrevious 
            ? 'text-primary-700 bg-primary-50 hover:bg-primary-100' 
            : 'text-gray-400 bg-gray-50 cursor-not-allowed'
          }
        `}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>
          {hasPrevious 
            ? `第${currentChapterNumber - 1}章` 
            : previousBook 
              ? `${previousBook.nameCn}` 
              : '上一章'
          }
        </span>
      </button>

      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>{currentBook.nameCn}</span>
        <span className="text-gray-400">·</span>
        <span>第 {currentChapterNumber} 章</span>
        <span className="text-gray-400">·</span>
        <span>{currentChapter.verses?.length || 0} 节</span>
      </div>

      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${canGoNext 
            ? 'text-primary-700 bg-primary-50 hover:bg-primary-100' 
            : 'text-gray-400 bg-gray-50 cursor-not-allowed'
          }
        `}
      >
        <span>
          {hasNext 
            ? `第${currentChapterNumber + 1}章` 
            : nextBook 
              ? `${nextBook.nameCn}` 
              : '下一章'
          }
        </span>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};