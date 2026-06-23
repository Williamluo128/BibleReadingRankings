import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '@/config/database';

interface BibleBookData {
  abbrev: string;
  chapters: string[][];
  name?: string;
}

interface BookMapping {
  abbrev: string;
  nameEn: string;
  nameCn: string;
  nameCnShort: string;
  testament: 'OT' | 'NT';
  order: number;
}

// 圣经书卷映射（缩写 -> 中英文名称）
const BOOK_MAPPINGS: BookMapping[] = [
  // 旧约
  { abbrev: 'gn', nameEn: 'Genesis', nameCn: '创世记', nameCnShort: '创', testament: 'OT', order: 1 },
  { abbrev: 'ex', nameEn: 'Exodus', nameCn: '出埃及记', nameCnShort: '出', testament: 'OT', order: 2 },
  { abbrev: 'lv', nameEn: 'Leviticus', nameCn: '利未记', nameCnShort: '利', testament: 'OT', order: 3 },
  { abbrev: 'nm', nameEn: 'Numbers', nameCn: '民数记', nameCnShort: '民', testament: 'OT', order: 4 },
  { abbrev: 'dt', nameEn: 'Deuteronomy', nameCn: '申命记', nameCnShort: '申', testament: 'OT', order: 5 },
  { abbrev: 'js', nameEn: 'Joshua', nameCn: '约书亚记', nameCnShort: '书', testament: 'OT', order: 6 },
  { abbrev: 'jud', nameEn: 'Judges', nameCn: '士师记', nameCnShort: '士', testament: 'OT', order: 7 },
  { abbrev: 'rt', nameEn: 'Ruth', nameCn: '路得记', nameCnShort: '得', testament: 'OT', order: 8 },
  { abbrev: '1sm', nameEn: '1 Samuel', nameCn: '撒母耳记上', nameCnShort: '撒上', testament: 'OT', order: 9 },
  { abbrev: '2sm', nameEn: '2 Samuel', nameCn: '撒母耳记下', nameCnShort: '撒下', testament: 'OT', order: 10 },
  { abbrev: '1kgs', nameEn: '1 Kings', nameCn: '列王纪上', nameCnShort: '王上', testament: 'OT', order: 11 },
  { abbrev: '2kgs', nameEn: '2 Kings', nameCn: '列王纪下', nameCnShort: '王下', testament: 'OT', order: 12 },
  { abbrev: '1ch', nameEn: '1 Chronicles', nameCn: '历代志上', nameCnShort: '代上', testament: 'OT', order: 13 },
  { abbrev: '2ch', nameEn: '2 Chronicles', nameCn: '历代志下', nameCnShort: '代下', testament: 'OT', order: 14 },
  { abbrev: 'ezr', nameEn: 'Ezra', nameCn: '以斯拉记', nameCnShort: '拉', testament: 'OT', order: 15 },
  { abbrev: 'ne', nameEn: 'Nehemiah', nameCn: '尼希米记', nameCnShort: '尼', testament: 'OT', order: 16 },
  { abbrev: 'et', nameEn: 'Esther', nameCn: '以斯帖记', nameCnShort: '斯', testament: 'OT', order: 17 },
  { abbrev: 'job', nameEn: 'Job', nameCn: '约伯记', nameCnShort: '伯', testament: 'OT', order: 18 },
  { abbrev: 'ps', nameEn: 'Psalms', nameCn: '诗篇', nameCnShort: '诗', testament: 'OT', order: 19 },
  { abbrev: 'prv', nameEn: 'Proverbs', nameCn: '箴言', nameCnShort: '箴', testament: 'OT', order: 20 },
  { abbrev: 'ec', nameEn: 'Ecclesiastes', nameCn: '传道书', nameCnShort: '传', testament: 'OT', order: 21 },
  { abbrev: 'so', nameEn: 'Song of Songs', nameCn: '雅歌', nameCnShort: '歌', testament: 'OT', order: 22 },
  { abbrev: 'is', nameEn: 'Isaiah', nameCn: '以赛亚书', nameCnShort: '赛', testament: 'OT', order: 23 },
  { abbrev: 'jr', nameEn: 'Jeremiah', nameCn: '耶利米书', nameCnShort: '耶', testament: 'OT', order: 24 },
  { abbrev: 'lm', nameEn: 'Lamentations', nameCn: '耶利米哀歌', nameCnShort: '哀', testament: 'OT', order: 25 },
  { abbrev: 'ez', nameEn: 'Ezekiel', nameCn: '以西结书', nameCnShort: '结', testament: 'OT', order: 26 },
  { abbrev: 'dn', nameEn: 'Daniel', nameCn: '但以理书', nameCnShort: '但', testament: 'OT', order: 27 },
  { abbrev: 'ho', nameEn: 'Hosea', nameCn: '何西阿书', nameCnShort: '何', testament: 'OT', order: 28 },
  { abbrev: 'jl', nameEn: 'Joel', nameCn: '约珥书', nameCnShort: '珥', testament: 'OT', order: 29 },
  { abbrev: 'am', nameEn: 'Amos', nameCn: '阿摩司书', nameCnShort: '摩', testament: 'OT', order: 30 },
  { abbrev: 'ob', nameEn: 'Obadiah', nameCn: '俄巴底亚书', nameCnShort: '俄', testament: 'OT', order: 31 },
  { abbrev: 'jn', nameEn: 'Jonah', nameCn: '约拿书', nameCnShort: '拿', testament: 'OT', order: 32 },
  { abbrev: 'mi', nameEn: 'Micah', nameCn: '弥迦书', nameCnShort: '弥', testament: 'OT', order: 33 },
  { abbrev: 'na', nameEn: 'Nahum', nameCn: '那鸿书', nameCnShort: '鸿', testament: 'OT', order: 34 },
  { abbrev: 'hk', nameEn: 'Habakkuk', nameCn: '哈巴谷书', nameCnShort: '哈', testament: 'OT', order: 35 },
  { abbrev: 'zp', nameEn: 'Zephaniah', nameCn: '西番雅书', nameCnShort: '番', testament: 'OT', order: 36 },
  { abbrev: 'hg', nameEn: 'Haggai', nameCn: '哈该书', nameCnShort: '该', testament: 'OT', order: 37 },
  { abbrev: 'zc', nameEn: 'Zechariah', nameCn: '撒迦利亚书', nameCnShort: '亚', testament: 'OT', order: 38 },
  { abbrev: 'ml', nameEn: 'Malachi', nameCn: '玛拉基书', nameCnShort: '玛', testament: 'OT', order: 39 },
  
  // 新约
  { abbrev: 'mt', nameEn: 'Matthew', nameCn: '马太福音', nameCnShort: '太', testament: 'NT', order: 40 },
  { abbrev: 'mk', nameEn: 'Mark', nameCn: '马可福音', nameCnShort: '可', testament: 'NT', order: 41 },
  { abbrev: 'lk', nameEn: 'Luke', nameCn: '路加福音', nameCnShort: '路', testament: 'NT', order: 42 },
  { abbrev: 'jo', nameEn: 'John', nameCn: '约翰福音', nameCnShort: '约', testament: 'NT', order: 43 },
  { abbrev: 'act', nameEn: 'Acts', nameCn: '使徒行传', nameCnShort: '徒', testament: 'NT', order: 44 },
  { abbrev: 'rm', nameEn: 'Romans', nameCn: '罗马书', nameCnShort: '罗', testament: 'NT', order: 45 },
  { abbrev: '1co', nameEn: '1 Corinthians', nameCn: '哥林多前书', nameCnShort: '林前', testament: 'NT', order: 46 },
  { abbrev: '2co', nameEn: '2 Corinthians', nameCn: '哥林多后书', nameCnShort: '林后', testament: 'NT', order: 47 },
  { abbrev: 'gl', nameEn: 'Galatians', nameCn: '加拉太书', nameCnShort: '加', testament: 'NT', order: 48 },
  { abbrev: 'eph', nameEn: 'Ephesians', nameCn: '以弗所书', nameCnShort: '弗', testament: 'NT', order: 49 },
  { abbrev: 'ph', nameEn: 'Philippians', nameCn: '腓立比书', nameCnShort: '腓', testament: 'NT', order: 50 },
  { abbrev: 'cl', nameEn: 'Colossians', nameCn: '歌罗西书', nameCnShort: '西', testament: 'NT', order: 51 },
  { abbrev: '1ts', nameEn: '1 Thessalonians', nameCn: '帖撒罗尼迦前书', nameCnShort: '帖前', testament: 'NT', order: 52 },
  { abbrev: '2ts', nameEn: '2 Thessalonians', nameCn: '帖撒罗尼迦后书', nameCnShort: '帖后', testament: 'NT', order: 53 },
  { abbrev: '1tm', nameEn: '1 Timothy', nameCn: '提摩太前书', nameCnShort: '提前', testament: 'NT', order: 54 },
  { abbrev: '2tm', nameEn: '2 Timothy', nameCn: '提摩太后书', nameCnShort: '提后', testament: 'NT', order: 55 },
  { abbrev: 'tt', nameEn: 'Titus', nameCn: '提多书', nameCnShort: '多', testament: 'NT', order: 56 },
  { abbrev: 'phm', nameEn: 'Philemon', nameCn: '腓利门书', nameCnShort: '门', testament: 'NT', order: 57 },
  { abbrev: 'hb', nameEn: 'Hebrews', nameCn: '希伯来书', nameCnShort: '来', testament: 'NT', order: 58 },
  { abbrev: 'jm', nameEn: 'James', nameCn: '雅各书', nameCnShort: '雅', testament: 'NT', order: 59 },
  { abbrev: '1pe', nameEn: '1 Peter', nameCn: '彼得前书', nameCnShort: '彼前', testament: 'NT', order: 60 },
  { abbrev: '2pe', nameEn: '2 Peter', nameCn: '彼得后书', nameCnShort: '彼后', testament: 'NT', order: 61 },
  { abbrev: '1jo', nameEn: '1 John', nameCn: '约翰一书', nameCnShort: '约一', testament: 'NT', order: 62 },
  { abbrev: '2jo', nameEn: '2 John', nameCn: '约翰二书', nameCnShort: '约二', testament: 'NT', order: 63 },
  { abbrev: '3jo', nameEn: '3 John', nameCn: '约翰三书', nameCnShort: '约三', testament: 'NT', order: 64 },
  { abbrev: 'jd', nameEn: 'Jude', nameCn: '犹大书', nameCnShort: '犹', testament: 'NT', order: 65 },
  { abbrev: 're', nameEn: 'Revelation', nameCn: '启示录', nameCnShort: '启', testament: 'NT', order: 66 },
];

