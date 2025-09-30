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
    isLoading: readingLoading 
  } = useReadingStore();
  const [selectedVerses, setSelectedVerses] = useState<Set<string>>(new Set());

  // 当章节变化时，加载阅读状态
  useEffect(() => {
    if (currentChapter?.verses) {
      const verseIds = currentChapter.verses.map(v => v.id);
      loadReadStatus(verseIds);
    }
  }, [currentChapter, loadReadStatus]);

  const handleVerseClick = async (verse: BibleVerse) => {
    const newSelected = new Set(selectedVerses);
    const isCurrentlySelected = newSelected.has(verse.id);
    
    if (isCurrentlySelected) {
      newSelected.delete(verse.id);
    } else {
      newSelected.add(verse.id);
      onVerseRead?.(verse);
      
      // 立即标记为已读
      try {
        await markVerseAsRead(verse.id);
      } catch (error) {
        console.error('Failed to mark verse as read:', error);
      }
    }
    setSelectedVerses(newSelected);
  };

  const handleSaveAllSelected = async () => {
    if (selectedVerses.size === 0) return;
    
    try {
      const verseIds = Array.from(selectedVerses);
      await markMultipleVersesAsRead(verseIds);
      setSelectedVerses(new Set()); // 清空选择
    } catch (error) {
      console.error('Failed to save reading records:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
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

  if (!currentChapter || !currentBook) {
    return (
      <div className="text-center py-12">
        <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">选择要阅读的章节</h3>
        <p className="text-gray-600">从左侧选择圣经书卷和章节开始阅读</p>
      </div>
    );
  }

  const bookName = language === 'cn' ? currentBook.nameCn : currentBook.nameEn;

  return (
    <div className="space-y-6">
      {/* Chapter Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {bookName} {currentChapter.chapterNumber}
          </h1>
          <div className="text-sm text-gray-500">
            共 {currentChapter.verses?.length || 0} 节
          </div>
        </div>
      </div>

      {/* Reading Progress */}
      {(selectedVerses.size > 0 || (totalStats && totalStats.todayVerses > 0)) && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                本章选中 {selectedVerses.size} 节
                {totalStats && (
                  <span className="ml-2 text-green-600">
                    • 今日已读 {totalStats.todayVerses} 节
                  </span>
                )}
              </span>
            </div>
            {totalStats && (
              <div className="text-sm text-green-600">
                累计 {totalStats.totalVerses} 节 ({totalStats.totalDays} 天)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Verses */}
      <div className="space-y-4">
        {currentChapter.verses?.map(verse => {
          const isSelected = selectedVerses.has(verse.id);
          const isRead = readVerses.has(verse.id);
          const verseText = language === 'cn' ? verse.textCn : verse.textEn;
          
          return (
            <div
              key={verse.id}
              className={`group cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-green-50 border-l-4 border-green-400 pl-4' 
                  : isRead
                    ? 'bg-blue-50 border-l-4 border-blue-400 pl-4'
                    : 'hover:bg-gray-50 pl-4'
              }`}
              onClick={() => handleVerseClick(verse)}
            >
              <div className="flex items-start space-x-3 py-3">
                <span className={`
                  inline-flex items-center justify-center w-8 h-8 text-sm font-medium rounded-full flex-shrink-0 mt-1
                  ${isSelected 
                    ? 'bg-green-500 text-white' 
                    : isRead
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 group-hover:bg-primary-200 group-hover:text-primary-800'
                  }
                `}>
                  {verse.verseNumber}
                </span>
                <p className={`
                  text-lg leading-relaxed flex-1
                  ${language === 'cn' ? 'font-serif' : 'font-sans'}
                  ${isSelected ? 'text-green-900' : isRead ? 'text-blue-900' : 'text-gray-800'}
                `}>
                  {verseText}
                </p>
                <div className="flex-shrink-0 mt-1">
                  {isSelected ? (
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isRead ? (
                    <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reading Actions */}
      {selectedVerses.size > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              本次阅读了 {selectedVerses.size} 节经文
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setSelectedVerses(new Set())}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                重置
              </button>
              <button
                onClick={handleSaveAllSelected}
                disabled={readingLoading}
                className="px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 rounded-lg"
              >
                {readingLoading ? '保存中...' : '保存阅读记录'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};