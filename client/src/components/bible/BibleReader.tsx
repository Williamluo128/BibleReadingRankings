import React, { useState, useEffect } from 'react';
import { useBibleStore } from '@/stores/bible.store';
import { useReadingStore } from '@/stores/reading.store';
import type { BibleVerse } from '@bible-rankings/shared';

interface BibleReaderProps {
  onVerseRead?: (verse: BibleVerse) => void;
}

export const BibleReader: React.FC<BibleReaderProps> = ({ onVerseRead }) => {
  const { currentChapter, currentBook, language, isLoading, error } = useBibleStore();
  const {
    readVerses,
    markVerseAsRead,
    markMultipleVersesAsRead,
    loadReadStatus,
    totalStats,
    loadTotalStats,
  } = useReadingStore();
  const [selectedVerses, setSelectedVerses] = useState<Set<string>>(new Set());

  useEffect(() => {
    void loadTotalStats();
  }, [loadTotalStats]);

  // 当章节变化时，加载阅读状态
  useEffect(() => {
    if (currentChapter?.verses) {
      const verseIds = currentChapter.verses.map(v => v.id);
      loadReadStatus(verseIds);
    }
  }, [currentChapter, loadReadStatus]);

  const handleVerseClick = (verse: BibleVerse) => {
    const newSelected = new Set(selectedVerses);
    const isCurrentlySelected = newSelected.has(verse.id);

    if (isCurrentlySelected) {
      newSelected.delete(verse.id);
    } else {
      newSelected.add(verse.id);
      onVerseRead?.(verse);
      void markVerseAsRead(verse.id).catch((error) => {
        console.error('Failed to mark verse as read:', error);
      });
    }
    setSelectedVerses(newSelected);
  };

  const handleSaveAllSelected = () => {
    if (selectedVerses.size === 0) return;

    const verseIds = Array.from(selectedVerses);
    setSelectedVerses(new Set());
    void markMultipleVersesAsRead(verseIds).catch((error) => {
      console.error('Failed to save reading records:', error);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse text-gray-300">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-l-2 border-red-500 pl-4 py-4 text-red-600">
        {error}
      </div>
    );
  }

  if (!currentChapter || !currentBook) {
    return (
      <div className="text-center py-32">
        <h3 className="text-xl font-light text-gray-900 mb-4">开始阅读</h3>
        <p className="text-gray-400 font-light">请从左侧目录选择书卷和章节</p>
      </div>
    );
  }

  const bookName = language === 'cn' ? currentBook.nameCn : currentBook.nameEn;

  return (
    <div className="space-y-12">
      {/* Chapter Header - Minimalist */}
      <div className="text-center pb-12 border-b border-gray-100">
        <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4 tracking-tight">
          {bookName}
        </h1>
        <div className="text-xl font-light text-gray-400">
          第 {currentChapter.chapterNumber} 章
        </div>
      </div>

      {/* Reading Progress - Minimalist */}
      {(selectedVerses.size > 0 || (totalStats && totalStats.todayVerses > 0)) && (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 text-sm">
          <div className="text-gray-500">
            <span className="font-medium text-gray-900">{selectedVerses.size}</span> 节已选
            {totalStats && (
              <span className="ml-4 text-gray-400">
                今日已读 {totalStats.todayVerses}
              </span>
            )}
          </div>
          {totalStats && (
            <div className="text-gray-400 font-mono text-xs">
              TOTAL: {totalStats.totalVerses}
            </div>
          )}
        </div>
      )}

      {/* Verses - Minimalist Typography */}
      <div className="space-y-6">
        {currentChapter.verses?.map(verse => {
          const isSelected = selectedVerses.has(verse.id);
          const isRead = readVerses.has(verse.id);
          const verseText = language === 'cn' ? verse.textCn : verse.textEn;

          return (
            <div
              key={verse.id}
              className={`
                group relative pl-8 md:pl-12 py-2 cursor-pointer transition-all duration-300
                ${isSelected ? 'opacity-100' : 'opacity-90 hover:opacity-100'}
              `}
              onClick={() => handleVerseClick(verse)}
            >
              {/* Verse Number */}
              <span className={`
                absolute left-0 top-3 text-xs font-mono
                ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-300 group-hover:text-gray-500'}
              `}>
                {verse.verseNumber}
              </span>

              {/* Verse Text */}
              <p className={`
                bible-text text-lg md:text-xl leading-loose
                ${isSelected ? 'text-gray-900' : isRead ? 'text-gray-600' : 'text-gray-800'}
                ${isRead && !isSelected ? 'decoration-gray-200 underline decoration-1 underline-offset-4' : ''}
              `}>
                {verseText}
              </p>

              {/* Selection Indicator - Left Line */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-900" />
              )}
            </div>
          );
        })}
      </div>

      {/* Reading Actions - Minimalist Floating Bar */}
      {selectedVerses.size > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white px-6 py-3 shadow-2xl flex items-center space-x-6">
            <span className="text-sm font-medium">
              已选 {selectedVerses.size} 节
            </span>
            <div className="h-4 w-px bg-gray-700" />
            <button
              onClick={() => setSelectedVerses(new Set())}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSaveAllSelected}
              className="text-sm font-bold uppercase tracking-wide hover:text-gray-300 transition-colors"
            >
              确认已读
            </button>
          </div>
        </div>
      )}
    </div>
  );
};