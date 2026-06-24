import { prisma } from '@/config/database';
import type { ReadingRecord, DailyStats } from '@bible-rankings/shared';
import { getBibleMetadata, type BibleMetadata } from '@/services/bible-metadata.cache';

interface DailyStatPoint {
  date: string;
  versesRead: number;
}

interface UserReadingAggregates {
  readVerses: number;
  readChapters: number;
  byBook: Map<number, number>;
}

export class ReadingService {
  // 记录用户阅读的经文
  static async recordVerseRead(userId: string, verseId: string): Promise<ReadingRecord> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // 使用 upsert 避免重复记录同一节经文
    const record = await prisma.readingRecord.upsert({
      where: {
        userId_verseId: {
          userId,
          verseId,
        },
      },
      update: {
        readAt: now, // 更新最后阅读时间
      },
      create: {
        userId,
        verseId,
        date: dateStr,
        readAt: now,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          }
        },
        verse: {
          include: {
            chapter: {
              include: {
                book: true,
              },
            },
          },
        },
      },
    });

    // 更新每日统计
    await this.updateDailyStats(userId, dateStr);

    return {
      id: record.id,
      userId: record.userId,
      verseId: record.verseId,
      readAt: record.readAt,
      date: record.date,
    };
  }

  // 批量记录多节经文阅读
  static async recordMultipleVerses(userId: string, verseIds: string[]): Promise<{ count: number; date: string }> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    let recordCount = 0;

    // 批量处理每节经文
    for (const verseId of verseIds) {
      try {
        await prisma.readingRecord.upsert({
          where: {
            userId_verseId: {
              userId,
              verseId,
            },
          },
          update: {
            readAt: now,
          },
          create: {
            userId,
            verseId,
            date: dateStr,
            readAt: now,
          },
        });
        recordCount++;
      } catch (error) {
        console.error(`Failed to record verse ${verseId}:`, error);
      }
    }

    // 更新每日统计
    await this.updateDailyStats(userId, dateStr);

    return { count: recordCount, date: dateStr };
  }

  // 更新用户每日统计
  static async updateDailyStats(userId: string, date: string): Promise<DailyStats> {
    // 计算该日期用户阅读的经文总数
    const versesRead = await prisma.readingRecord.count({
      where: {
        userId,
        date,
      },
    });

    // 更新每日统计
    const dailyStats = await prisma.dailyStats.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        versesRead,
      },
      create: {
        userId,
        date,
        versesRead,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          }
        },
      },
    });

    return {
      id: dailyStats.id,
      userId: dailyStats.userId,
      date: dailyStats.date,
      versesRead: dailyStats.versesRead,
    };
  }

  // 获取用户某日的阅读记录
  static async getUserReadingRecords(userId: string, date?: string): Promise<ReadingRecord[]> {
    const whereClause: any = { userId };
    if (date) {
      whereClause.date = date;
    }

    const records = await prisma.readingRecord.findMany({
      where: whereClause,
      include: {
        verse: {
          include: {
            chapter: {
              include: {
                book: true,
              },
            },
          },
        },
      },
      orderBy: {
        readAt: 'desc',
      },
    });

    return records.map(record => ({
      id: record.id,
      userId: record.userId,
      verseId: record.verseId,
      readAt: record.readAt,
      date: record.date,
    }));
  }

  // 获取用户每日统计
  static async getUserDailyStats(userId: string, days: number = 30): Promise<DailyStats[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const stats = await prisma.dailyStats.findMany({
      where: {
        userId,
        date: {
          gte: startDate.toISOString().split('T')[0],
          lte: endDate.toISOString().split('T')[0],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          }
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return stats.map(stat => ({
      id: stat.id,
      userId: stat.userId,
      date: stat.date,
      versesRead: stat.versesRead,
    }));
  }

  // 获取用户总阅读统计
  static async getUserTotalStats(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    const [totalVerses, totalDays, todayStats, recentActiveDays] = await Promise.all([
      prisma.readingRecord.count({ where: { userId } }),
      prisma.dailyStats.count({
        where: { userId, versesRead: { gt: 0 } },
      }),
      prisma.dailyStats.findUnique({
        where: { userId_date: { userId, date: today } },
      }),
      prisma.dailyStats.findMany({
        where: { userId, versesRead: { gt: 0 } },
        select: { date: true },
        orderBy: { date: 'desc' },
        take: 400,
      }),
    ]);

    const currentStreak = this.computeCurrentStreak(recentActiveDays.map((d) => d.date));

    return {
      totalVerses,
      totalDays,
      todayVerses: todayStats?.versesRead || 0,
      currentStreak,
    };
  }

  // 检查用户是否已读某节经文
  static async isVerseRead(userId: string, verseId: string): Promise<boolean> {
    const record = await prisma.readingRecord.findUnique({
      where: {
        userId_verseId: {
          userId,
          verseId,
        },
      },
    });

    return !!record;
  }

  // 获取用户已读经文列表（用于前端状态同步）
  static async getUserReadVerses(
    userId: string,
    verseIds: string[],
    bookId?: number,
  ): Promise<string[]> {
    const resetAt = bookId != null ? await this.getBookResetAt(userId, bookId) : null;

    const records = await prisma.readingRecord.findMany({
      where: {
        userId,
        verseId: { in: verseIds },
        ...(resetAt ? { readAt: { gt: resetAt } } : {}),
      },
      select: { verseId: true },
    });

    return records.map((record) => record.verseId);
  }

  private static async getBookResetAt(userId: string, bookId: number): Promise<Date | null> {
    const reset = await prisma.bookReadingReset.findUnique({
      where: { userId_bookId: { userId, bookId } },
      select: { resetAt: true },
    });
    return reset?.resetAt ?? null;
  }

  // 获取阅读趋势数据（用于折线图）
  static async getReadingTrends(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // 生成日期范围
    const dateRange: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateRange.push(new Date(d).toISOString().split('T')[0]);
    }

    // 获取每日统计
    const stats = await prisma.dailyStats.findMany({
      where: {
        userId,
        date: {
          gte: startDate.toISOString().split('T')[0],
          lte: endDate.toISOString().split('T')[0],
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 创建日期到阅读量的映射
    const statsMap = new Map(stats.map(s => [s.date, s.versesRead]));

    // 填充所有日期（包括没有阅读的日期）
    return dateRange.map(date => ({
      date,
      versesRead: statsMap.get(date) || 0,
    }));
  }

  // 获取阅读热力图数据（类似 GitHub contribution graph）
  static async getReadingHeatmap(userId: string, year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const stats = await prisma.dailyStats.findMany({
      where: {
        userId,
        date: {
          gte: startDate.toISOString().split('T')[0],
          lte: endDate.toISOString().split('T')[0],
        },
      },
    });

    // 转换为热力图格式
    return stats.map(stat => ({
      date: stat.date,
      count: stat.versesRead,
      level: this.getHeatmapLevel(stat.versesRead),
    }));
  }

  // 计算热力图等级（0-4）
  private static getHeatmapLevel(versesRead: number): number {
    if (versesRead === 0) return 0;
    if (versesRead < 10) return 1;
    if (versesRead < 25) return 2;
    if (versesRead < 50) return 3;
    return 4;
  }

  // 获取某书卷各章节的阅读进度（未读 / 阅读中 / 已完成）
  static async getBookChapterProgress(userId: string, bookId: number) {
    const rows = await prisma.$queryRaw<
      Array<{ chapter_number: number; verse_count: number; read_count: bigint }>
    >`
      SELECT
        bc.chapter_number,
        bc.verse_count,
        COUNT(DISTINCT rr.verse_id)::bigint AS read_count
      FROM bible_chapters bc
      LEFT JOIN bible_verses bv ON bv.chapter_id = bc.id
      LEFT JOIN book_reading_resets brr
        ON brr.user_id = ${userId} AND brr.book_id = ${bookId}
      LEFT JOIN reading_records rr
        ON rr.verse_id = bv.id
        AND rr.user_id = ${userId}
        AND (brr.reset_at IS NULL OR rr.read_at > brr.reset_at)
      WHERE bc.book_id = ${bookId}
      GROUP BY bc.id, bc.chapter_number, bc.verse_count
      ORDER BY bc.chapter_number ASC
    `;

    return rows.map((row) => {
      const readCount = Number(row.read_count);
      const total = row.verse_count;
      let status: 'unread' | 'reading' | 'complete';
      if (readCount === 0) {
        status = 'unread';
      } else if (readCount >= total) {
        status = 'complete';
      } else {
        status = 'reading';
      }

      return {
        chapterNumber: row.chapter_number,
        readCount,
        total,
        status,
      };
    });
  }

  /** 重置书卷章节进度（仅书签展示），保留历史阅读记录与全局统计 */
  static async resetBookProgress(userId: string, bookId: number) {
    const book = await prisma.bibleBook.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new Error('Book not found');
    }

    const progress = await this.getBookChapterProgress(userId, bookId);
    const allComplete =
      progress.length > 0 && progress.every((chapter) => chapter.status === 'complete');
    if (!allComplete) {
      throw new Error('Book not fully completed');
    }

    const reset = await prisma.bookReadingReset.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { userId, bookId, resetAt: new Date() },
      update: { resetAt: new Date() },
    });

    return { bookId, resetAt: reset.resetAt.toISOString() };
  }

  // 获取阅读进度统计
  static async getProgressStats(userId: string) {
    const [metadata, aggregates, dailyStats] = await Promise.all([
      getBibleMetadata(),
      this.getUserReadingAggregates(userId),
      prisma.dailyStats.findMany({
        where: { userId, versesRead: { gt: 0 } },
        select: { date: true, versesRead: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    return this.buildProgressStats(metadata, aggregates, this.computeStreaks(dailyStats));
  }

  /**
   * 分析页轻量数据：避免全表 JOIN，仅返回摘要 + 近 90 天每日统计
   */
  static async getAnalyticsDashboard(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const [metadata, totalVerses, totalDays, todayStats, dailyStats, recentActiveDays] =
      await Promise.all([
        getBibleMetadata(),
        prisma.readingRecord.count({ where: { userId } }),
        prisma.dailyStats.count({ where: { userId, versesRead: { gt: 0 } } }),
        prisma.dailyStats.findUnique({
          where: { userId_date: { userId, date: today } },
        }),
        prisma.dailyStats.findMany({
          where: { userId, date: { gte: cutoffStr } },
          select: { date: true, versesRead: true },
          orderBy: { date: 'asc' },
        }),
        prisma.dailyStats.findMany({
          where: { userId, versesRead: { gt: 0 } },
          select: { date: true },
          orderBy: { date: 'desc' },
          take: 400,
        }),
      ]);

    const currentStreak = this.computeCurrentStreak(recentActiveDays.map((d) => d.date));
    const versesProgress =
      metadata.totalVerses > 0 ? (totalVerses / metadata.totalVerses) * 100 : 0;

    return {
      summary: {
        totalVerses,
        totalDays,
        todayVerses: todayStats?.versesRead ?? 0,
        currentStreak,
        versesProgress,
        totalVersesInBible: metadata.totalVerses,
      },
      dailyStats,
    };
  }

  private static async getUserReadingAggregates(userId: string): Promise<UserReadingAggregates> {
    const [summaryRow, bookRows] = await Promise.all([
      prisma.$queryRaw<[{ read_verses: bigint; read_chapters: bigint }]>`
        SELECT
          COUNT(DISTINCT rr.verse_id)::bigint AS read_verses,
          COUNT(DISTINCT bv.chapter_id)::bigint AS read_chapters
        FROM reading_records rr
        INNER JOIN bible_verses bv ON rr.verse_id = bv.id
        WHERE rr.user_id = ${userId}
      `,
      prisma.$queryRaw<Array<{ book_id: number; count: bigint }>>`
        SELECT bc.book_id, COUNT(*)::bigint AS count
        FROM reading_records rr
        INNER JOIN bible_verses bv ON rr.verse_id = bv.id
        INNER JOIN bible_chapters bc ON bv.chapter_id = bc.id
        WHERE rr.user_id = ${userId}
        GROUP BY bc.book_id
      `,
    ]);

    return {
      readVerses: Number(summaryRow[0]?.read_verses ?? 0),
      readChapters: Number(summaryRow[0]?.read_chapters ?? 0),
      byBook: new Map(bookRows.map((r) => [r.book_id, Number(r.count)])),
    };
  }

  private static buildProgressStats(
    metadata: BibleMetadata,
    aggregates: UserReadingAggregates,
    streaks: { current: number; longest: number },
  ) {
    let oldTestamentVerses = 0;
    let newTestamentVerses = 0;

    const bookProgress = metadata.books.map((book) => {
      const readBookVerses = aggregates.byBook.get(book.id) ?? 0;
      if (book.testament === 'OT' || book.testament === 'OLD') {
        oldTestamentVerses += readBookVerses;
      } else if (book.testament === 'NT' || book.testament === 'NEW') {
        newTestamentVerses += readBookVerses;
      }

      return {
        bookId: book.id,
        bookName: book.nameCn,
        testament: book.testament,
        totalVerses: book.totalVerses,
        readVerses: readBookVerses,
        progress: book.totalVerses > 0 ? (readBookVerses / book.totalVerses) * 100 : 0,
      };
    });

    const { totalChapters, totalVerses } = metadata;
    const { readChapters, readVerses } = aggregates;

    return {
      overall: {
        totalChapters,
        readChapters,
        chaptersProgress: totalChapters > 0 ? (readChapters / totalChapters) * 100 : 0,
        totalVerses,
        readVerses,
        versesProgress: totalVerses > 0 ? (readVerses / totalVerses) * 100 : 0,
      },
      testament: {
        oldTestament: oldTestamentVerses,
        newTestament: newTestamentVerses,
      },
      books: bookProgress,
      streaks,
    };
  }

  private static computeCurrentStreak(activeDates: string[]): number {
    if (activeDates.length === 0) return 0;

    const activeSet = new Set(activeDates);
    const today = new Date().toISOString().split('T')[0];
    let currentStreak = 0;
    const cursor = new Date(`${today}T00:00:00`);

    while (activeSet.has(cursor.toISOString().split('T')[0])) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return currentStreak;
  }

  private static computeStreaks(activeDays: DailyStatPoint[]): { current: number; longest: number } {
    if (activeDays.length === 0) {
      return { current: 0, longest: 0 };
    }

    const dates = activeDays.map((d) => d.date).sort();

    let longestStreak = 1;
    let run = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(`${dates[i - 1]}T00:00:00`);
      const curr = new Date(`${dates[i]}T00:00:00`);
      const dayDiff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        run++;
        longestStreak = Math.max(longestStreak, run);
      } else {
        run = 1;
      }
    }

    const currentStreak = this.computeCurrentStreak(dates);

    return { current: currentStreak, longest: longestStreak };
  }
}