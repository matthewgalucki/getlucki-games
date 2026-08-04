import { useState } from 'react'
import { TEAMS, priceColor, pctTaken } from '../data.js'

export default function TeamsTab({ wins, entries }) {
  const [sort, setSort] = useState('price')

  const sorted = [...TEAMS].sort((a, b) => {
    if (sort === 'price') return b.price - a.price
    if (sort === 'wins')  return (wins[b.abbr]||0) - (wins[a.abbr]||0)
    if (sort === 'taken') return pctTaken(b.abbr, entries) - pctTaken(a.abbr, entries)
    return 0
  })

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ color:'#f1f5f9', fontSize:22, fontWeight:900, marginBottom:4 }}>🏈 All 32 Teams</h2>
          <p style={{ color:'#475569', fontSize:12 }}>Current prices, win totals, and draft popularity</p>
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{
          background:'#0c1421', border:'1px solid #1a2332', borderRadius:8,
          padding:'7px 12px', color:'#94a3b8', fontSize:12, outline:'none', cursor:'pointer',
        }}>
          <option value="price">Sort: Price</option>
          <option value="wins">Sort: Wins</option>
          <option value="taken">Sort: % Taken</option>
        </select>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'48px 1fr 52px 54px 58px', gap:4, padding:'4px 14px 10px', color:'#334155', fontSize:11, fontWeight:700 }}>
        <span>$</span><span>TEAM</span>
        <span style={{textAlign:'right'}}>WINS</span>
        <span style={{textAlign:'right'}}>TAKEN</span>
        <span style={{textAlign:'right'}}>$/WIN</span>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        {sorted.map(team => {
          const w   = wins[team.abbr] || 0
          const pct = pctTaken(team.abbr, entries)
          const cpw = w > 0 ? (team.price / w).toFixed(1) : '—'
          return (
            <div key={team.abbr} style={{
              background:'#0a0f18', border:'1px solid #111827', borderRadius:9,
              display:'grid', gridTemplateColumns:'48px 1fr 52px 54px 58px',
              gap:4, padding:'11px 14px', alignItems:'center',
            }}>
              <span style={{ fontWeight:900, fontFamily:'monospace', fontSize:16, color:priceColor(team.price) }}>${team.price}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:'#e2e8f0', fontFamily:'monospace' }}>{team.abbr}</div>
                <div style={{ fontSize:10, color:'#1e293b', marginTop:1 }}>{team.name}</div>
              </div>
              <div style={{ textAlign:'right', fontFamily:'monospace', fontWeight:800, fontSize:16, color:w>0?'#4ade80':'#1e293b' }}>{w}</div>
              <div style={{ textAlign:'right', fontSize:12, color:'#475569' }}>{pct}%</div>
              <div style={{ textAlign:'right', fontFamily:'monospace', fontSize:12, color:'#334155' }}>{cpw}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
