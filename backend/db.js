const fs = require('fs');
const path = require('path');
const dbFile = path.join(__dirname, 'articles.json');

function load() {
  try {
    const raw = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { articles: [], nextId: 1 };
  }
}

function save(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

function getAll() {
  const d = load();
  return d.articles.slice().reverse();
}

function getById(id) {
  const d = load();
  return d.articles.find(a => a.id === Number(id)) || null;
}

function findByUrl(url) {
  const d = load();
  return d.articles.find(a => a.url === url) || null;
}

function insert(article) {
  const d = load();
  const id = d.nextId++;
  const now = new Date().toISOString();
  const row = Object.assign({ id, created_at: now, updated_at: null }, article);
  d.articles.push(row);
  save(d);
  return row;
}

function update(id, fields) {
  const d = load();
  const idx = d.articles.findIndex(a => a.id === Number(id));
  if (idx === -1) return null;
  const now = new Date().toISOString();
  d.articles[idx] = Object.assign({}, d.articles[idx], fields, { updated_at: now });
  save(d);
  return d.articles[idx];
}

function remove(id) {
  const d = load();
  const idx = d.articles.findIndex(a => a.id === Number(id));
  if (idx === -1) return false;
  d.articles.splice(idx, 1);
  save(d);
  return true;
}

module.exports = { getAll, getById, insert, update, remove, findByUrl };
