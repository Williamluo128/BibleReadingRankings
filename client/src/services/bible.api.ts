import { api } from './api';
import type { 
  ApiResponse,
  BibleBook,
  BibleChapter,
  BibleVerse
} from '@bible-rankings/shared';

interface BibleBooksResponse {
  books: BibleBook[];
}

interface BibleBookResponse {
  book: BibleBook;
}

interface BibleChaptersResponse {
  chapters: BibleChapter[];
}

interface BibleChapterResponse {
  chapter: BibleChapter & {
    verses: BibleVerse[];
  };
}

interface BibleSearchResponse {
  verses: BibleVerse[];
  query: string;
  total: number;
}

export class BibleAPI {
  static async getAllBooks(): Promise<BibleBook[]> {
    const response = await api.get<ApiResponse<BibleBooksResponse>>('/bible/books');
    return response.data.data!.books;
  }

  static async getBook(bookId: number): Promise<BibleBook> {
    const response = await api.get<ApiResponse<BibleBookResponse>>(`/bible/books/${bookId}`);
    return response.data.data!.book;
  }

  static async getChaptersByBook(bookId: number): Promise<BibleChapter[]> {
    const response = await api.get<ApiResponse<BibleChaptersResponse>>(`/bible/books/${bookId}/chapters`);
    return response.data.data!.chapters;
  }

  static async getChapter(bookId: number, chapterNumber: number): Promise<BibleChapter & { verses: BibleVerse[] }> {
    const response = await api.get<ApiResponse<BibleChapterResponse>>(
      `/bible/books/${bookId}/chapters/${chapterNumber}`
    );
    return response.data.data!.chapter;
  }

  static async searchVerses(query: string, limit: number = 20): Promise<BibleSearchResponse> {
    const response = await api.get<ApiResponse<BibleSearchResponse>>('/bible/search', {
      params: { q: query, limit }
    });
    return response.data.data!;
  }
}