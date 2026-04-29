export type BannerSize = {
  width: number;
  height: number;
  id: string;
  label: string;
};

const EXACT_SIZE_PATTERN = /^\d{2,4}x\d{2,4}$/i;
const LOOSE_SIZE_PATTERN = /(?:^|[^0-9])(\d{2,4})x(\d{2,4})(?=[^0-9]|$)/i;
const META_TAG_PATTERN = /<meta\b[^>]*>/gi;

function buildBannerSize(width: string | number, height: string | number) {
  const parsedWidth = Number(width);
  const parsedHeight = Number(height);

  if (
    !Number.isInteger(parsedWidth) ||
    !Number.isInteger(parsedHeight) ||
    parsedWidth <= 0 ||
    parsedHeight <= 0
  ) {
    return null;
  }

  const id = `${parsedWidth}x${parsedHeight}`;
  return {
    width: parsedWidth,
    height: parsedHeight,
    id,
    label: id
  };
}

function getHtmlAttribute(tag: string, attribute: string) {
  const match = tag.match(
    new RegExp(`${attribute}\\s*=\\s*["']([^"']+)["']`, "i")
  );
  return match?.[1] ?? null;
}

function detectExactSizeToken(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const baseName = trimmed.replace(/\.[^.]+$/u, "");
  const candidate = EXACT_SIZE_PATTERN.test(trimmed)
    ? trimmed
    : EXACT_SIZE_PATTERN.test(baseName)
      ? baseName
      : null;

  if (!candidate) return null;

  const [width, height] = candidate.toLowerCase().split("x");
  return buildBannerSize(width, height);
}

export function detectBannerSizeFromPath(path: string) {
  const segments = path.split("/").filter(Boolean);

  for (const segment of segments) {
    const exact = detectExactSizeToken(segment);
    if (exact) return exact;
  }

  const looseMatch = path.match(LOOSE_SIZE_PATTERN);
  if (!looseMatch) return null;

  return buildBannerSize(looseMatch[1], looseMatch[2]);
}

export function detectBannerSizeFromHtml(html: string) {
  const metaTags = html.match(META_TAG_PATTERN) ?? [];

  for (const tag of metaTags) {
    const name = getHtmlAttribute(tag, "name");
    if (name?.toLowerCase() !== "ad.size") continue;

    const content = getHtmlAttribute(tag, "content");
    if (!content) continue;

    const width = content.match(/(?:^|[,;\s])width\s*=\s*(\d+)/i)?.[1];
    const height = content.match(/(?:^|[,;\s])height\s*=\s*(\d+)/i)?.[1];

    if (width && height) {
      return buildBannerSize(width, height);
    }
  }

  return null;
}
