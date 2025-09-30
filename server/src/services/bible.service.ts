import { prisma } from '@/config/database';
import type { BibleBook, BibleChapter, BibleVerse } from '@bible-rankings/shared';

export class BibleService {
  static async getAllBooks(): Promise<BibleBook[]> {
    const books = await prisma.bibleBook.findMany({
      orderBy: { bookOrder: 'asc' },
    });
    
    return books.map(book => ({
      id: book.id,
      nameCn: book.nameCn,
      nameCnShort: book.nameCnShort,
      nameEn: book.nameEn,
      abbreviation: book.abbreviation,
      testament: book.testament as 'OT' | 'NT',
      bookOrder: book.bookOrder,
    }));
  }

  static async getBookById(bookId: number): Promise<BibleBook | null> {
    const book = await prisma.bibleBook.findUnique({
      where: { id: bookId },
    });
    
    if (!book) return null;
    
    return {
      id: book.id,
      nameCn: book.nameCn,
      nameCnShort: book.nameCnShort,
      nameEn: book.nameEn,
      abbreviation: book.abbreviation,
      testament: book.testament as 'OT' | 'NT',
      bookOrder: book.bookOrder,
    };
  }

  static async getChaptersByBook(bookId: number): Promise<BibleChapter[]> {
    const chapters = await prisma.bibleChapter.findMany({
      where: { bookId },
      orderBy: { chapterNumber: 'asc' },
      include: {
        book: true,
      },
    });
    
    return chapters.map(chapter => ({
      id: chapter.id,
      bookId: chapter.bookId,
      chapterNumber: chapter.chapterNumber,
      verseCount: chapter.verseCount,
      book: chapter.book ? {
        id: chapter.book.id,
        nameCn: chapter.book.nameCn,
        nameEn: chapter.book.nameEn,
        abbreviation: chapter.book.abbreviation,
        testament: chapter.book.testament as 'OT' | 'NT',
        bookOrder: chapter.book.bookOrder,
      } : undefined,
    }));
  }

  static async getChapter(bookId: number, chapterNumber: number): Promise<BibleChapter | null> {
    const chapter = await prisma.bibleChapter.findFirst({
      where: {
        bookId,
        chapterNumber,
      },
      include: {
        book: true,
      },
    });
    
    if (!chapter) return null;
    
    return {
      id: chapter.id,
      bookId: chapter.bookId,
      chapterNumber: chapter.chapterNumber,
      verseCount: chapter.verseCount,
      book: chapter.book ? {
        id: chapter.book.id,
        nameCn: chapter.book.nameCn,
        nameEn: chapter.book.nameEn,
        abbreviation: chapter.book.abbreviation,
        testament: chapter.book.testament as 'OT' | 'NT',
        bookOrder: chapter.book.bookOrder,
      } : undefined,
    };
  }

  static async getVersesByChapter(chapterId: string): Promise<BibleVerse[]> {
    const verses = await prisma.bibleVerse.findMany({
      where: { chapterId },
      orderBy: { verseNumber: 'asc' },
      include: {
        chapter: {
          include: {
            book: true,
          },
        },
      },
    });
    
    return verses.map(verse => ({
      id: verse.id,
      chapterId: verse.chapterId,
      verseNumber: verse.verseNumber,
      textCn: verse.textCn,
      textEn: verse.textEn,
      chapter: verse.chapter ? {
        id: verse.chapter.id,
        bookId: verse.chapter.bookId,
        chapterNumber: verse.chapter.chapterNumber,
        verseCount: verse.chapter.verseCount,
        book: verse.chapter.book ? {
          id: verse.chapter.book.id,
          nameCn: verse.chapter.book.nameCn,
          nameEn: verse.chapter.book.nameEn,
          abbreviation: verse.chapter.book.abbreviation,
          testament: verse.chapter.book.testament as 'OT' | 'NT',
          bookOrder: verse.chapter.book.bookOrder,
        } : undefined,
      } : undefined,
    }));
  }

  static async getChapterWithVerses(bookId: number, chapterNumber: number) {
    const chapter = await prisma.bibleChapter.findFirst({
      where: {
        bookId,
        chapterNumber,
      },
      include: {
        book: true,
        verses: {
          orderBy: { verseNumber: 'asc' },
        },
      },
    });
    
    if (!chapter) return null;
    
    return {
      id: chapter.id,
      bookId: chapter.bookId,
      chapterNumber: chapter.chapterNumber,
      verseCount: chapter.verseCount,
      book: chapter.book ? {
        id: chapter.book.id,
        nameCn: chapter.book.nameCn,
        nameEn: chapter.book.nameEn,
        abbreviation: chapter.book.abbreviation,
        testament: chapter.book.testament as 'OT' | 'NT',
        bookOrder: chapter.book.bookOrder,
      } : undefined,
      verses: chapter.verses.map(verse => ({
        id: verse.id,
        chapterId: verse.chapterId,
        verseNumber: verse.verseNumber,
        textCn: verse.textCn,
        textEn: verse.textEn,
      })),
    };
  }

  static async searchVerses(query: string, limit: number = 20): Promise<BibleVerse[]> {
    const verses = await prisma.bibleVerse.findMany({
      where: {
        OR: [
          { textCn: { contains: query, mode: 'insensitive' } },
          { textEn: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      include: {
        chapter: {
          include: {
            book: true,
          },
        },
      },
      orderBy: [
        { chapter: { book: { bookOrder: 'asc' } } },
        { chapter: { chapterNumber: 'asc' } },
        { verseNumber: 'asc' },
      ],
    });
    
    return verses.map(verse => ({
      id: verse.id,
      chapterId: verse.chapterId,
      verseNumber: verse.verseNumber,
      textCn: verse.textCn,
      textEn: verse.textEn,
      chapter: verse.chapter ? {
        id: verse.chapter.id,
        bookId: verse.chapter.bookId,
        chapterNumber: verse.chapter.chapterNumber,
        verseCount: verse.chapter.verseCount,
        book: verse.chapter.book ? {
          id: verse.chapter.book.id,
          nameCn: verse.chapter.book.nameCn,
          nameEn: verse.chapter.book.nameEn,
          abbreviation: verse.chapter.book.abbreviation,
          testament: verse.chapter.book.testament as 'OT' | 'NT',
          bookOrder: verse.chapter.book.bookOrder,
        } : undefined,
      } : undefined,
    }));
  }
}