export class BibleImporter {
  private zhData: BibleBookData[] = [];
  private enData: BibleBookData[] = [];

  async loadBibleData() {
    const zhPath = path.join(__dirname, '../../data/zh_cuv_clean.json');
    const enPath = path.join(__dirname, '../../data/en_kjv_clean.json');

    console.log('Loading Chinese Bible data...');
    this.zhData = JSON.parse(fs.readFileSync(zhPath, 'utf-8'));
    
    console.log('Loading English Bible data...');
    this.enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    
    console.log(`Loaded ${this.zhData.length} Chinese books and ${this.enData.length} English books`);
  }

  async clearExistingData() {
    console.log('Clearing existing Bible data...');
    
    await prisma.readingRecord.deleteMany({});
    await prisma.dailyStats.deleteMany({});
    await prisma.bibleVerse.deleteMany({});
    await prisma.bibleChapter.deleteMany({});
    await prisma.bibleBook.deleteMany({});
    
    console.log('Existing data cleared.');
  }

  async importBooks() {
    console.log('Importing books...');
    
    for (const mapping of BOOK_MAPPINGS) {
      const zhBook = this.zhData.find(book => book.abbrev === mapping.abbrev);
      const enBook = this.enData.find(book => book.abbrev === mapping.abbrev);
      
      if (!zhBook || !enBook) {
        console.log(`Warning: Missing data for ${mapping.abbrev} (${mapping.nameEn})`);
        continue;
      }

      // 创建书卷
      const book = await prisma.bibleBook.create({
        data: {
          id: mapping.order, // 使用order作为ID
          abbreviation: mapping.abbrev,
          nameEn: mapping.nameEn,
          nameCn: mapping.nameCn,
          nameCnShort: mapping.nameCnShort,
          testament: mapping.testament,
          bookOrder: mapping.order,
        },
      });

      console.log(`Created book: ${mapping.nameEn} (${mapping.nameCn})`);

      // 导入章节和经文
      await this.importChapters(book.id, zhBook.chapters, enBook.chapters);
    }
  }

