const SPAMMY_TLDS = [".top", ".xyz"];
const REF_PAT = /(\?|&)ref=|utm_/i;
const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

export function countLinks(text: string): number {
  const matches = text.match(URL_REGEX);
  return matches ? matches.length : 0;
}
export function hasSpamParams(text: string): boolean {
  return REF_PAT.test(text);
}
export function hasSpammyTld(text: string): boolean {
  const matches = text.match(URL_REGEX) || [];
  return matches.some((u) => {
    try {
      const url = new URL(u);
      const host = url.hostname.toLowerCase();
      return SPAMMY_TLDS.some((t) => host.endsWith(t));
    } catch {
      const low = u.toLowerCase().replace(/[/?#].*$/, "");
      return SPAMMY_TLDS.some((t) => low.endsWith(t));
    }
  });
}
export function isSpammy(text: string): boolean {
  if (countLinks(text) > 1) return true;
  if (hasSpamParams(text)) return true;
  if (hasSpammyTld(text)) return true;
  return false;
}
export function similarity(a: string, b: string): number {
  const grams = (s: string) => {
    const g = new Set<string>();
    const t = s.toLowerCase();
    for (let i = 0; i < t.length - 2; i++) g.add(t.slice(i, i + 3));
    return g;
  };
  const A = grams(a);
  const B = grams(b);
  const inter = new Set([...A].filter((x) => B.has(x)));
  const union = new Set([...A, ...B]);
  return union.size ? inter.size / union.size : 0;
}
