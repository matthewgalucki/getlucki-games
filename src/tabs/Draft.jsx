import { useState } from 'react'
import { TEAMS, calcSpent, priceColor } from '../data.js'

export default function DraftTab({ league, entries, prices, played = {}, onSubmit, onToast }) {
  const [realName, setRealName] = useState('')   // required, primary/default display
  const [screenName, setScreenName] = useState('') // optional, overrides display if set
  const [email, setEmail]       = useState('')   // required, private
  const [cell, setCell]         = useState('')   // optional, private
  const [picks, setPicks]       = useState([])
  const [done, setDone]         = useState(false)
  const [search, setSearch]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  const budget    = league.budget    || 120
  const picksMin  = league.picks_min || 6
  const picksMax  = league.picks_max || 7
  const spent     = calcSpent(picks, prices)
  const remaining = budget - spent

  // What shows on the public leaderboard: screen name if given, else real name.
  const displayName = screenName.trim() || realName.trim()

  function isLocked(abbr) {
    return (played[abbr] || 0) > 0
  }

  function toggle(abbr) {
    if (picks.includes(abbr)) { setPicks(picks.filter(p => p !== abbr)); return }
    if (isLocked(abbr)) return
    const price = prices[abbr] || 0
    if (spent + price > budget)  return
    if (picks.length >= picksMax)  return
    setPicks([...picks, abbr])
  }

  function validEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
  }

  async function submit() {
    if (!realName.trim())          return setError('Enter your name.')
    if (!email.trim())             return setError('Enter your email.')
    if (!validEmail(email))        return setError('Enter a valid email address.')
    if (picks.length < picksMin)   return setError(`Pick at least ${picksMin} teams.`)
    if (remaining < 0)             return setError('You are over budget.')
    const lockedPick = picks.find(a => isLocked(a))
    if (lockedPick)                return setError(`${lockedPick} has already played and can no longer be picked. Remove it to continue.`)
    const dupe = entries.find(e => e.player_name.toLowerCase() === displayName.toLowerCase())
    if (dupe)                      return setError('That name is already taken in this league. Add a screen name to stand out.')

    setSubmitting(true); setError('')
    const err = await onSubmit({
      player_name: displayName,          // public display (screen name or real name)
      real_name: realName.trim(),        // always stored privately
      email: email.trim(),
      cell: cell.trim() || null,
    }, picks)
    if (err) { setError(err); setSubmitting(false); return }
    onToast('Picks locked in! 🎉')
    setDone(true)
    setSubmitting(false)
  }

  const filtered = TEAMS
    .map(t => ({ ...t, price: prices[t.abbr] ?? t.price }))
    .filter(t =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.abbr.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.price - a.price)

  if (done) return (
    <div style={{ textAlign:'center', padding:'70px 20px' }}>
      <div style={{ fontSize:72, marginBottom:20 }}>🎉</div>
      <h2 style={{ color:'#4ade80', fontWeight:900, marginBottom:10, fontSize:26 }}>You're in!</h2>
      <p style={{ color:'#64748b', marginBottom:24 }}>Check the Leaderboard once the season kicks off.</p>
      <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:8, marginBottom:28 }}>
        {picks.map(a => {
          const price = prices[a] || 0
          return (
            <span key={a} style={{ background:'#0c1421', border:'1px solid #16a34a', borderRadius:8, padding:'6px 14px', fontFamily:'monospace', fontWeight:700, fontSize:13, color:'#4ade80' }}>
              {a} <span style={{ color:priceColor(price) }}>${price}</span>
            </span>
          )
        })}
      </div>
      <button onClick={() => { setDone(false); setRealName(''); setScreenName(''); setEmail(''); setCell(''); setPicks([]) }}
        style={{ background:'#0c1421', border:'1px solid #1a2332', color:'#64748b', padding:'8px 22px', borderRadius:99, cursor:'pointer', fontWeight:700, fontFamily:'inherit' }}>
        Submit another entry
      </button>
    </div>
  )

  return (
    <div>
      <h2 style={{ color:'#f1f5f9', fontSize:22, fontWeight:900, marginBottom:6 }}>📝 Draft Your Teams</h2>
      <p style={{ color:'#94a3b8', fontSize:13, marginBottom:8 }}>
        Pick {picksMin}–{picksMax} teams within your ${budget} budget. Lower cost = bigger upset potential.
      </p>
      <p style={{ color:'#fbbf24', fontSize:12, marginBottom:22, background:'#1f1a0a', border:'1px solid #3f2f0a', borderRadius:8, padding:'8px 12px' }}>
        🔒 Once a team plays its first game of the season, it locks and can no longer be picked.
      </p>

      {league.collect_payment && (
        <p style={{ color:'#4ade80', fontSize:13, marginBottom:22, background:'#0d2818', border:'1px solid #16a34a', borderRadius:8, padding:'10px 14px' }}>
          💵 Entry fee{league.entry_fee ? <>: <strong>${league.entry_fee}</strong></> : ''}{league.payment_note ? <> · Pay via {league.payment_note}</> : ''}. Your entry is confirmed once the organizer marks you paid.
        </p>
      )}

      {/* Player info */}
      <div style={{ marginBottom:18 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:1, marginBottom:5 }}>
              YOUR NAME <span style={{ color:'#f87171' }}>*</span>
            </label>
            <input value={realName} onChange={e => setRealName(e.target.value)} placeholder="First & last name"
              style={{ width:'100%', background:'#0c1421', border:'1px solid #1a2332', borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
            />
          </div>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:1, marginBottom:5 }}>
              EMAIL <span style={{ color:'#f87171' }}>*</span>
            </label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@email.com"
              style={{ width:'100%', background:'#0c1421', border:'1px solid #1a2332', borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
            />
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:1, marginBottom:5 }}>
              SCREEN NAME <span style={{ color:'#64748b', fontWeight:400 }}>(optional)</span>
            </label>
            <input value={screenName} onChange={e => setScreenName(e.target.value)} placeholder="Leave blank to use your name"
              style={{ width:'100%', background:'#0c1421', border:'1px solid #1a2332', borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
            />
          </div>
          <div>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:1, marginBottom:5 }}>
              CELL <span style={{ color:'#64748b', fontWeight:400 }}>(optional)</span>
            </label>
            <input value={cell} onChange={e => setCell(e.target.value)} type="tel" placeholder="(555) 123-4567"
              style={{ width:'100%', background:'#0c1421', border:'1px solid #1a2332', borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
            />
          </div>
        </div>
        <p style={{ fontSize:11, color:'#64748b', marginTop:8 }}>
          🔒 The leaderboard will show <strong style={{ color:'#94a3b8' }}>{displayName || 'your name'}</strong>. Add a screen name if you'd rather not show your real name publicly. Email and cell stay private — used only to reach you if you win.
        </p>
      </div>

      {/* Budget bar */}
      <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'14px 18px', marginBottom:16, display:'flex', gap:28, alignItems:'center', flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:10, color:'#64748b', fontWeight:700, letterSpacing:1 }}>BUDGET LEFT</div>
          <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:30, color:remaining<0?'#ef4444':remaining<15?'#fbbf24':'#4ade80', lineHeight:1.1 }}>${remaining}</div>
        </div>
        <div>
          <div style={{ fontSize:10, color:'#64748b', fontWeight:700, letterSpacing:1 }}>PICKS</div>
          <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:30, color:'#f1f5f9', lineHeight:1.1 }}>{picks.length}<span style={{ fontSize:15, color:'#64748b' }}>/{picksMax}</span></div>
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
          <div style={{ fontSize:11, color:'#64748b', marginTop:4 }}>${budget-remaining} of ${budget} spent</div>
        </div>
      </div>

      {/* Selected picks */}
      {picks.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
          {picks.map(abbr => (
            <button key={abbr} onClick={() => toggle(abbr)} style={{
              background:'#14532d', border:'1px solid #16a34a', borderRadius:99,
              padding:'5px 12px', color:'#4ade80', cursor:'pointer', fontSize:12, fontWeight:700,
              fontFamily:'inherit', display:'flex', alignItems:'center', gap:6,
            }}>
              {abbr} <span style={{ color:'#86efac' }}>${prices[abbr]||0}</span> ✕
            </button>
          ))}
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
          const locked = isLocked(team.abbr)
          const dis = !sel && (locked || spent + team.price > budget || picks.length >= picksMax)
          return (
            <button key={team.abbr} onClick={() => !dis && toggle(team.abbr)} style={{
              background:sel?'#14532d':dis?'#07090e':'#0a0f18',
              border:`1px solid ${sel?'#16a34a':locked?'#3f1d1d':'#111827'}`,
              borderRadius:10, padding:'11px 14px', cursor:dis?'not-allowed':'pointer',
              textAlign:'left', opacity:dis?(locked?0.5:0.3):1, transition:'all 0.1s',
              fontFamily:'inherit', position:'relative',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                <span style={{ fontWeight:800, fontSize:13, color:sel?'#4ade80':'#e2e8f0', fontFamily:'monospace' }}>{team.abbr}</span>
                <span style={{ fontWeight:900, fontSize:15, fontFamily:'monospace', color:priceColor(team.price) }}>${team.price}</span>
              </div>
              <div style={{ fontSize:11, color:sel?'#86efac':'#94a3b8', lineHeight:1.3 }}>{team.name}</div>
              {locked && (
                <div style={{ fontSize:10, color:'#f87171', fontWeight:700, marginTop:4 }}>🔒 Already played</div>
              )}
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
          color:(picks.length>=picksMin && remaining>=0 && !submitting)?'#fff':'#64748b',
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
