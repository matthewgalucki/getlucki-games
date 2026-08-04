import { useState, useRef } from 'react'
import { TEAMS, priceColor } from './data.js'

const NAME = Object.fromEntries(TEAMS.map(t => [t.abbr, t.name]))

// props:
//   order: array of abbrs, best first (index 0 = $32)
//   onChange: (newOrder) => void
export default function RankingEditor({ order, onChange }) {
  const [dragIdx, setDragIdx]   = useState(null)
  const [overIdx, setOverIdx]   = useState(null)
  const [search, setSearch]     = useState('')
  const touchRef = useRef(null)

  const n = order.length

  function move(from, to) {
    if (to < 0 || to >= n || from === to) return
    const next = [...order]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  function onDrop(target) {
    if (dragIdx === null) return
    move(dragIdx, target)
    setDragIdx(null); setOverIdx(null)
  }

  const filtered = order
    .map((abbr, idx) => ({ abbr, idx }))
    .filter(({ abbr }) =>
      !search ||
      abbr.toLowerCase().includes(search.toLowerCase()) ||
      NAME[abbr]?.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div>
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Find a team to adjust…"
        style={{
          width:'100%', background:'#0a0f18', border:'1px solid #111827', borderRadius:9,
          padding:'9px 14px', color:'#f1f5f9', fontSize:13, outline:'none',
          boxSizing:'border-box', marginBottom:12, fontFamily:'inherit',
        }}
      />

      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        {filtered.map(({ abbr, idx }) => {
          const price = n - idx
          const isDragging = dragIdx === idx
          const isOver = overIdx === idx
          return (
            <div
              key={abbr}
              draggable={!search}
              onDragStart={() => setDragIdx(idx)}
              onDragOver={e => { e.preventDefault(); setOverIdx(idx) }}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
              onDrop={() => onDrop(idx)}
              style={{
                display:'grid', gridTemplateColumns:'28px 44px 1fr auto',
                gap:10, alignItems:'center',
                background: isOver && !isDragging ? '#0d2818' : '#0a0f18',
                border:`1px solid ${isOver && !isDragging ? '#16a34a' : '#111827'}`,
                borderRadius:9, padding:'9px 12px',
                opacity: isDragging ? 0.4 : 1,
                cursor: search ? 'default' : 'grab',
                transition:'background 0.1s, opacity 0.1s',
              }}
            >
              {/* Rank number */}
              <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:12, color:'#64748b', textAlign:'center' }}>
                #{idx + 1}
              </span>

              {/* Price */}
              <span style={{ fontFamily:'monospace', fontWeight:900, fontSize:16, color:priceColor(price) }}>
                ${price}
              </span>

              {/* Team */}
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:'monospace', fontWeight:800, fontSize:13, color:'#e2e8f0' }}>{abbr}</div>
                <div style={{ fontSize:10, color:'#64748b', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{NAME[abbr]}</div>
              </div>

              {/* Arrows */}
              <div style={{ display:'flex', gap:4 }}>
                <button
                  onClick={() => move(idx, idx - 1)}
                  disabled={idx === 0}
                  title="Move up (more expensive)"
                  style={{
                    background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:6,
                    width:30, height:30, cursor: idx===0 ? 'not-allowed' : 'pointer',
                    color: idx===0 ? '#1e293b' : '#94a3b8', fontSize:14, fontWeight:700,
                    display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit',
                  }}
                >▲</button>
                <button
                  onClick={() => move(idx, idx + 1)}
                  disabled={idx === n - 1}
                  title="Move down (cheaper)"
                  style={{
                    background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:6,
                    width:30, height:30, cursor: idx===n-1 ? 'not-allowed' : 'pointer',
                    color: idx===n-1 ? '#1e293b' : '#94a3b8', fontSize:14, fontWeight:700,
                    display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit',
                  }}
                >▼</button>
              </div>
            </div>
          )
        })}
      </div>

      {search && (
        <p style={{ color:'#64748b', fontSize:12, marginTop:10 }}>
          Clear the search box to drag-and-drop reorder the full list.
        </p>
      )}
    </div>
  )
}
