import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface BibleBook {
  id: number;
  nameCn: string;
  nameCnShort: string;
  nameEn: string;
  abbreviation: string;
  testament: 'OT' | 'NT';
  bookOrder: number;
}

interface BibleVerse {
  verseNumber: number;
  textCn: string;
  textEn: string;
}

interface BibleChapterData {
  bookId: number;
  chapterNumber: number;
  verseCount: number;
  verses: BibleVerse[];
}

async function seedBibleBooks() {
  console.log('📚 Seeding bible books...');
  
  const booksPath = path.join(__dirname, '../../prisma/data/bible-books.json');
  const booksData: BibleBook[] = JSON.parse(fs.readFileSync(booksPath, 'utf8'));
  
  for (const book of booksData) {
    await prisma.bibleBook.upsert({
      where: { id: book.id },
      update: book,
      create: book,
    });
  }
  
  console.log(`✅ Seeded ${booksData.length} bible books`);
}

async function seedSampleChapters() {
  console.log('📖 Seeding sample chapters...');
  
  const chaptersPath = path.join(__dirname, '../../prisma/data/sample-chapters.json');
  const chaptersData: BibleChapterData[] = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
  
  for (const chapterData of chaptersData) {
    // Create chapter
    const chapter = await prisma.bibleChapter.upsert({
      where: {
        bookId_chapterNumber: {
          bookId: chapterData.bookId,
          chapterNumber: chapterData.chapterNumber,
        },
      },
      update: {
        verseCount: chapterData.verseCount,
      },
      create: {
        bookId: chapterData.bookId,
        chapterNumber: chapterData.chapterNumber,
        verseCount: chapterData.verseCount,
      },
    });
    
    // Create verses
    for (const verse of chapterData.verses) {
      await prisma.bibleVerse.upsert({
        where: {
          chapterId_verseNumber: {
            chapterId: chapter.id,
            verseNumber: verse.verseNumber,
          },
        },
        update: {
          textCn: verse.textCn,
          textEn: verse.textEn,
        },
        create: {
          chapterId: chapter.id,
          verseNumber: verse.verseNumber,
          textCn: verse.textCn,
          textEn: verse.textEn,
        },
      });
    }
    
    console.log(`📝 Seeded chapter ${chapterData.bookId}:${chapterData.chapterNumber} with ${chapterData.verses.length} verses`);
  }
  
  console.log('✅ Seeded sample chapters');
}

async function createSampleUser() {
  console.log('👤 Creating sample user...');

  // Supabase Auth 接管登录后,seed 不再创建带密码的用户。
  // 这里创建一个仅供演示读经数据的占位账号(supabaseUid 为本地占位值),
  // 真实用户通过 Google 登录后由 auth 中间件自动写入。
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      supabaseUid: 'demo-local-placeholder-uid',
      username: 'demo_user',
      email: 'demo@example.com',
      displayName: '演示用户',
    },
  });

  console.log(`✅ Created sample user: ${user.displayName} (${user.email})`);
  return user;
}

async function createSampleReadingRecords(userId: string) {
  console.log('📊 Creating sample reading records...');
  
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Get some verses to mark as read
  const verses = await prisma.bibleVerse.findMany({
    take: 10,
    include: { chapter: true },
  });
  
  let recordsCreated = 0;
  
  for (const verse of verses.slice(0, 5)) {
    // Today's records
    await prisma.readingRecord.upsert({
      where: {
        userId_verseId: {
          userId,
          verseId: verse.id,
        },
      },
      update: {},
      create: {
        userId,
        verseId: verse.id,
        date: today.toISOString().split('T')[0],
        readAt: today,
      },
    });
    recordsCreated++;
  }
  
  for (const verse of verses.slice(5, 8)) {
    // Yesterday's records
    await prisma.readingRecord.upsert({
      where: {
        userId_verseId: {
          userId,
          verseId: verse.id,
        },
      },
      update: {},
      create: {
        userId,
        verseId: verse.id,
        date: yesterday.toISOString().split('T')[0],
        readAt: yesterday,
      },
    });
    recordsCreated++;
  }
  
  // Update daily stats
  await updateDailyStats(userId, today.toISOString().split('T')[0]);
  await updateDailyStats(userId, yesterday.toISOString().split('T')[0]);
  
  console.log(`✅ Created ${recordsCreated} sample reading records`);
}

async function updateDailyStats(userId: string, date: string) {
  const versesRead = await prisma.readingRecord.count({
    where: {
      userId,
      date,
    },
  });
  
  await prisma.dailyStats.upsert({
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
  });
}

async function main() {
  try {
    console.log('🌱 Starting database seed...');
    
    await seedBibleBooks();
    await seedSampleChapters();
    const user = await createSampleUser();
    await createSampleReadingRecords(user.id);
    
    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
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