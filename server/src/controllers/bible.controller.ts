import { Request, Response } from 'express';
import { BibleService } from '@/services/bible.service';
import type { ApiResponse } from '@bible-rankings/shared';

export class BibleController {
  static async getBooks(req: Request, res: Response): Promise<void> {
    try {
      const books = await BibleService.getAllBooks();
      
      const response: ApiResponse = {
        success: true,
        data: { books },
        message: 'Bible books retrieved successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve bible books'
      };
      
      res.status(500).json(response);
    }
  }

  static async getBook(req: Request, res: Response): Promise<void> {
    try {
      const bookId = parseInt(req.params.bookId);
      
      if (isNaN(bookId)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid book ID'
        };
        res.status(400).json(response);
        return;
      }
      
      const book = await BibleService.getBookById(bookId);
      
      if (!book) {
        const response: ApiResponse = {
          success: false,
          error: 'Book not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: { book },
        message: 'Bible book retrieved successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve bible book'
      };
      
      res.status(500).json(response);
    }
  }

  static async getChapters(req: Request, res: Response): Promise<void> {
    try {
      const bookId = parseInt(req.params.bookId);
      
      if (isNaN(bookId)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid book ID'
        };
        res.status(400).json(response);
        return;
      }
      
      const chapters = await BibleService.getChaptersByBook(bookId);
      
      const response: ApiResponse = {
        success: true,
        data: { chapters },
        message: 'Bible chapters retrieved successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve bible chapters'
      };
      
      res.status(500).json(response);
    }
  }

  static async getChapter(req: Request, res: Response): Promise<void> {
    try {
      const bookId = parseInt(req.params.bookId);
      const chapterNumber = parseInt(req.params.chapterNumber);
      
      if (isNaN(bookId) || isNaN(chapterNumber)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid book ID or chapter number'
        };
        res.status(400).json(response);
        return;
      }
      
      const chapter = await BibleService.getChapterWithVerses(bookId, chapterNumber);
      
      if (!chapter) {
        const response: ApiResponse = {
          success: false,
          error: 'Chapter not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: { chapter },
        message: 'Bible chapter retrieved successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to retrieve bible chapter'
      };
      
      res.status(500).json(response);
    }
  }

  static async searchVerses(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit } = req.query;
      
      if (!q || typeof q !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'Search query is required'
        };
        res.status(400).json(response);
        return;
      }
      
      const searchLimit = limit ? parseInt(limit as string) : 20;
      const verses = await BibleService.searchVerses(q, searchLimit);
      
      const response: ApiResponse = {
        success: true,
        data: { 
          verses,
          query: q,
          total: verses.length
        },
        message: 'Bible search completed successfully'
      };
      
      res.status(200).json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to search bible verses'
      };
      
      res.status(500).json(response);
    }
  }
}