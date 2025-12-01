import type { NextApiRequest, NextApiResponse } from "next";
// Fix: Import cheerio as default for CommonJS compatibility
import * as cheerio from "cheerio";
import fetch from "node-fetch";

// Simple website scraper using cheerio
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  try {
    // Validate URL format
    if (!/^https?:\/\/.+\..+/.test(url)) {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Add more logging for debugging
    console.log("Scraping URL:", url);

    let htmlRes;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      htmlRes = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0" }, // Add User-Agent header
      });
      clearTimeout(timeoutId);
    } catch (fetchErr: any) {
      console.error("Fetch error:", fetchErr);
      return res.status(500).json({
        error: "Failed to fetch URL",
        details: fetchErr?.message || String(fetchErr),
      });
    }

    if (!htmlRes || !htmlRes.ok) {
      console.error("Fetch response error:", htmlRes?.status, htmlRes?.statusText);
      return res.status(500).json({
        error: "Failed to fetch URL",
        details: `Status: ${htmlRes?.status} ${htmlRes?.statusText}`,
      });
    }

    const html = await htmlRes.text();
    if (!html || html.length < 50) {
      console.error("HTML too short or empty");
      return res.status(500).json({
        error: "Fetched HTML is empty or too short",
        details: "No content or invalid response from target URL.",
      });
    }

    let $;
    try {
      // Fix: Use cheerio.default.load for compatibility
      $ = (cheerio as any).load ? (cheerio as any).load(html) : cheerio.load(html);
    } catch (cheerioErr: any) {
      console.error("Cheerio parse error:", cheerioErr);
      return res.status(500).json({
        error: "Failed to parse HTML",
        details: cheerioErr?.message || String(cheerioErr),
      });
    }

    // Defensive extraction
    const title = $("title").text() || "";
    const description = $('meta[name="description"]').attr("content") || "";
    const headings: string[] = [];
    $("h1, h2").each((_: unknown, el: Element) => {
      const text = $(el).text();
      if (text) headings.push(text);
    });

    const products: string[] = [];
    $(".product, .product-name").each((_: unknown, el: Element) => {
      const text = $(el).text();
      if (text) products.push(text);
    });

    // Extract About Us, Mission, etc. by looking for common section selectors or keywords
    let aboutUs = "";
    let mission = "";

    // Try to find sections by id or class
    const aboutSelectors = [
      "#about", ".about", "#aboutus", ".aboutus", "[id*='about']", "[class*='about']"
    ];
    for (const sel of aboutSelectors) {
      const section = $(sel).first();
      if (section.length) {
        aboutUs = section.text().trim();
        break;
      }
    }
    // Fallback: search for keywords in headings
    if (!aboutUs) {
      $("h1, h2, h3, h4").each((_: unknown, el: Element) => {
        const text = $(el).text().toLowerCase();
        if (text.includes("about")) {
          aboutUs = $(el).next().text().trim();
        }
      });
    }

    const missionSelectors = [
      "#mission", ".mission", "[id*='mission']", "[class*='mission']"
    ];
    for (const sel of missionSelectors) {
      const section = $(sel).first();
      if (section.length) {
        mission = section.text().trim();
        break;
      }
    }
    // Fallback: search for keywords in headings
    if (!mission) {
      $("h1, h2, h3, h4").each((_: unknown, el: Element) => {
        const text = $(el).text().toLowerCase();
        if (text.includes("mission")) {
          mission = $(el).next().text().trim();
        }
      });
    }

    // Scrape links to other pages (e.g., About, Mission, Contact, etc.)
    const pageLinks: { text: string; href: string }[] = [];
    $("a").each((_: unknown, el: Element) => {
      const text = $(el).text().trim().toLowerCase();
      const href = $(el).attr("href");
      if (
        href &&
        (text.includes("about") ||
          text.includes("mission") ||
          text.includes("contact") ||
          text.includes("team") ||
          text.includes("company"))
      ) {
        // Only add internal links (not external)
        if (href.startsWith("/") || href.startsWith(url)) {
          pageLinks.push({ text, href });
        }
      }
    });

    // Try to scrape each found page for more info (sync, simple demo: only first 2 pages)
    const extraPages: Record<string, any> = {};
    for (let i = 0; i < Math.min(pageLinks.length, 2); i++) {
      let pageUrl = pageLinks[i].href;
      if (pageUrl.startsWith("/")) {
        // Make absolute URL
        const base = url.endsWith("/") ? url : url + "/";
        pageUrl = base + pageUrl.replace(/^\//, "");
      }
      try {
        const pageRes = await fetch(pageUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        if (pageRes.ok) {
          const pageHtml = await pageRes.text();
          const $$ = (cheerio as any).load ? (cheerio as any).load(pageHtml) : cheerio.load(pageHtml);
          extraPages[pageLinks[i].text] = {
            title: $$("title").text() || "",
            headings: $$("h1, h2, h3, h4").map((_: unknown, el: Element) => $$(el).text()).get(),
            content: $$("body").text().trim().slice(0, 1000), // First 1000 chars
          };
        }
      } catch (err) {
        extraPages[pageLinks[i].text] = { error: "Failed to fetch or parse" };
      }
    }

    // Scrape main visible content from the body (not just meta/headings)
    let mainContent = "";
    // Try to get main content from <main>, <article>, or fallback to <body>
    if ($("main").length) {
      mainContent = $("main").text().trim();
    } else if ($("article").length) {
      mainContent = $("article").text().trim();
    } else {
      mainContent = $("body").text().trim();
    }
    // Limit to first 5000 characters for safety
    mainContent = mainContent.slice(0, 5000);

    res.status(200).json({
      title,
      description,
      headings,
      products,
      url,
      aboutUs,
      mission,
      pageLinks,
      extraPages,
      mainContent,
    });
  } catch (error: any) {
    console.error("Scrape error:", error);
    res.status(500).json({
      error: "Failed to scrape website",
      details: error?.message || String(error),
    });
  }
}
