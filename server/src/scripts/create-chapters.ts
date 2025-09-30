import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 每个书卷的实际章节数（简化版本）
const BOOK_CHAPTERS = {
  // 旧约
  1: 50,   // 创世记
  2: 40,   // 出埃及记
  3: 27,   // 利未记
  4: 36,   // 民数记
  5: 34,   // 申命记
  6: 24,   // 约书亚记
  7: 21,   // 士师记
  8: 4,    // 路得记
  9: 31,   // 撒母耳记上
  10: 24,  // 撒母耳记下
  11: 22,  // 列王纪上
  12: 25,  // 列王纪下
  13: 29,  // 历代志上
  14: 36,  // 历代志下
  15: 10,  // 以斯拉记
  16: 13,  // 尼希米记
  17: 10,  // 以斯帖记
  18: 42,  // 约伯记
  19: 150, // 诗篇
  20: 31,  // 箴言
  21: 12,  // 传道书
  22: 8,   // 雅歌
  23: 66,  // 以赛亚书
  24: 52,  // 耶利米书
  25: 5,   // 耶利米哀歌
  26: 48,  // 以西结书
  27: 12,  // 但以理书
  28: 14,  // 何西阿书
  29: 3,   // 约珥书
  30: 9,   // 阿摩司书
  31: 1,   // 俄巴底亚书
  32: 4,   // 约拿书
  33: 7,   // 弥迦书
  34: 3,   // 那鸿书
  35: 3,   // 哈巴谷书
  36: 3,   // 西番雅书
  37: 2,   // 哈该书
  38: 14,  // 撒迦利亚书
  39: 4,   // 玛拉基书
  
  // 新约
  40: 28,  // 马太福音
  41: 16,  // 马可福音
  42: 24,  // 路加福音
  43: 21,  // 约翰福音
  44: 28,  // 使徒行传
  45: 16,  // 罗马书
  46: 16,  // 哥林多前书
  47: 13,  // 哥林多后书
  48: 6,   // 加拉太书
  49: 6,   // 以弗所书
  50: 4,   // 腓立比书
  51: 4,   // 歌罗西书
  52: 5,   // 帖撒罗尼迦前书
  53: 3,   // 帖撒罗尼迦后书
  54: 6,   // 提摩太前书
  55: 4,   // 提摩太后书
  56: 3,   // 提多书
  57: 1,   // 腓利门书
  58: 13,  // 希伯来书
  59: 5,   // 雅各书
  60: 5,   // 彼得前书
  61: 3,   // 彼得后书
  62: 5,   // 约翰一书
  63: 1,   // 约翰二书
  64: 1,   // 约翰三书
  65: 1,   // 犹大书
  66: 22   // 启示录
};

async function createChaptersForAllBooks() {
  console.log('🔨 开始为所有书卷创建章节结构...');
  
  for (const [bookIdStr, chapterCount] of Object.entries(BOOK_CHAPTERS)) {
    const bookId = parseInt(bookIdStr);
    
    console.log(`📖 为书卷 ${bookId} 创建 ${chapterCount} 个章节...`);
    
    for (let chapterNumber = 1; chapterNumber <= chapterCount; chapterNumber++) {
      // 检查章节是否已存在
      const existingChapter = await prisma.bibleChapter.findFirst({
        where: {
          bookId,
          chapterNumber
        }
      });
      
      if (!existingChapter) {
        // 创建章节（设置一个默认的经文数量）
        await prisma.bibleChapter.create({
          data: {
            bookId,
            chapterNumber,
            verseCount: 1, // 默认1节，可以后续更新
          }
        });
        
        // 为每个章节创建一个占位符经文
        const chapter = await prisma.bibleChapter.findFirst({
          where: { bookId, chapterNumber }
        });
        
        if (chapter) {
          await prisma.bibleVerse.create({
            data: {
              chapterId: chapter.id,
              verseNumber: 1,
              textCn: `[${bookId}:${chapterNumber}:1] 此章节内容待补充...`,
              textEn: `[${bookId}:${chapterNumber}:1] Chapter content to be added...`
            }
          });
        }
      }
    }
  }
  
  console.log('✅ 所有书卷章节结构创建完成！');
}

async function main() {
  try {
    await createChaptersForAllBooks();
  } catch (error) {
    console.error('❌ 创建章节时出错:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });