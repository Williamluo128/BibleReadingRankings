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
    // 并行获取基础数据
    const [books, totalChapters, totalVerses, readRecords] = await Promise.all([
      // 获取所有书卷信息
      prisma.bibleBook.findMany({
        select: {
          id: true,
          nameCn: true,
          testament: true,
        },
      }),
      // 获取总章节数
      prisma.bibleChapter.count(),
      // 获取总经文数
      prisma.bibleVerse.count(),
      // 获取用户已读的经文（只需要基本信息）
      prisma.readingRecord.findMany({
        where: { userId },
        select: {
          verse: {
            select: {
              chapterId: true,
              chapter: {
                select: {
                  bookId: true,
                  book: {
                    select: {
                      testament: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // 统计已读章节
    const readChapters = new Set(readRecords.map(r => r.verse.chapterId));
    const readVersesCount = readRecords.length;

    // 统计旧约/新约阅读情况
    const oldTestamentVerses = readRecords.filter(
      r => r.verse.chapter.book.testament === 'OLD'
    ).length;
    const newTestamentVerses = readRecords.filter(
      r => r.verse.chapter.book.testament === 'NEW'
    ).length;

    // 一次性获取所有书卷的经文数量
    const bookVerseCounts = await prisma.bibleVerse.groupBy({
      by: ['chapterId'],
      _count: {
        id: true,
      },
      where: {
        chapter: {
          bookId: {
            in: books.map(b => b.id),
          },
        },
      },
    });

    // 获取每个书卷的章节信息
    const chapters = await prisma.bibleChapter.findMany({
      where: {
        bookId: {
          in: books.map(b => b.id),
        },
      },
      select: {
        id: true,
        bookId: true,
      },
    });

    // 创建书卷ID到章节ID的映射
    const bookToChapters = new Map<number, string[]>();
    chapters.forEach(chapter => {
      if (!bookToChapters.has(chapter.bookId)) {
        bookToChapters.set(chapter.bookId, []);
      }
      bookToChapters.get(chapter.bookId)!.push(chapter.id);
    });

    // 创建章节ID到经文数量的映射
    const chapterVerseCount = new Map<string, number>();
    bookVerseCounts.forEach(item => {
      chapterVerseCount.set(item.chapterId, item._count.id);
    });

    // 统计每卷书的阅读进度
    const bookProgress = books.map(book => {
      const chapterIds = bookToChapters.get(book.id) || [];

      // 计算该书卷的总经文数
      const totalBookVerses = chapterIds.reduce((sum, chapterId) => {
        return sum + (chapterVerseCount.get(chapterId) || 0);
      }, 0);

      // 计算该书卷已读的经文数
      const readBookVerses = readRecords.filter(
        r => r.verse.chapter.bookId === book.id
      ).length;

      return {
        bookId: book.id,
        bookName: book.nameCn,
        testament: book.testament,
        totalVerses: totalBookVerses,
        readVerses: readBookVerses,
        progress: totalBookVerses > 0 ? (readBookVerses / totalBookVerses) * 100 : 0,
      };
    });

    // 计算连续阅读天数
    const [currentStreak, longestStreak] = await Promise.all([
      this.calculateCurrentStreak(userId),
      this.calculateLongestStreak(userId),
    ]);

    return {
      overall: {
        totalChapters,
        readChapters: readChapters.size,
        chaptersProgress: (readChapters.size / totalChapters) * 100,
        totalVerses,
        readVerses: readVersesCount,
        versesProgress: (readVersesCount / totalVerses) * 100,
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