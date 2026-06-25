import { prisma } from '@/config/database';
import {
  normalizeZhVerseText,
  ZH_MERGED_VERSE_NOTE,
  type BibleBook,
  type BibleChapter,
  type BibleVerse,
} from '@bible-rankings/shared';

type VerseRow = {
  id: string;
  chapterId: string;
  verseNumber: number;
  textCn: string;
  textEn: string;
  chapter?: {
    id: string;
    bookId: number;
    chapterNumber: number;
    verseCount: number;
    book: {
      id: number;
      nameCn: string;
      nameEn: string;
      abbreviation: string;
      testament: string;
      bookOrder: number;
    } | null;
  } | null;
};

function mapBook(book: NonNullable<VerseRow['chapter']>['book']) {
  return {
    id: book.id,
    nameCn: book.nameCn,
    nameEn: book.nameEn,
    abbreviation: book.abbreviation,
    testament: book.testament as 'OT' | 'NT',
    bookOrder: book.bookOrder,
  };
}

function mapVerse(verse: VerseRow): BibleVerse {
  return {
    id: verse.id,
    chapterId: verse.chapterId,
    verseNumber: verse.verseNumber,
    textCn: normalizeZhVerseText(verse.textCn),
    textEn: verse.textEn,
    chapter: verse.chapter
      ? {
          id: verse.chapter.id,
          bookId: verse.chapter.bookId,
          chapterNumber: verse.chapter.chapterNumber,
          verseCount: verse.chapter.verseCount,
          book: verse.chapter.book ? mapBook(verse.chapter.book) : undefined,
        }
      : undefined,
  };
}

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
    
    return verses.map(mapVerse);
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
      verses: chapter.verses.map((verse) => mapVerse(verse)),
    };
  }

  static async searchVerses(query: string, limit: number = 20): Promise<BibleVerse[]> {
    const verses = await prisma.bibleVerse.findMany({
      where: {
        AND: [
          {
            OR: [
              { textCn: { contains: query, mode: 'insensitive' } },
              { textEn: { contains: query, mode: 'insensitive' } },
            ],
          },
          { NOT: { textCn: ZH_MERGED_VERSE_NOTE } },
          { NOT: { textCn: 'a' } },
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
    
    return verses.map(mapVerse);
  }
}