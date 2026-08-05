import { useState } from 'react'
import { TEAMS, calcScore, calcSpent, priceColor } from '../data.js'
import { Btn, Card } from '../components.jsx'

export default function AdminTab({ entries, wins, prices, league, onDelete, onWinUpdate, onRefresh, refreshing, onToast }) {
  const [view, setView]       = useState('entries')
  const [winEdits, setWinEdits] = useState({})
  const [addName, setAddName] = useState('')
  const [addPicks, setAddPicks] = useState('')

  const sorted = [...entries].sort((a, b) => calcScore(b.picks, wins) - calcScore(a.picks, wins))

  function handleAddManual() {
    const p = addPicks.toUpperCase().split(',').map(x => x.trim()).filter(x => TEAMS.find(t => t.abbr === x))
    if (!addName.trim() || p.length < 1) return onToast('Enter name and valid team abbreviations')
    // Use the onSubmit from parent via a prop — we'll emit up
    // For now just show the format hint
    onToast('Use the Draft tab to add entries — or use Supabase dashboard for bulk edits')
  }

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
          {sorted.length===0 && <p style={{ color:'#64748b', textAlign:'center', padding:'40px 0' }}>No entries yet.</p>}
          {sorted.map(entry => (
            <div key={entry.id} style={{
              background:'#0a0f18', border:'1px solid #111827', borderRadius:10,
              padding:'13px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, flexWrap:'wrap',
            }}>
              <div>
                <div style={{ fontWeight:800, color:'#e2e8f0', fontSize:14, marginBottom:4 }}>{entry.player_name}</div>
                {/* Private contact info — organizer only */}
                <div style={{ fontSize:11, color:'#64748b', marginBottom:8, display:'flex', flexWrap:'wrap', gap:'2px 12px' }}>
                  {entry.email && <span>✉️ {entry.email}</span>}
                  {entry.real_name && <span>👤 {entry.real_name}</span>}
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
              <button
                onClick={() => { if(window.confirm(`Remove ${entry.player_name}?`)) onDelete(entry.id) }}
                style={{ background:'#1a0505', border:'1px solid #450a0a', borderRadius:7, color:'#f87171', padding:'6px 14px', cursor:'pointer', fontSize:12, fontWeight:700, whiteSpace:'nowrap', fontFamily:'inherit' }}>
                Remove
              </button>
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
