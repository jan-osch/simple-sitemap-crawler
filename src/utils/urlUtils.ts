export const isValidLink = (url: URL, domain: string): boolean => {
  if (!["http:", "https:"].includes(url.protocol)) {
    return false;
  }

  if (url.hostname !== domain) {
    return false;
  }

  if (url.password || url.username) {
    return false;
  }

  // TODO add support for '.htm', '.html', '.php', '.asp' extensions
  const extensionExists = url.pathname.indexOf(".") !== -1;

  return !extensionExists;
};

export const toAbsoluteURL = (hrefUrl: string, baseUrl: string): URL => {
  return new URL(hrefUrl, baseUrl);
};

export const normalizeLink = (linkUrl: URL): string => {
  const copy = new URL(linkUrl.toString());
  copy.hash = "";
  copy.search = "";

  return copy.toString();
};

export const filterAndNormalizeHrefs = (
  hrefs: string[],
  domain: string,
  baseUrl: string
): string[] => {
  return hrefs
    .map((href) => toAbsoluteURL(href, baseUrl))
    .filter((url) => isValidLink(url, domain))
    .map(normalizeLink);
};

export const getDomain = (url: string): string => {
  return new URL(url).hostname;
};
