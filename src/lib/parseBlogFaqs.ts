export type BlogFaqItem = { q: string; a: string };

const FAQ_HEADING = /<h3>\s*Frequently Asked Questions\s*<\/h3>/i;
const FAQ_ITEM =
  /^\s*<p>\s*<strong>Q:\s*([\s\S]*?)<\/strong>\s*<br\s*\/?>\s*([\s\S]*?)<\/p>/i;

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** Pulls FAQ blocks out of blog HTML so they can render in a dedicated panel. */
export function parseBlogContent(content: string): {
  content: string;
  faqs: BlogFaqItem[];
} {
  const headingMatch = content.match(FAQ_HEADING);
  if (!headingMatch || headingMatch.index === undefined) {
    return { content, faqs: [] };
  }

  const before = content.slice(0, headingMatch.index);
  let rest = content.slice(headingMatch.index + headingMatch[0].length);
  const faqs: BlogFaqItem[] = [];

  while (true) {
    const itemMatch = rest.match(FAQ_ITEM);
    if (!itemMatch) break;
    faqs.push({
      q: stripHtml(itemMatch[1]),
      a: stripHtml(itemMatch[2]),
    });
    rest = rest.slice(itemMatch[0].length);
  }

  if (faqs.length === 0) {
    return { content, faqs: [] };
  }

  return { content: (before + rest).trim(), faqs };
}
