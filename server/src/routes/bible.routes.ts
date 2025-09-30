import { Router } from 'express';
import { BibleController } from '@/controllers/bible.controller';
import { optionalAuth } from '@/middleware/auth.middleware';

const router = Router();

// GET /api/bible/books - Get all bible books
router.get('/books', optionalAuth, BibleController.getBooks);

// GET /api/bible/books/:bookId - Get specific bible book
router.get('/books/:bookId', optionalAuth, BibleController.getBook);

// GET /api/bible/books/:bookId/chapters - Get chapters of a book
router.get('/books/:bookId/chapters', optionalAuth, BibleController.getChapters);

// GET /api/bible/books/:bookId/chapters/:chapterNumber - Get specific chapter with verses
router.get('/books/:bookId/chapters/:chapterNumber', optionalAuth, BibleController.getChapter);

// GET /api/bible/search - Search bible verses
router.get('/search', optionalAuth, BibleController.searchVerses);

export { router as bibleRoutes };