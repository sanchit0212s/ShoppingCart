import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as cheerio from "cheerio";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy endpoint for scraping
  app.post("/api/scrape", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ error: "No URL provided" });

      const response = await fetch(url, {
        headers: {
            "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5"
        }
      });
      // We do not throw on !response.ok, maybe we get 503 from amazon or 403 from flipkart 
      // but they still return the full initial HTML tree in SSR

      const html = await response.text();
      const $ = cheerio.load(html);

      let title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
      let image = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '';
      
      let price = 0;

      // 1. Try JSON-LD first (most reliable)
      let ldJsonPrice = 0;
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const content = $(el).html() || '';
          const data = JSON.parse(content);
          
          const findPrice = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            if (ldJsonPrice) return;
            
            if (obj['@type'] === 'Offer' || obj['@type'] === 'AggregateOffer') {
              if (obj.price) {
                ldJsonPrice = parseFloat(String(obj.price).replace(/[^0-9.]/g, ''));
              } else if (obj.lowPrice) {
                ldJsonPrice = parseFloat(String(obj.lowPrice).replace(/[^0-9.]/g, ''));
              }
            } else if (obj.offers) {
              if (Array.isArray(obj.offers) && obj.offers.length > 0) {
                 if (obj.offers[0].price) ldJsonPrice = parseFloat(String(obj.offers[0].price).replace(/[^0-9.]/g, ''));
              } else if (obj.offers.price) {
                 ldJsonPrice = parseFloat(String(obj.offers.price).replace(/[^0-9.]/g, ''));
              }
            }
            if (!ldJsonPrice) {
              Object.values(obj).forEach(findPrice);
            }
          };
          findPrice(data);
        } catch (e) {}
      });

      if (ldJsonPrice && !isNaN(ldJsonPrice)) {
          price = ldJsonPrice;
      } else {
        // 2. Try OG / Meta tags
        const priceMeta = $('meta[property="product:price:amount"]').attr('content') || $('meta[itemprop="price"]').attr('content');
        if (priceMeta) {
            price = parseFloat(priceMeta.replace(/[^0-9.]/g, ''));
        } else {
           // 3. Fallback heuristic: large text or text inside elements containing "price"
           const possiblePrices: { val: number, score: number }[] = [];
           $('*').each((i, el) => {
              const text = $(el).text().trim();
              const match = text.match(/(?:(?:₹|rs\.?)\s*)([0-9,]+(?:\.[0-9]{1,2})?)/i) || 
                            text.match(/([0-9,]+(?:\.[0-9]{1,2})?)\s*(?:₹|rs\.?)/i);
                            
              if (match && $(el).children().length === 0) {
                 let val = parseFloat(match[1].replace(/,/g, ''));
                 let score = 0;
                 const className = $(el).attr('class') || '';
                 const id = $(el).attr('id') || '';
                 
                 // Boost if class/id contains 'price' or 'amount'
                 if (/price|amount/i.test(className) || /price|amount/i.test(id)) score += 10;
                 // Boost if it's an important tag
                 if (['h1', 'h2', 'h3', 'strong', 'b'].includes(el.tagName.toLowerCase())) score += 5;
                 // Penalty if it's very small or likely to be delivery/emi
                 if (/emi|delivery|shipping|save|discount/i.test(text) || /emi|delivery|shipping/i.test(className)) score -= 10;
                 // Boost based on common price ranges to avoid picking picking 0.99 Rs or whatever
                 if (val > 100) score += 2;
                 
                 possiblePrices.push({ val, score });
              }
           });
           
           if (possiblePrices.length > 0) {
              // Sort by score descending
              possiblePrices.sort((a, b) => b.score - a.score);
              price = possiblePrices[0].val;
           }
        }
      }

      if (isNaN(price)) price = 0;

      res.json({ title: title.trim(), image, price });
    } catch (e: any) {
      console.error("Scrape error:", e.message);
      res.status(500).json({ error: e.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
