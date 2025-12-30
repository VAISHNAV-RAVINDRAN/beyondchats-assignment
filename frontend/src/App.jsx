import React, { useEffect, useState } from 'react'
import { fetchArticles } from './api'

export default function App(){
  const [articles, setArticles] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(()=>{ fetchArticles().then(setArticles).catch(console.error) }, [])

  return (
    <div className="container">
      <aside className="sidebar">
        <h2>Articles</h2>
        <ul>
          {articles.map(a=> (
            <li key={a.id} onClick={()=>setSelected(a)}>
              {a.title}
            </li>
          ))}
        </ul>
      </aside>
      <main className="content">
        {!selected && <div>Select an article to view</div>}
        {selected && (
          <article>
            <h1>{selected.title}</h1>
            <h3>Original</h3>
            <div className="article-body" dangerouslySetInnerHTML={{ __html: selected.original_content }} />
            <h3>Updated</h3>
            <div className="article-body" dangerouslySetInnerHTML={{ __html: selected.content }} />
            {selected.references && <div className="refs">
              <h4>References</h4>
              <ul>
                {JSON.parse(selected.references).map((r,i)=>(<li key={i}><a href={r.url} target="_blank" rel="noreferrer">{r.title || r.url}</a></li>))}
              </ul>
            </div>}
          </article>
        )}
      </main>
    </div>
  )
}
