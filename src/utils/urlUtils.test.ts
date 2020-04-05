import {
  filterAndNormalizeHrefs,
  isValidLink,
  normalizeLink,
  toAbsoluteURL,
} from "./urlUtils";

describe("toAbsoluteURL", () => {
  const TEST_CASES = [
    {
      hrefUrl: "pl",
      currentUrl: "https://jestjs.io/docs/en",
      expected: "https://jestjs.io/docs/pl",
    },
    {
      hrefUrl: "/api",
      currentUrl: "https://jestjs.io/docs",
      expected: "https://jestjs.io/api",
    },
    {
      hrefUrl: "../2014",
      currentUrl: "https://jestjs.io/blog/2015/1",
      expected: "https://jestjs.io/blog/2014",
    },
    {
      hrefUrl: "https://google.io/search=jest",
      currentUrl: "https://jestjs.io/docs",
      expected: "https://google.io/search=jest",
    },
    {
      hrefUrl: "mailto:contact@test.com",
      currentUrl: "https://jestjs.io",
      expected: "mailto:contact@test.com",
    },
    {
      hrefUrl: "http://google.com",
      currentUrl: "https://test.com",
      expected: "http://google.com/",
    },
    {
      hrefUrl: "pl",
      currentUrl: "https://test.com",
      expected: "https://test.com/pl",
    },

    {
      hrefUrl: "/blog?name=john#abut",
      currentUrl: "https://test.com/company",
      expected: "https://test.com/blog?name=john#abut",
    },
  ];

  for (const { hrefUrl, currentUrl, expected } of TEST_CASES) {
    test(`should return ${expected} if for url: ${hrefUrl} and currentUrl: ${currentUrl}`, () => {
      const actual = toAbsoluteURL(hrefUrl, currentUrl).toString();
      expect(actual).toBe(expected);
    });
  }
});

describe("isValidLink", () => {
  const TEST_CASES = [
    {
      expected: true,
      link: "https://test.com/docs/en",
      domain: "test.com",
    },
    {
      expected: true,
      link: "https://test.com/docs/en?search=help",
      domain: "test.com",
    },
    {
      expected: true,
      link: "https://test.com/docs/en#about",
      domain: "test.com",
    },
    {
      expected: false,
      link: "https://google.com/search=test",
      domain: "test.com",
    },
    {
      expected: false,
      link: "mailto:contact@test.com",
      domain: "test.com",
    },
    {
      expected: false,
      link: "https://test.com/docs/big.pdf",
      domain: "test.com",
    },
    {
      expected: false,
      link: "https://test.com/static/nice.jpg",
      domain: "test.com",
    },

    {
      expected: false,
      link: "https://test.com/people.html",
      domain: "test.com",
    },

    {
      expected: false,
      link: "https://test.com/people.php",
      domain: "test.com",
    },
  ];

  for (const { link, domain, expected } of TEST_CASES) {
    test(`should return ${expected} if for link: ${link} and currentUrl: ${domain}`, () => {
      expect(isValidLink(new URL(link), domain)).toBe(expected);
    });
  }
});

describe("filterAndNormalizeHrefs", () => {
  const TEST_CASES = [
    {
      expected: "https://test.com/docs/en/",
      link: "https://test.com/docs/en/",
    },
    {
      expected: "https://test.com/docs",
      link: "https://test.com/docs",
    },
    {
      expected: "https://test.com/docs/en",
      link: "https://test.com/docs/en?search=help",
    },
    {
      expected: "https://test.com/docs/fr",
      link: "https://test.com/docs/fr?search=help#hash",
    },
    {
      expected: "https://test.com/docs/en",
      link: "https://test.com/docs/en#about",
    },
    {
      expected: "https://test.com/",
      link: "https://test.com/#overview",
    },
    {
      expected: "https://test.com/",
      link: "https://test.com",
    },
  ];

  for (const { link, expected } of TEST_CASES) {
    test(`should return ${expected} for link: ${link}`, () => {
      expect(normalizeLink(new URL(link))).toBe(expected);
    });
  }
});

describe("normalizeLink", () => {
  test(`should return a list of filtered and normalized for links`, () => {
    const hrefs = [
      "/api",
      "en/",
      "../feature",
      "https://test.com/docs/fr?search=help#hash",
      "https://test.com/about",
      "/cool/document.jpg",
      "https://google.com/test",
      "https://test.com",
    ];
    const domain = "test.com";
    const baseUrl = "https://test.com/docs/help/";

    const expected = [
      "https://test.com/docs/help/en/",
      "https://test.com/api",
      "https://test.com/docs/feature",
      "https://test.com/docs/fr",
      "https://test.com/about",
      "https://test.com/",
    ];

    const actual = filterAndNormalizeHrefs(hrefs, domain, baseUrl);

    expect(actual.sort()).toEqual(expected.sort());
  });
});
