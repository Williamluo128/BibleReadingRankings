/** 和合本与 KJV 节数对齐时，缺失中文译文使用的占位符 */
export const ZH_VERSE_PLACEHOLDER = 'a';

/** 占位节在中文模式下展示的说明文字 */
export const ZH_MERGED_VERSE_NOTE = '（和合本无独立经文，相关内容已并入上一节）';

export function isZhVersePlaceholder(text: string | null | undefined): boolean {
  return text?.trim().toLowerCase() === ZH_VERSE_PLACEHOLDER;
}

export function isZhMergedVerseNote(text: string | null | undefined): boolean {
  return isZhVersePlaceholder(text) || text?.trim() === ZH_MERGED_VERSE_NOTE;
}

export function normalizeZhVerseText(text: string | null | undefined): string {
  if (!text?.trim() || isZhVersePlaceholder(text)) {
    return ZH_MERGED_VERSE_NOTE;
  }
  return text;
}

export function getVerseDisplayText(
  textCn: string,
  textEn: string,
  language: 'cn' | 'en',
): string {
  return language === 'cn' ? normalizeZhVerseText(textCn) : textEn;
}
