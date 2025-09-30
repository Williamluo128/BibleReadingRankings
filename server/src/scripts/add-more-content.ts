import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 添加一些重要书卷的更多章节内容
async function addMoreBibleContent() {
  console.log('📖 开始添加更多圣经内容...');

  // 创世记第3章 - 人的堕落
  await addChapterContent(1, 3, [
    { verse: 1, cn: "耶和华神所造的，惟有蛇比田野一切的活物更狡猾。蛇对女人说：神岂是真说不许你们吃园中所有树上的果子吗？", en: "Now the serpent was more cunning than any beast of the field which the Lord God had made. And he said to the woman, \"Has God indeed said, 'You shall not eat of every tree of the garden'?\"" },
    { verse: 2, cn: "女人对蛇说：园中树上的果子，我们可以吃，", en: "And the woman said to the serpent, \"We may eat the fruit of the trees of the garden;" },
    { verse: 3, cn: "惟有园当中那棵树上的果子，神曾说：你们不可吃，也不可摸，免得你们死。", en: "but of the fruit of the tree which is in the midst of the garden, God has said, 'You shall not eat it, nor shall you touch it, lest you die.'\"" },
    { verse: 4, cn: "蛇对女人说：你们不一定死；", en: "Then the serpent said to the woman, \"You will not surely die." },
    { verse: 5, cn: "因为神知道，你们吃的日子眼睛就明亮了，你们便如神能知道善恶。", en: "For God knows that when you eat of it your eyes will be opened, and you will be like God, knowing good and evil.\"" }
  ]);

  // 马太福音第5章 - 登山宝训
  await addChapterContent(40, 5, [
    { verse: 1, cn: "耶稣看见这许多的人，就上了山，既已坐下，门徒到他跟前来，", en: "And seeing the multitudes, He went up on a mountain, and when He was seated His disciples came to Him." },
    { verse: 2, cn: "他就开口教训他们，说：", en: "Then He opened His mouth and taught them, saying:" },
    { verse: 3, cn: "虚心的人有福了！因为天国是他们的。", en: "\"Blessed are the poor in spirit, For theirs is the kingdom of heaven." },
    { verse: 4, cn: "哀恸的人有福了！因为他们必得安慰。", en: "Blessed are those who mourn, For they shall be comforted." },
    { verse: 5, cn: "温柔的人有福了！因为他们必承受地土。", en: "Blessed are the meek, For they shall inherit the earth." },
    { verse: 6, cn: "饥渴慕义的人有福了！因为他们必得饱足。", en: "Blessed are those who hunger and thirst for righteousness, For they shall be filled." },
    { verse: 7, cn: "怜恤人的人有福了！因为他们必蒙怜恤。", en: "Blessed are the merciful, For they shall obtain mercy." },
    { verse: 8, cn: "清心的人有福了！因为他们必得见神。", en: "Blessed are the pure in heart, For they shall see God." }
  ]);

  // 约翰福音第3章 - 重生的道理
  await addChapterContent(43, 3, [
    { verse: 1, cn: "有一个法利赛人，名叫尼哥底母，是犹太人的官。", en: "There was a man of the Pharisees named Nicodemus, a ruler of the Jews." },
    { verse: 2, cn: "这人夜里来见耶稣，说：拉比，我们知道你是由神那里来作师傅的；因为你所行的神迹，若没有神同在，无人能行。", en: "This man came to Jesus by night and said to Him, \"Rabbi, we know that You are a teacher come from God; for no one can do these signs that You do unless God is with him.\"" },
    { verse: 3, cn: "耶稣回答说：我实实在在的告诉你，人若不重生，就不能见神的国。", en: "Jesus answered and said to him, \"Most assuredly, I say to you, unless one is born again, he cannot see the kingdom of God.\"" },
    { verse: 16, cn: "神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不致灭亡，反得永生。", en: "For God so loved the world that He gave His only begotten Son, that whoever believes in Him should not perish but have everlasting life." }
  ]);

  // 罗马书第8章 - 圣灵的生活
  await addChapterContent(45, 8, [
    { verse: 1, cn: "如今，那些在基督耶稣里的就不定罪了。", en: "There is therefore now no condemnation to those who are in Christ Jesus, who do not walk according to the flesh, but according to the Spirit." },
    { verse: 28, cn: "我们晓得万事都互相效力，叫爱神的人得益处，就是按他旨意被召的人。", en: "And we know that all things work together for good to those who love God, to those who are the called according to His purpose." },
    { verse: 38, cn: "因为我深信无论是死，是生，是天使，是掌权的，是有能的，是现在的事，是将来的事，", en: "For I am persuaded that neither death nor life, nor angels nor principalities nor powers, nor things present nor things to come," },
    { verse: 39, cn: "是高处的，是低处的，是别的受造之物，都不能叫我们与神的爱隔绝；这爱是在我们的主基督耶稣里的。", en: "nor height nor depth, nor any other created thing, shall be able to separate us from the love of God which is in Christ Jesus our Lord." }
  ]);

  console.log('✅ 更多圣经内容添加完成！');
}

async function addChapterContent(bookId: number, chapterNumber: number, verses: {verse: number, cn: string, en: string}[]) {
  // 找到章节
  const chapter = await prisma.bibleChapter.findFirst({
    where: { bookId, chapterNumber }
  });

  if (!chapter) {
    console.log(`❌ 未找到书卷 ${bookId} 第 ${chapterNumber} 章`);
    return;
  }

  // 删除现有的占位符经文
  await prisma.bibleVerse.deleteMany({
    where: { chapterId: chapter.id }
  });

  // 添加新的经文内容
  for (const verse of verses) {
    await prisma.bibleVerse.create({
      data: {
        chapterId: chapter.id,
        verseNumber: verse.verse,
        textCn: verse.cn,
        textEn: verse.en
      }
    });
  }

  // 更新章节的经文数量
  await prisma.bibleChapter.update({
    where: { id: chapter.id },
    data: { verseCount: verses.length }
  });

  console.log(`📝 已添加书卷 ${bookId} 第 ${chapterNumber} 章，共 ${verses.length} 节`);
}

async function main() {
  try {
    await addMoreBibleContent();
  } catch (error) {
    console.error('❌ 添加内容时出错:', error);
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