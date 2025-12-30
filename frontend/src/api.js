export async function fetchArticles(){
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
  try {
    const res = await fetch(`${base}/articles`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch(e){
    console.error('API fetch failed:', e.message);
    return [];
  }
}
