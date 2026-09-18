import { useState } from 'react'
import { TEAMS, calcScore, calcSpent, priceColor } from '../data.js'
import { Medal, Btn } from '../components.jsx'

export default function Leaderboard({ entries, wins, prices, played = {}, lastResults = {}, lastSynced, revealed = true, onRefresh, refreshing }) {
  const [expanded, setExpanded] = useState(null)
  const [view, setView] = useState('all')
  const [showInsights, setShowInsights] = useState(false)

  function perfectWeek(picks) {
    const withResults = picks.filter(a => lastResults[a] === 'W' || lastResults[a] === 'L')
    if (withResults.length === 0) return false
    return withResults.every(a => lastResults[a] === 'W')
  }

  const ranked = [...entries]
    .map(e => ({ ...e, score:calcScore(e.picks, wins), spent:calcSpent(e.picks, prices), perfect:perfectWeek(e.picks) }))
    .sort((a, b) => b.score - a.score || a.spent - b.spent)

  const displayed = view === 'top10' ? ranked.slice(0, 10) : ranked

  // ---- League Insights (aggregate, team-level — safe before reveal) ----
  function buildInsights() {
    const n = entries.length
    if (n === 0) return null

    // How many entries picked each team
    const pickCount = {}
    TEAMS.forEach(t => { pickCount[t.abbr] = 0 })
    entries.forEach(e => e.picks.forEach(a => { if (pickCount[a] != null) pickCount[a]++ }))

    const popularity = Object.entries(pickCount)
      .map(([abbr, count]) => ({ abbr, count, pct: Math.round(count / n * 100) }))
      .sort((a, b) => b.count - a.count)

    const mostPopular = popularity.filter(t => t.count > 0).slice(0, 5)
    const leastPopular = popularity.filter(t => t.count > 0).slice(-5).reverse()
    const neverPicked = popularity.filter(t => t.count === 0).map(t => t.abbr)

    // Best value so far: wins per dollar (only teams with a price and a win)
    const value = TEAMS
      .map(t => {
        const w = wins[t.abbr] || 0
        const price = prices[t.abbr] || t.price || 0
        return { abbr: t.abbr, wins: w, price, ratio: price > 0 ? w / price : 0 }
      })
      .filter(t => t.wins > 0)
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 5)

    // Projected final wins per team: extrapolate current pace over 17 games
    const GAMES = 17
    const projected = TEAMS
      .map(t => {
        const gp = played[t.abbr] || 0
        const w = wins[t.abbr] || 0
        const proj = gp > 0 ? Math.round((w / gp) * GAMES) : null
        return { abbr: t.abbr, wins: w, played: gp, proj }
      })
      .filter(t => t.proj != null)
      .sort((a, b) => b.proj - a.proj)
      .slice(0, 8)

    return { n, mostPopular, leastPopular, neverPicked, value, projected }
  }

  const insights = showInsights ? buildInsights() : null

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

      {/* Picks-hidden banner */}
      {!revealed && (
        <div style={{ background:'#1f1a0a', border:'1px solid #3f2f0a', borderRadius:10, padding:'10px 14px', marginBottom:14, color:'#fbbf24', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
          🔒 Everyone's picks are hidden until the organizer reveals them. Wins still count — you just can't see which teams others chose yet.
        </div>
      )}

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
                  <div style={{ fontWeight:800, fontSize:14, color:'#f1f5f9', display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                    {entry.player_name}
                    {entry.perfect && (
                      <span style={{
                        display:'inline-flex', alignItems:'center', gap:3,
                        background:'linear-gradient(135deg,#f59e0b,#fbbf24)', color:'#1a1206',
                        borderRadius:99, padding:'1px 9px', fontSize:10, fontWeight:900, letterSpacing:0.5,
                        boxShadow:'0 0 12px rgba(251,191,36,0.4)',
                      }}>🔥 PERFECT WEEK</span>
                    )}
                  </div>
                  <div style={{ fontSize:10, color:'#64748b', marginTop:2 }}>{entry.picks.length} picks</div>
                </div>
                <div style={{ textAlign:'right', fontFamily:'monospace', fontWeight:900, fontSize:22, color:rank===1?'#4ade80':rank<=3?'#93c5fd':'#e2e8f0' }}>{entry.score}</div>
                <div style={{ textAlign:'right', fontFamily:'monospace', fontSize:12, color:'#94a3b8' }}>${entry.spent}</div>
                <div style={{ textAlign:'right', fontFamily:'monospace', fontSize:12, color:'#64748b' }}>{cpw}</div>
                <div style={{ textAlign:'right', color:'#64748b', fontSize:10 }}>{isOpen?'▲':'▼'}</div>
              </div>

              {isOpen && (
                <div style={{ borderTop:'1px solid #111827', padding:'12px 16px', background:'#060d16' }}>
                  {!revealed ? (
                    <div style={{ color:'#64748b', fontSize:13, padding:'8px 0', display:'flex', alignItems:'center', gap:8 }}>
                      🔒 Picks are hidden until the organizer reveals them.
                    </div>
                  ) : (
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
                  )}
                  <div style={{ fontSize:11, color:'#64748b' }}>
                    {revealed
                      ? <>Budget: ${entry.spent} · Score: {entry.score} wins · {cpw !== '—' ? `$${cpw}/win` : 'No wins yet'}</>
                      : <>Score: {entry.score} wins</>}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {entries.length === 0 && (
          <div style={{ textAlign:'center', padding:'70px 0', color:'#64748b' }}>
            <div style={{ fontSize:48, marginBottom:14 }}>📋</div>
            <p style={{ fontSize:15 }}>No entries yet. Share the join code to get players picking!</p>
          </div>
        )}
      </div>

      {/* ---- League Insights (collapsible) ---- */}
      {entries.length > 0 && (
        <div style={{ marginTop:20 }}>
          <button onClick={() => setShowInsights(s => !s)} style={{
            width:'100%', background:'#0a0f18', border:'1px solid #1a2332', borderRadius:10,
            padding:'13px 16px', cursor:'pointer', color:'#f1f5f9', fontWeight:800, fontSize:14,
            display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'inherit',
          }}>
            <span>📊 League Insights</span>
            <span style={{ color:'#64748b', fontSize:12 }}>{showInsights ? '▲ Hide' : '▼ Show'}</span>
          </button>

          {insights && (
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:12 }}>
              {/* Most popular */}
              <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'16px 18px' }}>
                <div style={{ fontSize:12, color:'#4ade80', fontWeight:800, letterSpacing:1, marginBottom:12 }}>🔥 MOST POPULAR PICKS</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {insights.mostPopular.map(t => (
                    <div key={t.abbr} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontFamily:'monospace', fontWeight:800, color:'#e2e8f0', width:44 }}>{t.abbr}</span>
                      <div style={{ flex:1, background:'#0c1421', borderRadius:99, height:16, overflow:'hidden' }}>
                        <div style={{ width:`${t.pct}%`, height:'100%', background:'linear-gradient(90deg,#16a34a,#4ade80)', borderRadius:99 }} />
                      </div>
                      <span style={{ fontFamily:'monospace', fontSize:12, color:'#94a3b8', width:70, textAlign:'right' }}>{t.count} ({t.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Least popular */}
              <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'16px 18px' }}>
                <div style={{ fontSize:12, color:'#93c5fd', fontWeight:800, letterSpacing:1, marginBottom:12 }}>🧊 LEAST POPULAR (but picked)</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {insights.leastPopular.map(t => (
                    <span key={t.abbr} style={{ fontFamily:'monospace', fontWeight:700, fontSize:12, color:'#94a3b8', background:'#0c1421', border:'1px solid #1a2332', borderRadius:5, padding:'3px 9px' }}>
                      {t.abbr} · {t.count}
                    </span>
                  ))}
                </div>
              </div>

              {/* Best value */}
              <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'16px 18px' }}>
                <div style={{ fontSize:12, color:'#fbbf24', fontWeight:800, letterSpacing:1, marginBottom:12 }}>💎 BEST VALUE SO FAR</div>
                {insights.value.length === 0 ? (
                  <div style={{ color:'#64748b', fontSize:13 }}>No wins yet — check back after games are played.</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {insights.value.map(t => (
                      <div key={t.abbr} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                        <span style={{ fontFamily:'monospace', fontWeight:800, color:'#e2e8f0' }}>{t.abbr}</span>
                        <span style={{ color:'#94a3b8' }}>{t.wins}W at ${t.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Projected wins */}
              <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'16px 18px' }}>
                <div style={{ fontSize:12, color:'#4ade80', fontWeight:800, letterSpacing:1, marginBottom:4 }}>📈 PROJECTED FINAL WINS</div>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:12 }}>Based on current pace over a 17-game season</div>
                {insights.projected.length === 0 ? (
                  <div style={{ color:'#64748b', fontSize:13 }}>No games played yet.</div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {insights.projected.map(t => (
                      <div key={t.abbr} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                        <span style={{ fontFamily:'monospace', fontWeight:800, color:'#e2e8f0' }}>{t.abbr}</span>
                        <span style={{ color:'#94a3b8' }}>~{t.proj} wins <span style={{ color:'#64748b' }}>({t.wins}W in {t.played})</span></span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nobody picked */}
              {insights.neverPicked.length > 0 && (
                <div style={{ background:'#1a0505', border:'1px solid #450a0a', borderRadius:12, padding:'16px 18px' }}>
                  <div style={{ fontSize:12, color:'#f87171', fontWeight:800, letterSpacing:1, marginBottom:8 }}>❄️ NOBODY PICKED</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {insights.neverPicked.map(abbr => (
                      <span key={abbr} style={{ fontFamily:'monospace', fontWeight:700, fontSize:12, color:'#94a3b8', background:'#0c1421', border:'1px solid #1a2332', borderRadius:5, padding:'3px 9px' }}>{abbr}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}