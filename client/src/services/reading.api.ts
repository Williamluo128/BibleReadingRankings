import { api } from './api';
import type {
  ApiResponse,
  ReadingRecord,
  DailyStats
} from '@bible-rankings/shared';

interface RecordVerseResponse {
  record: ReadingRecord;
}

interface RecordMultipleVersesResponse {
  count: number;
  date: string;
}

interface ReadingRecordsResponse {
  records: ReadingRecord[];
}

interface DailyStatsResponse {
  stats: DailyStats[];
}

interface TotalStatsResponse {
  totalVerses: number;
  totalDays: number;
  todayVerses: number;
  currentStreak: number;
}

interface ReadStatusResponse {
  readVerseIds: string[];
}

interface ReadingTrendData {
  date: string;
  versesRead: number;
}

interface ReadingTrendsResponse {
  trends: ReadingTrendData[];
}

interface HeatmapData {
  date: string;
  count: number;
  level: number;
}

interface ReadingHeatmapResponse {
  heatmap: HeatmapData[];
}

interface ProgressStatsResponse {
  overall: {
    totalChapters: number;
    readChapters: number;
    chaptersProgress: number;
    totalVerses: number;
    readVerses: number;
    versesProgress: number;
  };
  testament: {
    oldTestament: number;
    newTestament: number;
  };
  books: Array<{
    bookId: number;
    bookName: string;
    testament: string;
    totalVerses: number;
    readVerses: number;
    progress: number;
  }>;
  streaks: {
    current: number;
    longest: number;
  };
}

interface AnalyticsSummary {
  totalVerses: number;
  totalDays: number;
  todayVerses: number;
  currentStreak: number;
  versesProgress: number;
  totalVersesInBible: number;
}

interface AnalyticsDashboardResponse {
  summary: AnalyticsSummary;
  dailyStats: Array<{ date: string; versesRead: number }>;
}

export type ChapterReadStatus = 'unread' | 'reading' | 'complete';

interface ChapterProgressItem {
  chapterNumber: number;
  readCount: number;
  total: number;
  status: ChapterReadStatus;
}

interface BookChapterProgressResponse {
  chapters: ChapterProgressItem[];
}

export class ReadingAPI {
  // 记录单个经文阅读
  static async recordVerse(verseId: string): Promise<ReadingRecord> {
    const response = await api.post<ApiResponse<RecordVerseResponse>>('/reading/verse', {
      verseId
    });
    return response.data.data!.record;
  }

  // 批量记录多个经文阅读
  static async recordMultipleVerses(verseIds: string[]): Promise<RecordMultipleVersesResponse> {
    const response = await api.post<ApiResponse<RecordMultipleVersesResponse>>('/reading/verses', {
      verseIds
    });
    return response.data.data!;
  }

  // 获取用户阅读记录
  static async getReadingRecords(date?: string): Promise<ReadingRecord[]> {
    const params = date ? { date } : {};
    const response = await api.get<ApiResponse<ReadingRecordsResponse>>('/reading/records', {
      params
    });
    return response.data.data!.records;
  }

  // 获取用户每日统计
  static async getDailyStats(days: number = 30): Promise<DailyStats[]> {
    const response = await api.get<ApiResponse<DailyStatsResponse>>('/reading/stats/daily', {
      params: { days }
    });
    return response.data.data!.stats;
  }

  // 获取用户总体统计
  static async getTotalStats(): Promise<TotalStatsResponse> {
    const response = await api.get<ApiResponse<TotalStatsResponse>>('/reading/stats/total');
    return response.data.data!;
  }

  // 检查经文阅读状态
  static async getReadStatus(verseIds: string[], bookId?: number): Promise<string[]> {
    const response = await api.post<ApiResponse<ReadStatusResponse>>('/reading/status', {
      verseIds,
      ...(bookId != null ? { bookId } : {}),
    });
    return response.data.data!.readVerseIds;
  }

  // 获取阅读趋势数据
  static async getReadingTrends(days: number = 30): Promise<ReadingTrendData[]> {
    const response = await api.get<ApiResponse<ReadingTrendsResponse>>('/reading/trends', {
      params: { days }
    });
    return response.data.data!.trends;
  }

  // 获取阅读热力图数据
  static async getReadingHeatmap(year?: number): Promise<HeatmapData[]> {
    const params = year ? { year } : {};
    const response = await api.get<ApiResponse<ReadingHeatmapResponse>>('/reading/heatmap', {
      params
    });
    return response.data.data!.heatmap;
  }

  // 分析页统一数据（一次请求，前端本地计算趋势/热力图）
  static async getAnalyticsDashboard(): Promise<AnalyticsDashboardResponse> {
    const response = await api.get<ApiResponse<AnalyticsDashboardResponse>>('/reading/analytics');
    return response.data.data!;
  }

  // 获取阅读进度统计
  static async getProgressStats(): Promise<ProgressStatsResponse> {
    const response = await api.get<ApiResponse<ProgressStatsResponse>>('/reading/progress');
    return response.data.data!;
  }

  // 获取书卷各章节阅读进度
  static async getBookChapterProgress(bookId: number): Promise<ChapterProgressItem[]> {
    const response = await api.get<ApiResponse<BookChapterProgressResponse>>(
      `/reading/books/${bookId}/chapters/progress`,
    );
    return response.data.data!.chapters;
  }

  static async resetBookProgress(bookId: number): Promise<{ bookId: number; resetAt: string }> {
    const response = await api.delete<ApiResponse<{ bookId: number; resetAt: string }>>(
      `/reading/books/${bookId}/progress`,
    );
    return response.data.data!;
  }
}

// 导出类型
export type {
  ReadingTrendData,
  HeatmapData,
  ProgressStatsResponse,
  TotalStatsResponse,
  AnalyticsDashboardResponse,
  AnalyticsSummary,
  ChapterReadStatus,
  ChapterProgressItem,
};