const axios = require('axios');
const googleIt = require('google-it');
const cheerio = require('cheerio');
require('dotenv').config();
const db = require('./db');
const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function fetchArticles(){
  return db.getAll();
}

async function searchTopTwo(title){
  try{
    const results = await googleIt({ query: title, limit: 6 });
    const filtered = results.filter(r => r.link && /https?:\/\//.test(r.link));
    return filtered.slice(0,2).map(r=> ({ title: r.title, link: r.link }));
  } catch(e){
    return [];
  }
}

async function fetchAndExtract(url){
  try{
    const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 });
    const $ = cheerio.load(r.data || '');
    const title = $('h1').first().text().trim() || $('title').text().trim();
    const paragraphs = $('p').map((i,el)=> $(el).text().trim()).get().filter(t=>t.length>30);
    const text = paragraphs.join('\n\n');
    return { title: title || '', text: text || '' };
  } catch(e){
    return { title: '', text: '' };
  }
}

async function callOpenAI(prompt){
  const payload = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: prompt }
    ],
    max_tokens: 1500
  };
  const resp = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return resp.data.choices && resp.data.choices[0] && resp.data.choices[0].message.content;
}

function buildPrompt(originalTitle, originalContent, refs){
  const refSummaries = refs.map((r, i)=> `Reference ${i+1} Title: ${r.title}\nURL: ${r.link}\nExcerpt:\n${r.text.slice(0,1000)}\n---`).join('\n\n');
  return `You are an expert editor. Rewrite the article titled "${originalTitle}" to have similar tone, structure and formatting as the two reference articles below. Use the original article's facts but update phrasing, structure, and add sections as needed. Keep the article professional and improve readability. At the bottom, add a "References" section listing the two reference URLs with short citations.

Original Article:\n${originalContent.slice(0,4000)}\n\nReferences:\n${refSummaries}\n\nProduce a full HTML-ready article body (with headings and paragraphs) and ensure the References section includes both links. Do not invent references beyond the two provided.`;
}

async function run(){
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not set in environment');
  const articles = await fetchArticles();
  for (const art of articles){
    try{
      console.log('Processing:', art.title);
      const refsMeta = await searchTopTwo(art.title);
      const refs = [];
      for (const r of refsMeta){
        const ext = await fetchAndExtract(r.link);
        refs.push({ title: ext.title || r.title, link: r.link, text: ext.text });
      }
      const prompt = buildPrompt(art.title, art.original_content || art.content || '', refs);
      const aiOutput = await callOpenAI(prompt);
      if (!aiOutput) continue;
      const references = refs.map(r => ({ title: r.title, url: r.link }));
      db.update(art.id, { title: art.title, slug: art.slug, url: art.url, original_content: art.original_content || art.content, content: aiOutput, references: JSON.stringify(references) });
      console.log('Updated article:', art.title);
    } catch(e){
      console.error('Error processing article:', art.title, e.message);
    }
  }
  console.log('All done.');
}

if (require.main === module) run();

module.exports = { run };
