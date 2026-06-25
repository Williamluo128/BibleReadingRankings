/**
 * 将 zh_cuv_clean.json 中的占位符 "a" 替换为合并节说明，避免重新导入后再次出现。
 * 运行: node server/scripts/fix-zh-source-data.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NOTE = '（和合本无独立经文，相关内容已并入上一节）';

const paths = [
  join(__dirname, '../data/zh_cuv_clean.json'),
  join(__dirname, '../data/bible-sources/zh_cuv.json'),
  join(__dirname, '../data/bible-sources/data/zh_cuv_clean.json'),
];

let totalFixed = 0;

for (const filePath of paths) {
  let raw;
  try {
    raw = readFileSync(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      console.log(`跳过（文件不存在）: ${filePath}`);
      continue;
    }
    console.error(`无法读取: ${filePath}`, error);
    continue;
  }

  const text = raw.toString('utf-8').replace(/^\uFEFF/, '');
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    console.error(`无法解析 JSON: ${filePath}`, error);
    continue;
  }

  let fixed = 0;
  for (const book of data) {
    for (const chapter of book.chapters) {
      for (let i = 0; i < chapter.length; i++) {
        if (chapter[i]?.trim().toLowerCase() === 'a') {
          chapter[i] = NOTE;
          fixed += 1;
        }
      }
    }
  }

  writeFileSync(filePath, JSON.stringify(data), 'utf-8');
  totalFixed += fixed;
  console.log(`${filePath}: 修复 ${fixed} 处`);
}

console.log(`合计修复 ${totalFixed} 处占位符`);
