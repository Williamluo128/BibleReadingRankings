import { prisma } from '@/config/database';
import type { ReadingRecord, DailyStats } from '@bible-rankings/shared';

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
    const totalVerses = await prisma.readingRecord.count({
      where: { userId },
    });

    const totalDays = await prisma.dailyStats.count({
      where: {
        userId,
        versesRead: { gt: 0 } // 只计算有阅读记录的日子
      },
    });

    const today = new Date().toISOString().split('T')[0];
    const todayStats = await prisma.dailyStats.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    // 计算当前连续阅读天数
    const currentStreak = await this.calculateCurrentStreak(userId);

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
  static async getUserReadVerses(userId: string, verseIds: string[]): Promise<string[]> {
    const records = await prisma.readingRecord.findMany({
      where: {
        userId,
        verseId: { in: verseIds },
      },
      select: {
        verseId: true,
      },
    });

    return records.map(record => record.verseId);
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

  // 获取阅读进度统计
  static async getProgressStats(userId: string) {
    const [books, totalChapters, totalVerses, readVersesCount, readChaptersRow, testamentRows, bookReadRows, chapterVerseGroups, chapters] = await Promise.all([
      prisma.bibleBook.findMany({
        select: { id: true, nameCn: true, testament: true },
        orderBy: { bookOrder: 'asc' },
      }),
      prisma.bibleChapter.count(),
      prisma.bibleVerse.count(),
      prisma.readingRecord.count({ where: { userId } }),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT bc.id) AS count
        FROM reading_records rr
        INNER JOIN bible_verses bv ON rr.verse_id = bv.id
        INNER JOIN bible_chapters bc ON bv.chapter_id = bc.id
        WHERE rr.user_id = ${userId}
      `,
      prisma.$queryRaw<Array<{ testament: string; count: bigint }>>`
        SELECT bb.testament, COUNT(*)::bigint AS count
        FROM reading_records rr
        INNER JOIN bible_verses bv ON rr.verse_id = bv.id
        INNER JOIN bible_chapters bc ON bv.chapter_id = bc.id
        INNER JOIN bible_books bb ON bc.book_id = bb.id
        WHERE rr.user_id = ${userId}
        GROUP BY bb.testament
      `,
      prisma.$queryRaw<Array<{ book_id: number; count: bigint }>>`
        SELECT bc.book_id, COUNT(*)::bigint AS count
        FROM reading_records rr
        INNER JOIN bible_verses bv ON rr.verse_id = bv.id
        INNER JOIN bible_chapters bc ON bv.chapter_id = bc.id
        WHERE rr.user_id = ${userId}
        GROUP BY bc.book_id
      `,
      prisma.bibleVerse.groupBy({
        by: ['chapterId'],
        _count: { id: true },
      }),
      prisma.bibleChapter.findMany({
        select: { id: true, bookId: true },
      }),
    ]);

    const readChapters = Number(readChaptersRow[0]?.count ?? 0);
    const readByBook = new Map(bookReadRows.map((r) => [r.book_id, Number(r.count)]));

    let oldTestamentVerses = 0;
    let newTestamentVerses = 0;
    for (const row of testamentRows) {
      if (row.testament === 'OT' || row.testament === 'OLD') {
        oldTestamentVerses += Number(row.count);
      } else if (row.testament === 'NT' || row.testament === 'NEW') {
        newTestamentVerses += Number(row.count);
      }
    }

    const chapterVerseCount = new Map(chapterVerseGroups.map((item) => [item.chapterId, item._count.id]));
    const bookToChapters = new Map<number, string[]>();
    chapters.forEach((chapter) => {
      const list = bookToChapters.get(chapter.bookId) ?? [];
      list.push(chapter.id);
      bookToChapters.set(chapter.bookId, list);
    });

    const bookProgress = books.map((book) => {
      const chapterIds = bookToChapters.get(book.id) ?? [];
      const totalBookVerses = chapterIds.reduce(
        (sum, chapterId) => sum + (chapterVerseCount.get(chapterId) ?? 0),
        0,
      );
      const readBookVerses = readByBook.get(book.id) ?? 0;

      return {
        bookId: book.id,
        bookName: book.nameCn,
        testament: book.testament,
        totalVerses: totalBookVerses,
        readVerses: readBookVerses,
        progress: totalBookVerses > 0 ? (readBookVerses / totalBookVerses) * 100 : 0,
      };
    });

    const [currentStreak, longestStreak] = await Promise.all([
      this.calculateCurrentStreak(userId),
      this.calculateLongestStreak(userId),
    ]);

    return {
      overall: {
        totalChapters,
        readChapters,
        chaptersProgress: totalChapters > 0 ? (readChapters / totalChapters) * 100 : 0,
        totalVerses,
        readVerses: readVersesCount,
        versesProgress: totalVerses > 0 ? (readVersesCount / totalVerses) * 100 : 0,
      },
      testament: {
        oldTestament: oldTestamentVerses,
        newTestament: newTestamentVerses,
      },
      books: bookProgress,
      streaks: {
        current: currentStreak,
        longest: longestStreak,
      },
    };
  }

  // 计算当前连续阅读天数
  private static async calculateCurrentStreak(userId: string): Promise<number> {
    const stats = await prisma.dailyStats.findMany({
      where: {
        userId,
        versesRead: { gt: 0 },
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (stats.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (const stat of stats) {
      const statDate = new Date(stat.date);
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - streak);

      if (statDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // 计算最长连续阅读天数
  private static async calculateLongestStreak(userId: string): Promise<number> {
    const stats = await prisma.dailyStats.findMany({
      where: {
        userId,
        versesRead: { gt: 0 },
      },
      orderBy: {
        date: 'asc',
      },
    });

    if (stats.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < stats.length; i++) {
      const prevDate = new Date(stats[i - 1].date);
      const currDate = new Date(stats[i].date);

      const dayDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }
}