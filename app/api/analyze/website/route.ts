import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Fetch website content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch website' },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Use Gemini API to extract brand info
    const { geminiAnalyzeWebsite } = await import('../../../../src/lib/gemini');
    const geminiResult = await geminiAnalyzeWebsite({ html });

    // Extract product images from HTML (fallback)
    let productImages = Array.isArray(geminiResult.productImages) && geminiResult.productImages.length > 0 ? geminiResult.productImages : [];
    if (productImages.length === 0) {
      $('img').each((_, el) => {
        const src = $(el).attr('src');
        if (src && !src.toLowerCase().includes('logo')) {
          // Convert relative URLs to absolute
          let imgUrl = src;
          if (imgUrl.startsWith('/')) {
            const urlObj = new URL(url);
            imgUrl = `${urlObj.protocol}//${urlObj.host}${imgUrl}`;
          }
          productImages.push(imgUrl);
        }
      });
    }

    // Extract logo from HTML (fallback)
    let logo = typeof geminiResult.logo === 'string' && geminiResult.logo ? geminiResult.logo : '';
    if (!logo) {
      const logoSelectors = [
        'img[alt*="logo" i]',
        'img[src*="logo" i]',
        '.logo img',
        '#logo img',
        'header img'
      ];
      for (const selector of logoSelectors) {
        const logoElement = $(selector).first();
        if (logoElement.length) {
          logo = logoElement.attr('src') || '';
          if (logo) {
            // Convert relative URLs to absolute
            if (logo.startsWith('/')) {
              const urlObj = new URL(url);
              logo = `${urlObj.protocol}//${urlObj.host}${logo}`;
            }
            break;
          }
        }
      }
    }

    // Fallback extraction for colors and fonts if Gemini returns empty
    let colors = Array.isArray(geminiResult.colors) && geminiResult.colors.length > 0 ? geminiResult.colors : undefined;
    let fonts = Array.isArray(geminiResult.fonts) && geminiResult.fonts.length > 0 ? geminiResult.fonts : undefined;

    // Extract colors from CSS if Gemini failed
    if (!colors) {
      const cssText = $('style').text();
      const colorRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
      const matches = cssText.match(colorRegex);
      if (matches) {
        const uniqueColors = [...new Set(matches)];
        colors = uniqueColors.slice(0, 5);
      } else {
        colors = [];
      }
    }

    // Extract fonts from HTML if Gemini failed
    if (!fonts) {
      fonts = [];
      // Google Fonts
      $('link[rel="stylesheet"]').each((_, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('fonts.googleapis.com')) {
          const fontMatch = href.match(/family=([^&:]+)/);
          if (fontMatch && fontMatch[1]) {
            fonts.push(decodeURIComponent(fontMatch[1].replace(/\+/g, ' ')));
          }
        }
      });
      // Inline style attributes
      $('[style]').each((_, el) => {
        const style = $(el).attr('style');
        if (style) {
          const fontMatch = style.match(/font-family:\s*([^;]+)/i);
          if (fontMatch && fontMatch[1]) {
            fontMatch[1].split(',').forEach(f => {
              const cleanFont = f.replace(/['"]/g, '').trim();
              if (cleanFont && !fonts.includes(cleanFont)) fonts.push(cleanFont);
            });
          }
        }
      });
      // <style> tags
      $('style').each((_, el) => {
        const css = $(el).html();
        if (css) {
          const regex = /font-family:\s*([^;}{]+)/gi;
          let match;
          while ((match = regex.exec(css)) !== null) {
            match[1].split(',').forEach(f => {
              const cleanFont = f.replace(/['"]/g, '').trim();
              if (cleanFont && !fonts.includes(cleanFont)) fonts.push(cleanFont);
            });
          }
        }
      });
    }

    return NextResponse.json({
      ...geminiResult,
      title: typeof geminiResult.title === 'string' && geminiResult.title ? geminiResult.title : (
        $('meta[property="og:site_name"]').attr('content') ||
        $('meta[name="application-name"]').attr('content') ||
        $('title').text() ||
        $('h1').first().text() ||
        ''
      ),
      colors,
      fonts,
      productImages,
      logo,
      url
    });

  } catch (error) {
    console.error('Website analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    );
  }
}