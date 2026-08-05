import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'
import { Btn, Toast } from '../components.jsx'

// Platform-owner view of every league on Getlucki Games.
// Reached at ?admin=leagues behind the master password.

const MASTER_PW = 'getlucki-master-2025'  // keep in sync with MasterAdmin.jsx

export default function AllLeagues({ onNavigate }) {
  const [auth, setAuth]       = useState(false)
  const [pw, setPw]           = useState('')
  const [pwErr, setPwErr]     = useState('')
  const [leagues, setLeagues] = useState([])
  const [counts, setCounts]   = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [sort, setSort]       = useState('newest')

  useEffect(() => {
    if (!auth) return
    (async () => {
      setLoading(true)
      const { data: leagueData } = await supabase
        .from('leagues')
        .select('*')
        .order('created_at', { ascending: false })

      // Entry counts per league
      const { data: entryData } = await supabase
        .from('entries')
        .select('league_id')

      const c = {}
      ;(entryData || []).forEach(e => { c[e.league_id] = (c[e.league_id] || 0) + 1 })

      setLeagues(leagueData || [])
      setCounts(c)
      setLoading(false)
    })()
  }, [auth])

  if (!auth) return (
    <div style={{ minHeight:'100vh', background:'#060d16', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ maxWidth:360, width:'100%', padding:24, textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🔒</div>
        <h2 style={{ color:'#f1f5f9', marginBottom:6, fontWeight:900 }}>Getlucki Admin</h2>
        <p style={{ color:'#94a3b8', fontSize:13, marginBottom:24 }}>All leagues on the platform.</p>
        <input
          type="password" value={pw} onChange={e => setPw(e.target.value)}
          placeholder="Master password"
          onKeyDown={e => e.key==='Enter' && (pw===MASTER_PW ? setAuth(true) : setPwErr('Wrong password.'))}
          style={{ width:'100%', background:'#0c1421', border:'1px solid #1a2332', borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:10, fontFamily:'inherit' }}
        />
        {pwErr && <p style={{ color:'#f87171', fontSize:13, marginBottom:10 }}>{pwErr}</p>}
        <Btn onClick={() => pw===MASTER_PW ? setAuth(true) : setPwErr('Wrong password.')} style={{ width:'100%', borderRadius:10 }}>Unlock</Btn>
        <button onClick={() => onNavigate('home')} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:13, marginTop:16, fontFamily:'inherit' }}>← Back to Getlucki Games</button>
      </div>
    </div>
  )

  const filtered = leagues
    .filter(l =>
      !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.join_code?.toLowerCase().includes(search.toLowerCase()) ||
      l.organizer_name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === 'newest')  return new Date(b.created_at) - new Date(a.created_at)
      if (sort === 'players') return (counts[b.id] || 0) - (counts[a.id] || 0)
      if (sort === 'name')    return (a.name || '').localeCompare(b.name || '')
      return 0
    })

  const totalPlayers = Object.values(counts).reduce((s, n) => s + n, 0)

  return (
    <div style={{ minHeight:'100vh', background:'#060d16' }}>
      <nav style={{ padding:'18px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #0d1f0f' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => onNavigate('home')} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', fontSize:22, lineHeight:1 }}>←</button>
          <div>
            <div style={{ fontWeight:800, fontSize:17, color:'#f1f5f9' }}>All Leagues</div>
            <div style={{ fontSize:11, color:'#64748b' }}>Platform owner view</div>
          </div>
        </div>
        <button onClick={() => onNavigate('master')} style={{ background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:8, color:'#94a3b8', padding:'7px 14px', cursor:'pointer', fontWeight:700, fontSize:12, fontFamily:'inherit' }}>
          Power Rankings →
        </button>
      </nav>

      <div style={{ maxWidth:900, margin:'28px auto', padding:'0 24px 80px' }}>
        {/* Summary stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
          <div style={{ background:'linear-gradient(135deg,#0d2818,#0c1421)', border:'1px solid #16a34a', borderRadius:12, padding:'16px 20px' }}>
            <div style={{ fontSize:11, color:'#4ade80', fontWeight:700, letterSpacing:1 }}>TOTAL LEAGUES</div>
            <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:32, color:'#f1f5f9' }}>{leagues.length}</div>
          </div>
          <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'16px 20px' }}>
            <div style={{ fontSize:11, color:'#64748b', fontWeight:700, letterSpacing:1 }}>TOTAL PLAYERS</div>
            <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:32, color:'#f1f5f9' }}>{totalPlayers}</div>
          </div>
          <div style={{ background:'#0a0f18', border:'1px solid #111827', borderRadius:12, padding:'16px 20px' }}>
            <div style={{ fontSize:11, color:'#64748b', fontWeight:700, letterSpacing:1 }}>PAID LEAGUES</div>
            <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:32, color:'#f1f5f9' }}>{leagues.filter(l => l.collect_payment).length}</div>
          </div>
        </div>

        {/* Search + sort */}
        <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, code, or organizer…"
            style={{ flex:1, minWidth:200, background:'#0c1421', border:'1px solid #1a2332', borderRadius:9, padding:'9px 14px', color:'#f1f5f9', fontSize:13, outline:'none', fontFamily:'inherit' }}
          />
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ background:'#0c1421', border:'1px solid #1a2332', borderRadius:9, padding:'9px 12px', color:'#94a3b8', fontSize:13, outline:'none', cursor:'pointer' }}>
            <option value="newest">Newest first</option>
            <option value="players">Most players</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {loading && <p style={{ color:'#64748b', textAlign:'center', padding:'40px 0' }}>Loading leagues…</p>}
        {!loading && filtered.length === 0 && <p style={{ color:'#64748b', textAlign:'center', padding:'40px 0' }}>No leagues found.</p>}

        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {filtered.map(l => (
            <div key={l.id} style={{
              background:'#0a0f18', border:'1px solid #111827', borderRadius:10,
              padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:14, flexWrap:'wrap',
            }}>
              <div style={{ minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontWeight:800, fontSize:15, color:'#f1f5f9' }}>{l.name}</span>
                  <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:12, color:'#4ade80', background:'#0d2818', borderRadius:5, padding:'1px 8px' }}>{l.join_code}</span>
                  {l.collect_payment && <span style={{ fontSize:10, color:'#fbbf24', background:'#1f1a0a', borderRadius:5, padding:'1px 7px', fontWeight:700 }}>💵 ${l.entry_fee || '?'}</span>}
                  {!l.is_public && <span style={{ fontSize:10, color:'#f87171', background:'#1a0505', borderRadius:5, padding:'1px 7px', fontWeight:700 }}>PRIVATE</span>}
                </div>
                <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>
                  {l.organizer_name || 'No organizer'} · {counts[l.id] || 0} player{(counts[l.id]||0)!==1?'s':''}
                  {l.created_at && <> · created {new Date(l.created_at).toLocaleDateString()}</>}
                </div>
              </div>
              <button onClick={() => onNavigate('league', l.id)} style={{
                background:'#16a34a', color:'#fff', border:'none', borderRadius:8,
                padding:'8px 16px', cursor:'pointer', fontWeight:700, fontSize:13, whiteSpace:'nowrap', fontFamily:'inherit',
              }}>
                Open →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
