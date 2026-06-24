import { prisma } from '@/config/database';

export interface BookMetadata {
  id: number;
  nameCn: string;
  testament: string;
  totalVerses: number;
}

export interface BibleMetadata {
  totalChapters: number;
  totalVerses: number;
  books: BookMetadata[];
}

let cache: BibleMetadata | null = null;
let loading: Promise<BibleMetadata> | null = null;

/**
 * 圣经结构数据不变，进程内缓存避免分析接口重复全表扫描。
 */
export async function getBibleMetadata(): Promise<BibleMetadata> {
  if (cache) return cache;
  if (loading) return loading;

  loading = (async () => {
    const [books, verseCountRows, totalChapters, totalVerses] = await Promise.all([
      prisma.bibleBook.findMany({
        select: { id: true, nameCn: true, testament: true },
        orderBy: { bookOrder: 'asc' },
      }),
      prisma.$queryRaw<Array<{ book_id: number; count: bigint }>>`
        SELECT bc.book_id, COUNT(*)::bigint AS count
        FROM bible_verses bv
        INNER JOIN bible_chapters bc ON bv.chapter_id = bc.id
        GROUP BY bc.book_id
      `,
      prisma.bibleChapter.count(),
      prisma.bibleVerse.count(),
    ]);

    const versesByBook = new Map(verseCountRows.map((r) => [r.book_id, Number(r.count)]));
    const metadata: BibleMetadata = {
      totalChapters,
      totalVerses,
      books: books.map((book) => ({
        id: book.id,
        nameCn: book.nameCn,
        testament: book.testament,
        totalVerses: versesByBook.get(book.id) ?? 0,
      })),
    };

    cache = metadata;
    return metadata;
  })();

  return loading;
}

export function warmBibleMetadataCache(): void {
  void getBibleMetadata().catch((error) => {
    console.error('Failed to warm bible metadata cache:', error);
  });
}
