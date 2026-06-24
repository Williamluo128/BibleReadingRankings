import React from 'react';
import { clsx } from 'clsx';
import type { BibleChapter } from '@bible-rankings/shared';
import type { ChapterReadStatus } from '@/services/reading.api';

interface ChapterListProps {
  chapters: BibleChapter[];
  chapterProgress?: Record<number, ChapterReadStatus>;
  onChapterSelect: (chapterNumber: number) => void;
  selectedChapter?: number;
  isLoading?: boolean;
  onReset?: () => void;
  isResetting?: boolean;
}

function statusClass(status: ChapterReadStatus, isSelected: boolean): string | false {
  if (isSelected) return 'chapter-bookmark--selected';
  if (status === 'reading') return 'chapter-bookmark--reading';
  if (status === 'complete') return 'chapter-bookmark--complete';
  return false;
}

const LEGEND = [
  { status: 'unread' as const, label: '未读', className: 'chapter-bookmark chapter-bookmark--legend' },
  { status: 'reading' as const, label: '阅读中', className: 'chapter-bookmark chapter-bookmark--reading chapter-bookmark--legend' },
  { status: 'complete' as const, label: '已完成', className: 'chapter-bookmark chapter-bookmark--complete chapter-bookmark--legend' },
];

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  chapterProgress = {},
  onChapterSelect,
  selectedChapter,
  isLoading = false,
  onReset,
  isResetting = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-ink" />
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="text-muted text-center py-4 font-light">
        暂无章节数据
      </div>
    );
  }

  const bookFullyComplete =
    chapters.length > 0 &&
    chapters.every((ch) => (chapterProgress[ch.chapterNumber] ?? 'unread') === 'complete');

  return (
    <div className="space-y-3">
      <h3 className="text-label">选择章节</h3>
      <div className="chapter-bookmark-stack pl-3 pr-1">
        {chapters.map((chapter, index) => {
          const isSelected = selectedChapter === chapter.chapterNumber;
          const status = chapterProgress[chapter.chapterNumber] ?? 'unread';
          const stackZ = isSelected ? 1000 : index + 1;

          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onChapterSelect(chapter.chapterNumber)}
              aria-label={`第 ${chapter.chapterNumber} 章${
                status === 'complete' ? '，已读完' : status === 'reading' ? '，阅读中' : ''
              }`}
              aria-current={isSelected ? 'page' : undefined}
              style={{ zIndex: stackZ }}
              className={clsx('chapter-bookmark', statusClass(status, isSelected))}
            >
              {chapter.chapterNumber}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-2">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {LEGEND.map(({ status, label, className }) => (
            <span key={status} className="inline-flex items-center gap-2 text-xs text-muted">
              <span className={className} aria-hidden />
              {label}
            </span>
          ))}
        </div>
        {onReset && bookFullyComplete && (
          <button
            type="button"
            onClick={onReset}
            disabled={isResetting}
            className="text-xs text-muted hover:text-ink transition-colors focus-ring disabled:opacity-40 shrink-0"
          >
            {isResetting ? '重置中…' : '重置本书'}
          </button>
        )}
      </div>
    </div>
  );
};
