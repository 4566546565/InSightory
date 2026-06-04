export type OpenContentSummary = {
  title: string;
  url: string;
  license: string;
  summary: string;
};

export function buildOpenStaxSearchUrl(query: string) {
  const url = new URL("https://openstax.org/search");
  url.searchParams.set("q", query.trim());
  return url.toString();
}

export function buildOerCommonsSearchUrl(query: string) {
  const url = new URL("https://www.oercommons.org/search");
  url.searchParams.set("f.search", query.trim());
  return url.toString();
}

export function extractOpenContentSummary(
  url: string,
  html: string,
  license = "需要逐条核验"
): OpenContentSummary {
  const title =
    firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i) ??
    firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ??
    url;

  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => normalizeHtmlText(match[1]))
    .filter(Boolean);

  return {
    title: normalizeHtmlText(title),
    url,
    license,
    summary: truncateSummary(paragraphs.join(" ")),
  };
}

export async function fetchOpenContentSummary(url: string, license?: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "InSightory knowledge expansion crawler",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch open content ${url}: ${response.status}`);
  }

  return extractOpenContentSummary(url, await response.text(), license);
}

function firstMatch(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1];
}

function normalizeHtmlText(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function truncateSummary(value: string, maxLength = 480) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}...`;
}
