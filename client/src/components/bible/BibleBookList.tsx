import React, { useEffect } from 'react';
import { useBibleStore } from '@/stores/bible.store';
import type { BibleBook } from '@bible-rankings/shared';

interface BibleBookListProps {
  onBookSelect: (book: BibleBook) => void;
  selectedBookId?: number;
}

export const BibleBookList: React.FC<BibleBookListProps> = ({
  onBookSelect,
  selectedBookId
}) => {
  const { books, loadBooks, isLoading, error, language } = useBibleStore();

  useEffect(() => {
    if (books.length === 0) {
      loadBooks();
    }
  }, [books.length, loadBooks]);

  const otBooks = books.filter(book => book.testament === 'OT');
  const ntBooks = books.filter(book => book.testament === 'NT');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const truncateText = (text: string, maxLength: number = 4): string => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - 1) + '...';
  };

  const BookSection: React.FC<{ title: string; books: BibleBook[] }> = ({ title, books }) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {books.map(book => {
          const displayName = language === 'cn' ? book.nameCn : book.nameEn;
          const truncatedName = truncateText(displayName);
          
          return (
            <button
              key={book.id}
              onClick={() => onBookSelect(book)}
              className={`
                p-3 text-sm rounded-lg border transition-colors text-center min-h-[80px] flex flex-col justify-center
                ${selectedBookId === book.id
                  ? 'bg-primary-50 border-primary-200 text-primary-800'
                  : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <div className="text-xl font-bold mb-1">
                {language === 'cn' ? book.nameCnShort : book.abbreviation}
              </div>
              <div className="text-xs text-gray-500">
                {truncatedName}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">圣经书卷</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => useBibleStore.getState().setLanguage('cn')}
            className={`px-3 py-1 text-sm rounded ${
              language === 'cn'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            中文
          </button>
          <button
            onClick={() => useBibleStore.getState().setLanguage('en')}
            className={`px-3 py-1 text-sm rounded ${
              language === 'en'
                ? 'bg-primary-100 text-primary-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            English
          </button>
        </div>
      </div>

      <BookSection title="旧约 (Old Testament)" books={otBooks} />
      <BookSection title="新约 (New Testament)" books={ntBooks} />
    </div>
  );
};