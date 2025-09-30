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
}

interface ReadStatusResponse {
  readVerseIds: string[];
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
  static async getReadStatus(verseIds: string[]): Promise<string[]> {
    const response = await api.post<ApiResponse<ReadStatusResponse>>('/reading/status', {
      verseIds
    });
    return response.data.data!.readVerseIds;
  }
}