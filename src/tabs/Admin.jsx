import { useState } from 'react'
import { TEAMS, calcScore, calcSpent, priceColor } from '../data.js'
import { Btn, Card } from '../components.jsx'

export default function AdminTab({ entries, wins, prices, league, onDelete, onTogglePaid, onToggleReveal, onWinUpdate, onRefresh, refreshing, onToast }) {
  const [view, setView]       = useState('entries')
  const [winEdits, setWinEdits] = useState({})

  const sorted = [...entries].sort((a, b) => calcScore(b.picks, wins) - calcScore(a.picks, wins))

  // Trigger a file download in the browser
  function downloadFile(filename, text, type = 'text/csv') {
    const blob = new Blob([text], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // CSV-escape a cell (wrap in quotes if it contains comma/quote/newline)
  function csvCell(val) {
    const s = String(val ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }

  const leagueSlug = (league.name || 'league').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  // Roster export — contact info for email communications
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

  // Standings export — current ranked results
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

  // Copy just the email list (comma-separated) for pasting into an email client
  function copyEmails() {
    const emails = sorted.map(e => e.email).filter(Boolean).join(', ')
    if (!emails) return onToast('No emails on file yet')
    navigator.clipboard.writeText(emails).then(() => onToast('Email list copied ✓'))
  }

  const revealed = !!league.picks_revealed

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h2 style={{ color:'#f1f5f9', fontSize:22, fontWeight:900 }}>⚙️ Admin Panel</h2>
        <div style={{ display:'flex', background:'#0a0f18', borderRadius:8, overflow:'hidden', border:'1px solid #111827' }}>
          {['entries','wins'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              background:v===view?'#16a34a':'transparent', color:v===view?'#fff':'#64748b',
              border:'none', padding:'8px 16px', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit',
            }}>{v==='entries'?`Entries (${entries.length})`:'Win Overrides'}</button>
          ))}
        </div>
      </div>

      {view==='entries' && (
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {/* Reveal picks control */}
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

          {/* Export toolbar */}
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
                {/* Private contact info — organizer only */}
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