import { useState } from 'react'
import { TEAMS, calcSpent, priceColor } from '../data.js'

export default function DraftTab({ league, entries, onSubmit, onToast }) {
  const [name, setName]         = useState('')
  const [picks, setPicks]       = useState([])
  const [done, setDone]         = useState(false)
  const [search, setSearch]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  const budget    = league.budget    || 120
  const picksMin  = league.picks_min || 6
  const picksMax  = league.picks_max || 7
  const spent     = calcSpent(picks)
  const remaining = budget - spent

  function toggle(abbr) {
    if (picks.includes(abbr)) { setPicks(picks.filter(p => p !== abbr)); return }
    const t = TEAMS.find(x => x.abbr === abbr)
    if (spent + t.price > budget)  return
    if (picks.length >= picksMax)  return
    setPicks([...picks, abbr])
  }

  async function submit() {
    if (!name.trim())              return setError('Enter your name.')
    if (picks.length < picksMin)   return setError(`Pick at least ${picksMin} teams.`)
    if (remaining < 0)             return setError('You are over budget.')
    const dupe = entries.find(e => e.player_name.toLowerCase() === name.trim().toLowerCase())
    if (dupe)                      return setError('That name is already in this league.')

    setSubmitting(true); setError('')
    const err = await onSubmit(name.trim(), picks)
    if (err) { setError(err); setSubmitting(false); return }
    onToast('Picks locked in! 🎉')
    setDone(true)
    setSubmitting(false)
  }

  const filtered = TEAMS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.abbr.toLowerCase().includes(search.toLowerCase())
  )

  if (done) return (
    <div style={{ textAlign:'center', padding:'70px 20px' }}>
      <div style={{ fontSize:72, marginBottom:20 }}>🎉</div>
      <h2 style={{ color:'#4ade80', fontWeight:900, marginBottom:10, fontSize:26 }}>You're in!</h2>
      <p style={{ color:'#64748b', marginBottom:24 }}>Check the Leaderboard once the season kicks off.</p>
      <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:8, marginBottom:28 }}>
        {picks.map(a => {
          const t = TEAMS.find(x => x.abbr === a)
          return (
            <span key={a} style={{ background:'#0c1421', border:'1px solid #16a34a', borderRadius:8, padding:'6px 14px', fontFamily:'monospace', fontWeight:700, fontSize:13, color:'#4ade80' }}>
              {a} <span style={{ color:priceColor(t?.price||0) }}>${t?.price}</span>
            </span>
          )
        })}
      </div>
      <button onClick={() => { setDone(false); setName(''); setPicks([]) }}
        style={{ background:'#0c1421', border:'1px solid #1a2332', color:'#64748b', padding:'8px 22px', borderRadius:99, cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}>
        Submit another entry
      </button>
    </div>
  )

  return (
    <div>
      <h2 style={{ color:'#f1f5f9', fontSize:22, fontWeight:900, marginBottom:6 }}>📝 Draft Your Teams</h2>
      <p style={{ color:'#475569', fontSize:13, marginBottom:22 }}>
        Pick {picksMin}–{picksMax} teams within your ${budget} budget. Lower cost = bigger upset potential.
      </p>

      {/* Name input */}
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
        style={{ width:'100%', background:'#0c1421', border:'1px solid #1a2332', borderRadius:10, padding:'12px 16px', color:'#f1f5f9', fontSize:15, outline:'none', boxSizing:'border-box', marginBottom:16, fontFamily:'inherit' }}
      />

      {/* Budget bar */}
      <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'14px 18px', marginBottom:16, display:'flex', gap:28, alignItems:'center', flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:10, color:'#334155', fontWeight:700, letterSpacing:1 }}>BUDGET LEFT</div>
          <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:30, color:remaining<0?'#ef4444':remaining<15?'#fbbf24':'#4ade80', lineHeight:1.1 }}>${remaining}</div>
        </div>
        <div>
          <div style={{ fontSize:10, color:'#334155', fontWeight:700, letterSpacing:1 }}>PICKS</div>
          <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:30, color:'#f1f5f9', lineHeight:1.1 }}>{picks.length}<span style={{ fontSize:15, color:'#334155' }}>/{picksMax}</span></div>
        </div>
        <div style={{ flex:1, minWidth:120 }}>
          <div style={{ background:'#1a2332', borderRadius:99, height:7, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:99,
              background:remaining<0?'#ef4444':'#16a34a',
              width:`${Math.min(100, ((budget-remaining)/budget)*100)}%`,
              transition:'width 0.25s',
            }} />
          </div>
          <div style={{ fontSize:11, color:'#334155', marginTop:4 }}>${budget-remaining} of ${budget} spent</div>
        </div>
      </div>

      {/* Selected picks */}
      {picks.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
          {picks.map(abbr => {
            const t = TEAMS.find(x => x.abbr === abbr)
            return (
              <button key={abbr} onClick={() => toggle(abbr)} style={{
                background:'#14532d', border:'1px solid #16a34a', borderRadius:99,
                padding:'5px 12px', color:'#4ade80', cursor:'pointer', fontSize:12, fontWeight:700,
                fontFamily:'inherit', display:'flex', alignItems:'center', gap:6,
              }}>
                {abbr} <span style={{ color:'#86efac' }}>${t?.price}</span> ✕
              </button>
            )
          })}
        </div>
      )}

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams…"
        style={{ width:'100%', background:'#0a0f18', border:'1px solid #111827', borderRadius:9, padding:'9px 14px', color:'#f1f5f9', fontSize:13, outline:'none', boxSizing:'border-box', marginBottom:12, fontFamily:'inherit' }}
      />

      {/* Team grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(168px,1fr))', gap:7, marginBottom:20 }}>
        {filtered.map(team => {
          const sel = picks.includes(team.abbr)
          const dis = !sel && (spent + team.price > budget || picks.length >= picksMax)
          return (
            <button key={team.abbr} onClick={() => !dis && toggle(team.abbr)} style={{
              background:sel?'#14532d':dis?'#07090e':'#0a0f18',
              border:`1px solid ${sel?'#16a34a':'#111827'}`,
              borderRadius:10, padding:'11px 14px', cursor:dis?'not-allowed':'pointer',
              textAlign:'left', opacity:dis?0.3:1, transition:'all 0.1s',
              fontFamily:'inherit',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                <span style={{ fontWeight:800, fontSize:13, color:sel?'#4ade80':'#e2e8f0', fontFamily:'monospace' }}>{team.abbr}</span>
                <span style={{ fontWeight:900, fontSize:15, fontFamily:'monospace', color:priceColor(team.price) }}>${team.price}</span>
              </div>
              <div style={{ fontSize:11, color:sel?'#86efac':'#334155', lineHeight:1.3 }}>{team.name}</div>
            </button>
          )
        })}
      </div>

      {error && <p style={{ color:'#f87171', fontSize:13, marginBottom:12 }}>{error}</p>}

      <button onClick={submit} disabled={submitting || picks.length < picksMin || remaining < 0}
        style={{
          width:'100%', borderRadius:12, padding:'14px',
          fontSize:15, fontWeight:800, border:'none', fontFamily:'inherit',
          background:(picks.length>=picksMin && remaining>=0 && !submitting)?'#16a34a':'#0c1421',
          color:(picks.length>=picksMin && remaining>=0 && !submitting)?'#fff':'#334155',
          cursor:(picks.length>=picksMin && remaining>=0 && !submitting)?'pointer':'not-allowed',
          transition:'background 0.2s',
        }}>
        {submitting                  ? 'Locking in…'
         : picks.length < picksMin  ? `Pick ${picksMin - picks.length} more team${picksMin-picks.length!==1?'s':''}`
         : remaining < 0            ? 'Over budget'
         : '✅ Lock In Picks'}
      </button>
    </div>
  )
}
