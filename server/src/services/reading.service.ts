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

    return {
      totalVerses,
      totalDays,
      todayVerses: todayStats?.versesRead || 0,
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
}