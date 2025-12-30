const axios = require('axios');
const cheerio = require('cheerio');
const db = require('./db');
const url = 'https://beyondchats.com/blogs/';

async function fetchHtml(u){
  const resp = await axios.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  return resp.data;
}

function pickMainContent($){
  const selectors = ['.post-content', '.entry-content', 'article', '.blog-single-content', '#content'];
  for (const sel of selectors){
    const el = $(sel);
    if (el && el.text().trim().length > 200) return el.text().trim();
  }
  return $('body').text().trim();
}

async function run(){
  try{
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    let lastPageLink = null;
    const pagLinks = $('a').filter((i,el) => $(el).attr('href') && /page=\d+/i.test($(el).attr('href')));
    if (pagLinks.length){
      let max = 1;
      pagLinks.each((i,el)=>{
        const href = $(el).attr('href');
        const m = href.match(/page=(\d+)/i);
        if (m){
          const n = parseInt(m[1],10);
          if (n > max) max = n;
        }
      });
      lastPageLink = url + '?page=' + max;
    }

    const pageToUse = lastPageLink || url;
    console.log('Fetching page:', pageToUse);
    const pageHtml = await fetchHtml(pageToUse);
    const $$ = cheerio.load(pageHtml);

    const links = new Map();
    $$('a').each((i, el) => {
      const href = $$(el).attr('href');
      const txt = $$(el).text().trim();
      if (!href) return;
      if (/blog|blogs|post|article/i.test(href) || /blog/i.test(href)){
        links.set(href, txt || href);
      }
    });

    const chosen = Array.from(links.keys()).slice(0, 10);
    const articles = [];
    for (const link of chosen){
      try{
        const full = link.startsWith('http') ? link : new URL(link, url).href;
        const artHtml = await fetchHtml(full);
        const $$$ = cheerio.load(artHtml);
        const title = $$$('h1').first().text().trim() || $$$('title').text().trim();
        const content = pickMainContent($$$);
        if (title && content && content.length > 200){
          articles.push({ title, url: full, content });
          if (articles.length >= 5) break;
        }
      } catch(e){
      }
    }

    for (const a of articles){
      const slug = a.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
      const existing = db.findByUrl(a.url);
      if (!existing){
        db.insert({ title: a.title, slug, url: a.url, original_content: a.content, content: a.content, references: JSON.stringify([]) });
        console.log('Saved:', a.title);
      } else {
        console.log('Already exists:', a.title);
      }
    }

    console.log('Done.');
  } catch(err){
    console.error('Scrape error:', err.message);
  }
}

if (require.main === module) run();

module.exports = { run };
