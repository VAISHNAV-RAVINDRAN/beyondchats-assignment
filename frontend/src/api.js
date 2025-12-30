export async function fetchArticles(){
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
  const res = await fetch(`${base}/articles`);
  if (!res.ok) throw new Error('Failed to load');
  return res.json();
}
