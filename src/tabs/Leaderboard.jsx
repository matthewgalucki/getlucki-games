import { useState } from 'react'
import { TEAMS, calcScore, calcSpent, priceColor } from '../data.js'
import { Medal, Btn } from '../components.jsx'

export default function Leaderboard({ entries, wins, prices, lastSynced, onRefresh, refreshing }) {
  const [expanded, setExpanded] = useState(null)
  const [view, setView] = useState('all')

  const ranked = [...entries]
    .map(e => ({ ...e, score:calcScore(e.picks, wins), spent:calcSpent(e.picks, prices) }))
    .sort((a, b) => b.score - a.score || a.spent - b.spent)

  const displayed = view === 'top10' ? ranked.slice(0, 10) : ranked

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ color:'#f1f5f9', fontSize:22, fontWeight:900, marginBottom:4 }}>🏆 Standings</h2>
          <p style={{ color:'#94a3b8', fontSize:12 }}>
            {entries.length} entries · {lastSynced ? `Synced ${lastSynced}` : 'Hit Refresh to pull live wins from ESPN'}
          </p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ display:'flex', background:'#0c1421', borderRadius:8, overflow:'hidden', border:'1px solid #1a2332' }}>
            {['all','top10'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                background:v===view?'#16a34a':'transparent', color:v===view?'#fff':'#64748b',
                border:'none', padding:'7px 14px', cursor:'pointer', fontSize:12, fontWeight:700,
              }}>{v==='all'?'All':'Top 10'}</button>
            ))}
          </div>
          <Btn onClick={onRefresh} disabled={refreshing} size='sm'>
            {refreshing ? '⟳ Syncing…' : '⟳ Refresh Wins'}
          </Btn>
        </div>
      </div>

      {/* Column headers */}
      <div style={{ display:'grid', gridTemplateColumns:'38px 1fr 60px 54px 58px 20px', gap:4, padding:'6px 14px', color:'#64748b', fontSize:11, fontWeight:700, letterSpacing:0.5, marginBottom:6 }}>
        <span>#</span><span>PLAYER</span>
        <span style={{textAlign:'right'}}>WINS</span>
        <span style={{textAlign:'right'}}>SPENT</span>
        <span style={{textAlign:'right'}}>$/WIN</span>
        <span/>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        {displayed.map(entry => {
          const rank  = ranked.indexOf(entry) + 1
          const isOpen = expanded === entry.id
          const cpw   = entry.score > 0 ? (entry.spent / entry.score).toFixed(1) : '—'

          return (
            <div key={entry.id} style={{
              background: rank===1 ? 'linear-gradient(135deg,#0d2818,#0c1421)' : rank<=3 ? '#0c1825' : '#0a0f18',
              border:`1px solid ${rank===1?'#16a34a':rank<=3?'#1e3a5f':'#111827'}`,
              borderRadius:10, overflow:'hidden',
            }}>
              <div onClick={() => setExpanded(isOpen ? null : entry.id)} style={{
                display:'grid', gridTemplateColumns:'38px 1fr 60px 54px 58px 20px',
                gap:4, padding:'13px 14px', cursor:'pointer', alignItems:'center',
              }}>
                <div style={{ display:'flex', justifyContent:'center' }}><Medal rank={rank} /></div>
                <div>
                  <div style={{ fontWeight:800, fontSize:14, color:'#f1f5f9' }}>{entry.player_name}</div>
                  <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{entry.picks.length} picks</div>
                </div>
                <div style={{ textAlign:'right', fontFamily:'monospace', fontWeight:900, fontSize:22, color:rank===1?'#4ade80':rank<=3?'#93c5fd':'#e2e8f0' }}>{entry.score}</div>
                <div style={{ textAlign:'right', fontFamily:'monospace', fontSize:12, color:'#94a3b8' }}>${entry.spent}</div>
                <div style={{ textAlign:'right', fontFamily:'monospace', fontSize:12, color:'#64748b' }}>{cpw}</div>
                <div style={{ textAlign:'right', color:'#64748b', fontSize:10 }}>{isOpen?'▲':'▼'}</div>
              </div>

              {isOpen && (
                <div style={{ borderTop:'1px solid #111827', padding:'12px 16px', background:'#060d16' }}>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:10 }}>
                    {entry.picks.map(abbr => {
                      const price = prices[abbr] || 0
                      const w = wins[abbr] || 0
                      return (
                        <div key={abbr} style={{ background:'#0c1421', border:'1px solid #1a2332', borderRadius:8, padding:'8px 12px', textAlign:'center', minWidth:60 }}>
                          <div style={{ fontFamily:'monospace', fontWeight:800, fontSize:14, color:'#e2e8f0' }}>{abbr}</div>
                          <div style={{ fontSize:10, color:priceColor(price), fontWeight:700, margin:'2px 0' }}>${price}</div>
                          <div style={{ fontSize:14, fontFamily:'monospace', fontWeight:900, color:w>0?'#4ade80':'#374151' }}>{w}W</div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ fontSize:11, color:'#64748b' }}>
                    Budget: ${entry.spent} · Score: {entry.score} wins · {cpw !== '—' ? `$${cpw}/win` : 'No wins yet'}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {entries.length === 0 && (
          <div style={{ textAlign:'center', padding:'70px 0', color:'#64748b' }}>
            <div style={{ fontSize:48, marginBottom:14 }}>📋</div>
            <p style={{ fontSize:15 }}>No entries yet. Share the join code to get players drafting!</p>
          </div>
        )}
      </div>
    </div>
  )
}
