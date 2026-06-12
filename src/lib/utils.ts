export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#038;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

/** Strip Themify nav/logo boilerplate from extracted WordPress page markdown. */
export function cleanPageContent(markdown: string): string {
  return markdown
    .replace(/^\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)\s*\n+/m, '')
    .replace(/\*   \[Home\][^\n]*\n(?:\*   \[[^\]]*\][^\n]*\n)*/m, '')
    .replace(/^#\s+.+\n+/m, '')
    .trim();
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