  async importChapters(bookId: number, zhChapters: string[][], enChapters: string[][]) {
    const maxChapters = Math.min(zhChapters.length, enChapters.length);
    
    for (let chapterIndex = 0; chapterIndex < maxChapters; chapterIndex++) {
      const zhVerses = zhChapters[chapterIndex];
      const enVerses = enChapters[chapterIndex];
      
      // 创建章节
      const chapter = await prisma.bibleChapter.create({
        data: {
          bookId,
          chapterNumber: chapterIndex + 1,
          verseCount: Math.min(zhVerses.length, enVerses.length),
        },
      });

      // 导入经文
      await this.importVerses(chapter.id, zhVerses, enVerses);
    }
  }

  async importVerses(chapterId: string, zhVerses: string[], enVerses: string[]) {
    const maxVerses = Math.min(zhVerses.length, enVerses.length);
    const data: { chapterId: string; verseNumber: number; textCn: string; textEn: string }[] = [];

    for (let verseIndex = 0; verseIndex < maxVerses; verseIndex++) {
      const zhText = zhVerses[verseIndex]?.trim();
      const enText = enVerses[verseIndex]?.trim();

      if (!zhText || !enText) continue;

      data.push({
        chapterId,
        verseNumber: verseIndex + 1,
        textCn: zhText,
        textEn: enText,
      });
    }

    if (data.length > 0) {
      await prisma.bibleVerse.createMany({ data });
    }
  }

  async import() {
    try {
      console.log('Starting Bible data import...');
      
      await this.loadBibleData();
      await this.clearExistingData();
      await this.importBooks();
      
      // 统计导入结果
      const bookCount = await prisma.bibleBook.count();
      const chapterCount = await prisma.bibleChapter.count();
      const verseCount = await prisma.bibleVerse.count();
      
      console.log('\n=== Import Summary ===');
      console.log(`Books imported: ${bookCount}`);
      console.log(`Chapters imported: ${chapterCount}`);
      console.log(`Verses imported: ${verseCount}`);
      console.log('Bible data import completed successfully!');
      
    } catch (error) {
      console.error('Error importing Bible data:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
}

// 运行导入脚本
if (require.main === module) {
  const importer = new BibleImporter();
  importer.import().catch(console.error);
}