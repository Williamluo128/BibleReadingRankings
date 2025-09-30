import React from 'react';
import type { BibleChapter } from '@bible-rankings/shared';

interface ChapterListProps {
  chapters: BibleChapter[];
  onChapterSelect: (chapterNumber: number) => void;
  selectedChapter?: number;
  isLoading?: boolean;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  onChapterSelect,
  selectedChapter,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        暂无章节数据
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900">选择章节</h3>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        {chapters.map(chapter => (
          <button
            key={chapter.id}
            onClick={() => onChapterSelect(chapter.chapterNumber)}
            className={`
              w-10 h-10 text-sm font-medium rounded-lg border transition-colors
              ${selectedChapter === chapter.chapterNumber
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white border-gray-200 hover:bg-primary-50 hover:border-primary-200 text-gray-700'
              }
            `}
          >
            {chapter.chapterNumber}
          </button>
        ))}
      </div>
    </div>
  );
};