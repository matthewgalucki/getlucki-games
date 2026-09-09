import { useState } from 'react'
import { TEAMS, calcScore, calcSpent, priceColor } from '../data.js'
import { Btn, Card } from '../components.jsx'

export default function AdminTab({ entries, wins, prices, league, onDelete, onTogglePaid, onToggleReveal, onWinUpdate, onRefresh, refreshing, onToast }) {
  const [view, setView]       = useState('entries')
  const [winEdits, setWinEdits] = useState({})

  const sorted = [...entries].sort((a, b) => calcScore(b.picks, wins) - calcScore(a.picks, wins))

  function downloadFile(filename, text, type = 'text/csv') {
    const blob = new Blob([text], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function csvCell(val) {
    const s = String(val ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  const leagueSlug = (league.name || 'league').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  function exportRoster() {
    const headers = ['Display Name', 'Real Name', 'Email', 'Cell', 'Paid', 'Teams', 'Budget Spent']
    const rows = sorted.map(e => [
      e.player_name,
      e.real_name || '',
      e.email || '',
      e.cell || '',
      league.collect_payment ? (e.paid ? 'Yes' : 'No') : '',
      e.picks.join(' / '),
      '$' + calcSpent(e.picks, prices),
    ])
    const csv = [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\n')
    downloadFile(`${leagueSlug}-roster.csv`, csv)
    onToast('Roster exported ✓')
  }

  function exportStandings() {
    const headers = ['Rank', 'Player', 'Wins', 'Budget Spent', 'Cost Per Win', 'Teams']
    const rows = sorted.map((e, i) => {
      const score = calcScore(e.picks, wins)
      const spent = calcSpent(e.picks, prices)
      return [
        i + 1,
        e.player_name,
        score,
        '$' + spent,
        score > 0 ? '$' + (spent / score).toFixed(1) : '—',
        e.picks.join(' / '),
      ]
    })
    const csv = [headers, ...rows].map(r => r.map(csvCell).join(',')).join('\n')
    downloadFile(`${leagueSlug}-standings.csv`, csv)
    onToast('Standings exported ✓')
  }

  function copyEmails() {
    const emails = sorted.map(e => e.email).filter(Boolean).join(', ')
    if (!emails) return onToast('No emails on file yet')
    navigator.clipboard.writeText(emails).then(() => onToast('Email list copied ✓'))
  }

  const revealed = !!league.picks_revealed

  function buildInsights() {
    const n = entries.length
    if (n === 0) return null

    const pickCount = {}
    TEAMS.forEach(t => { pickCount[t.abbr] = 0 })
    entries.forEach(e => e.picks.forEach(a => { if (pickCount[a] != null) pickCount[a]++ }))

    const ranked = Object.entries(pickCount)
      .map(([abbr, count]) => ({ abbr, count, pct: Math.round(count / n * 100) }))
      .sort((a, b) => b.count - a.count)

    const mostPopular = ranked.filter(t => t.count > 0).slice(0, 5)
    const neverPicked = ranked.filter(t => t.count === 0).map(t => t.abbr)

    const spends = entries.map(e => calcSpent(e.picks, prices))
    const avgSpend = Math.round(spends.reduce((s, x) => s + x, 0) / n)
    const maxSpend = Math.max(...spends)
    const minSpend = Math.min(...spends)
    const biggestSpender = entries[spends.indexOf(maxSpend)]
    const thriftiest = entries[spends.indexOf(minSpend)]

    const sizeCount = {}
    entries.forEach(e => { sizeCount[e.picks.length] = (sizeCount[e.picks.length] || 0) + 1 })

    const rosterMap = {}
    entries.forEach(e => {
      const key = [...e.picks].sort().join(',')
      if (!rosterMap[key]) rosterMap[key] = []
      rosterMap[key].push(e.player_name)
    })
    const duplicates = Object.values(rosterMap).filter(names => names.length > 1)

    const withAvg = entries.map(e => ({
      name: e.player_name,
      avg: e.picks.length ? calcSpent(e.picks, prices) / e.picks.length : 0,
    }))
    const chalkiest = [...withAvg].sort((a, b) => b.avg - a.avg)[0]
    const contrarian = [...withAvg].sort((a, b) => a.avg - b.avg)[0]

    return { n, mostPopular, neverPicked, avgSpend, maxSpend, minSpend, biggestSpender, thriftiest, sizeCount, duplicates, chalkiest, contrarian }
  }

  const insights = view === 'insights' ? buildInsights() : null

  function copyInsightsText() {
    const ins = buildInsights()
    if (!ins) return onToast('No entries yet')
    const lines = []
    lines.push(`${league.name} — League Insights`)
    lines.push(`${ins.n} entries in the pool\n`)
    lines.push(`MOST POPULAR PICKS:`)
    ins.mostPopular.forEach(t => lines.push(`  ${t.abbr} — picked by ${t.count} (${t.pct}%)`))
    if (ins.neverPicked.length) lines.push(`\nNOBODY PICKED: ${ins.neverPicked.join(', ')}`)
    lines.push(`\nAverage spend: $${ins.avgSpend} of $${league.budget || 120}`)
    lines.push(`Biggest spender: ${ins.biggestSpender.player_name} ($${ins.maxSpend})`)
    lines.push(`Most left on the table: ${ins.thriftiest.player_name} ($${(league.budget || 120) - ins.minSpend} unspent)`)
    lines.push(`Chalkiest roster: ${ins.chalkiest.name}`)
    lines.push(`Most contrarian: ${ins.contrarian.name}`)
    if (ins.duplicates.length) {
      lines.push(`\nIDENTICAL ROSTERS:`)
      ins.duplicates.forEach(names => lines.push(`  ${names.join(' & ')} picked the exact same teams`))
    }
    navigator.clipboard.writeText(lines.join('\n')).then(() => onToast('Insights copied — paste into your email ✓'))
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:10 }}>
        <h2 style={{ color:'#f1f5f9', fontSize:22, fontWeight:900 }}>⚙️ Admin Panel</h2>
        <div style={{ display:'flex', background:'#0a0f18', borderRadius:8, overflow:'hidden', border:'1px solid #111827' }}>
          {['entries','insights','wins'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              background:v===view?'#16a34a':'transparent', color:v===view?'#fff':'#64748b',
              border:'none', padding:'8px 16px', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit',
            }}>{v==='entries'?`Entries (${entries.length})`:v==='insights'?'📊 Insights':'Win Overrides'}</button>
          ))}
        </div>
      </div>

      {view==='entries' && (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center', gap:14, flexWrap:'wrap',
            marginBottom:10, padding:'14px 18px',
            background: revealed ? '#0d2818' : '#1f1a0a',
            border: `1px solid ${revealed ? '#16a34a' : '#3f2f0a'}`, borderRadius:10,
          }}>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color: revealed ? '#4ade80' : '#fbbf24', marginBottom:2 }}>
                {revealed ? '👁️ Picks are visible to everyone' : '🔒 Picks are hidden'}
              </div>
              <div style={{ fontSize:12, color:'#94a3b8', maxWidth:420 }}>
                {revealed
                  ? 'All players can see which teams everyone picked. Turn off to hide them again.'
                  : "Players see names and win totals, but not which teams others chose. Reveal once everyone's locked in (e.g. at kickoff)."}
              </div>
            </div>
            <button
              onClick={onToggleReveal}
              style={{
                background: revealed ? '#1a0505' : '#16a34a',
                border: `1px solid ${revealed ? '#450a0a' : '#16a34a'}`,
                borderRadius:9, color:'#fff', padding:'10px 18px', cursor:'pointer',
                fontSize:13, fontWeight:800, whiteSpace:'nowrap', fontFamily:'inherit',
              }}>
              {revealed ? 'Hide picks again' : '👁️ Reveal all picks'}
            </button>
          </div>

          {entries.length > 0 && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10, padding:'12px 14px', background:'#0a0f18', border:'1px solid #111827', borderRadius:10 }}>
              <span style={{ fontSize:11, color:'#64748b', fontWeight:700, letterSpacing:1, alignSelf:'center', marginRight:4 }}>EXPORT:</span>
              <button onClick={exportRoster} style={{ background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:8, color:'#4ade80', padding:'7px 14px', cursor:'pointer', fontWeight:700, fontSize:12, fontFamily:'inherit' }}>
                📋 Roster (CSV)
              </button>
              <button onClick={exportStandings} style={{ background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:8, color:'#4ade80', padding:'7px 14px', cursor:'pointer', fontWeight:700, fontSize:12, fontFamily:'inherit' }}>
                🏆 Standings (CSV)
              </button>
              <button onClick={copyEmails} style={{ background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:8, color:'#94a3b8', padding:'7px 14px', cursor:'pointer', fontWeight:700, fontSize:12, fontFamily:'inherit' }}>
                ✉️ Copy Email List
              </button>
            </div>
          )}
          {league.collect_payment && entries.length > 0 && (() => {
            const paidCount = entries.filter(e => e.paid).length
            const fee = parseFloat(league.entry_fee) || 0
            const collected = paidCount * fee
            const total = entries.length * fee
            return (
              <div style={{ background:'#0d2818', border:'1px solid #16a34a', borderRadius:10, padding:'14px 18px', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                <div>
                  <div style={{ fontSize:12, color:'#4ade80', fontWeight:700, letterSpacing:1, marginBottom:2 }}>💵 PAYMENTS</div>
                  <div style={{ fontSize:13, color:'#86efac' }}>
                    {paidCount} of {entries.length} paid{fee > 0 && <> · <strong>${collected}</strong> of ${total} collected</>}
                  </div>
                  {league.payment_note && <div style={{ fontSize:12, color:'#64748b', marginTop:3 }}>Pay via: {league.payment_note}</div>}
                </div>
                <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:24, color:'#4ade80' }}>
                  {entries.length ? Math.round(paidCount/entries.length*100) : 0}%
                </div>
              </div>
            )
          })()}
          {sorted.length===0 && <p style={{ color:'#64748b', textAlign:'center', padding:'40px 0' }}>No entries yet.</p>}
          {sorted.map(entry => (
            <div key={entry.id} style={{
              background:'#0a0f18', border:'1px solid #111827', borderRadius:10,
              padding:'13px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap',
            }}>
              <div>
                <div style={{ fontWeight:800, color:'#e2e8f0', fontSize:14, marginBottom:4 }}>
                  {entry.player_name}
                  {entry.real_name && entry.real_name !== entry.player_name && (
                    <span style={{ fontSize:11, color:'#64748b', fontWeight:400, marginLeft:8 }}>(aka {entry.real_name})</span>
                  )}
                </div>
                <div style={{ fontSize:11, color:'#64748b', marginBottom:8, display:'flex', flexWrap:'wrap', gap:'2px 12px' }}>
                  {entry.email && <span>✉️ {entry.email}</span>}
                  {entry.cell && <span>📱 {entry.cell}</span>}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {entry.picks.map(abbr => {
                    const price = prices[abbr] || 0
                    const w = wins[abbr] || 0
                    return (
                      <span key={abbr} style={{ background:'#0c1421', border:'1px solid #1a2332', borderRadius:5, padding:'2px 8px', fontFamily:'monospace', fontSize:11, fontWeight:700 }}>
                        <span style={{ color:'#94a3b8' }}>{abbr}</span>
                        {' '}<span style={{ color:priceColor(price) }}>${price}</span>
                        {' '}<span style={{ color:w>0?'#4ade80':'#64748b' }}>{w}W</span>
                      </span>
                    )
                  })}
                </div>
                <div style={{ fontSize:11, color:'#64748b', marginTop:6 }}>
                  ${calcSpent(entry.picks, prices)} spent · {calcScore(entry.picks, wins)} wins
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
                {league.collect_payment && (
                  <button
                    onClick={() => onTogglePaid(entry.id, !entry.paid)}
                    style={{
                      background: entry.paid ? '#14532d' : '#1f1a0a',
                      border: `1px solid ${entry.paid ? '#16a34a' : '#3f2f0a'}`,
                      borderRadius:7, color: entry.paid ? '#4ade80' : '#fbbf24',
                      padding:'6px 14px', cursor:'pointer', fontSize:12, fontWeight:700, whiteSpace:'nowrap', fontFamily:'inherit',
                    }}>
                    {entry.paid ? '✓ Paid' : 'Mark paid'}
                  </button>
                )}
                <button
                  onClick={() => { if(window.confirm(`Remove ${entry.player_name}?`)) onDelete(entry.id) }}
                  style={{ background:'#1a0505', border:'1px solid #450a0a', borderRadius:7, color:'#f87171', padding:'6px 14px', cursor:'pointer', fontSize:12, fontWeight:700, whiteSpace:'nowrap', fontFamily:'inherit' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view==='insights' && (
        <div>
          {!insights ? (
            <p style={{ color:'#64748b', textAlign:'center', padding:'40px 0' }}>No entries yet — insights appear once players join.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                <p style={{ color:'#94a3b8', fontSize:13 }}>Fun stats across all {insights.n} entries — great for a league email.</p>
                <button onClick={copyInsightsText} style={{ background:'#16a34a', border:'none', borderRadius:8, color:'#fff', padding:'8px 16px', cursor:'pointer', fontWeight:700, fontSize:12, fontFamily:'inherit' }}>
                  📋 Copy for email
                </button>
              </div>

              <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'16px 18px' }}>
                <div style={{ fontSize:12, color:'#4ade80', fontWeight:800, letterSpacing:1, marginBottom:12 }}>🔥 MOST POPULAR PICKS</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {insights.mostPopular.map(t => (
                    <div key={t.abbr} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontFamily:'monospace', fontWeight:800, color:'#e2e8f0', width:44 }}>{t.abbr}</span>
                      <div style={{ flex:1, background:'#0c1421', borderRadius:99, height:18, overflow:'hidden' }}>
                        <div style={{ width:`${t.pct}%`, height:'100%', background:'linear-gradient(90deg,#16a34a,#4ade80)', borderRadius:99 }} />
                      </div>
                      <span style={{ fontFamily:'monospace', fontSize:12, color:'#94a3b8', width:70, textAlign:'right' }}>{t.count} ({t.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>

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

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:10 }}>
                <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:11, color:'#64748b', fontWeight:700, letterSpacing:1, marginBottom:4 }}>AVERAGE SPEND</div>
                  <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:22, color:'#f1f5f9' }}>${insights.avgSpend}<span style={{ fontSize:13, color:'#64748b' }}>/${league.budget || 120}</span></div>
                </div>
                <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:11, color:'#64748b', fontWeight:700, letterSpacing:1, marginBottom:4 }}>💸 BIGGEST SPENDER</div>
                  <div style={{ fontWeight:800, fontSize:15, color:'#e2e8f0' }}>{insights.biggestSpender.player_name}</div>
                  <div style={{ fontSize:12, color:'#94a3b8' }}>${insights.maxSpend} spent</div>
                </div>
                <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:11, color:'#64748b', fontWeight:700, letterSpacing:1, marginBottom:4 }}>🪙 CHALKIEST</div>
                  <div style={{ fontWeight:800, fontSize:15, color:'#e2e8f0' }}>{insights.chalkiest.name}</div>
                  <div style={{ fontSize:12, color:'#94a3b8' }}>Loves the favorites</div>
                </div>
                <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:11, color:'#64748b', fontWeight:700, letterSpacing:1, marginBottom:4 }}>🎲 MOST CONTRARIAN</div>
                  <div style={{ fontWeight:800, fontSize:15, color:'#e2e8f0' }}>{insights.contrarian.name}</div>
                  <div style={{ fontSize:12, color:'#94a3b8' }}>Sleeper hunter</div>
                </div>
              </div>

              {insights.duplicates.length > 0 && (
                <div style={{ background:'#0c1825', border:'1px solid #1e3a5f', borderRadius:12, padding:'16px 18px' }}>
                  <div style={{ fontSize:12, color:'#93c5fd', fontWeight:800, letterSpacing:1, marginBottom:10 }}>👯 IDENTICAL ROSTERS</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {insights.duplicates.map((names, i) => (
                      <div key={i} style={{ fontSize:13, color:'#cbd5e1' }}>
                        <strong>{names.join(' & ')}</strong> picked the exact same teams 👀
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {view==='wins' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div>
              <p style={{ color:'#64748b', fontSize:13, marginBottom:4 }}>ESPN auto-sync is the primary source. Use this to manually correct individual teams.</p>
              <p style={{ color:'#64748b', fontSize:12 }}>Changes here update wins for <strong style={{ color:'#94a3b8' }}>all leagues</strong> — wins are shared platform-wide.</p>
            </div>
            <Btn onClick={onRefresh} disabled={refreshing} size='sm'>
              {refreshing ? '⟳ Syncing…' : '⟳ ESPN Auto-Sync'}
            </Btn>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(128px,1fr))', gap:6, marginBottom:18 }}>
            {TEAMS.map(team => (
              <div key={team.abbr} style={{ display:'flex', alignItems:'center', gap:7, background:'#0a0f18', border:'1px solid #111827', borderRadius:8, padding:'8px 10px' }}>
                <span style={{ fontFamily:'monospace', fontWeight:700, color:priceColor(team.price), fontSize:11, width:34 }}>{team.abbr}</span>
                <input
                  type="number" min={0} max={17}
                  defaultValue={wins[team.abbr] || 0}
                  onChange={e => setWinEdits(p => ({ ...p, [team.abbr]: parseInt(e.target.value)||0 }))}
                  style={{ width:42, background:'#060d16', border:'1px solid #1a2332', borderRadius:5, padding:'4px 6px', color:'#f1f5f9', fontSize:13, outline:'none', fontFamily:'inherit' }}
                />
              </div>
            ))}
          </div>

          <Btn onClick={() => onWinUpdate(winEdits)}>Save Overrides</Btn>
        </div>
      )}
    </div>
  )
}