/** 去掉可能重复的 Bearer 前缀,返回纯 JWT */
export function normalizeAccessToken(raw: string): string {
  let token = raw.trim();
  while (/^bearer\s+/i.test(token)) {
    token = token.replace(/^bearer\s+/i, '').trim();
  }
  return token;
}

/** Supabase access_token 为标准三段 JWT */
export function isJwtFormat(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every((part) => part.length > 0);
}
