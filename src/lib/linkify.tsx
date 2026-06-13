import React from 'react';

const URL_RE = /(https?:\/\/[^\s]+)|(\b(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/gi;
const TRAILING_PUNCT = /[.,;:!?)\]}>'"]+$/;

export function linkifyText(text: string): React.ReactNode[] {
  if (!text) return [];
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  const linkClass =
    'text-primary hover:text-primary/80 underline underline-offset-2 break-all';

  const matches = text.matchAll(URL_RE);
  for (const m of matches) {
    const raw = m[0];
    const start = m.index ?? 0;
    // Strip trailing punctuation
    const trail = raw.match(TRAILING_PUNCT)?.[0] ?? '';
    const url = trail ? raw.slice(0, raw.length - trail.length) : raw;
    if (!url) continue;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    nodes.push(
      <a
        key={`lk-${key++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={linkClass}
      >
        {url}
      </a>,
    );
    if (trail) nodes.push(trail);
    lastIndex = start + raw.length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}