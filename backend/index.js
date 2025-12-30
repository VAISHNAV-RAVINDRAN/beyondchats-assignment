require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

app.get('/articles', (req, res) => {
  const rows = db.getAll();
  res.json(rows);
});

app.get('/articles/:id', (req, res) => {
  const row = db.getById(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

app.post('/articles', (req, res) => {
  const { title, slug, url, original_content, content, references } = req.body;
  const created = db.insert({ title: title || null, slug: slug || null, url: url || null, original_content: original_content || null, content: content || null, references: references ? JSON.stringify(references) : null });
  res.status(201).json(created);
});

app.put('/articles/:id', (req, res) => {
  const id = req.params.id;
  const { title, slug, url, original_content, content, references } = req.body;
  const existing = db.getById(id);
  if (!existing) return res.status(404).json({ error: 'Not found' });
  const updated = db.update(id, { title: title || existing.title, slug: slug || existing.slug, url: url || existing.url, original_content: original_content || existing.original_content, content: content || existing.content, references: references ? JSON.stringify(references) : existing.references });
  res.json(updated);
});

app.delete('/articles/:id', (req, res) => {
  const id = req.params.id;
  db.remove(id);
  res.status(204).end();
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
