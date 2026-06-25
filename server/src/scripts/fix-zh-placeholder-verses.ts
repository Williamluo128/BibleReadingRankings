import { ZH_MERGED_VERSE_NOTE } from '@bible-rankings/shared';
import { prisma } from '@/config/database';

async function fixZhPlaceholderVerses() {
  const placeholders = await prisma.bibleVerse.findMany({
    where: { OR: [{ textCn: 'a' }, { textCn: 'A' }] },
    select: {
      id: true,
      verseNumber: true,
      chapter: { select: { chapterNumber: true, book: { select: { nameCn: true } } } },
    },
  });

  if (placeholders.length === 0) {
    console.log('No placeholder verses found.');
    return;
  }

  let updated = 0;
  for (const verse of placeholders) {
    await prisma.bibleVerse.update({
      where: { id: verse.id },
      data: { textCn: ZH_MERGED_VERSE_NOTE },
    });
    updated += 1;
  }

  console.log(`Updated ${updated} placeholder verses.`);
  console.log('Examples:');
  for (const verse of placeholders.slice(0, 5)) {
    console.log(
      `  ${verse.chapter.book.nameCn} ${verse.chapter.chapterNumber}:${verse.verseNumber}`,
    );
  }
}

if (require.main === module) {
  fixZhPlaceholderVerses()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { fixZhPlaceholderVerses };
