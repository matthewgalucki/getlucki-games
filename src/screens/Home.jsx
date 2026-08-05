import { useState } from 'react'
import { supabase } from '../supabase.js'
import { SEASON } from '../data.js'
import { Btn, Input } from '../components.jsx'

export default function Home({ onNavigate }) {
  const [code, setCode]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function joinByCode() {
    const c = code.trim().toUpperCase()
    if (!c) return
    setLoading(true); setError('')
    const { data, error: err } = await supabase
      .from('leagues')
      .select('id')
      .eq('join_code', c)
      .limit(1)
    if (err || !data?.length) {
      setError('No league found with that code. Double-check and try again.')
    } else {
      onNavigate('league', data[0].id)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#060d16' }}>
      {/* NAV */}
      <nav style={{ padding:'18px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #0d1f0f' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:28 }}>🎲</span>
          <div>
            <div style={{ fontWeight:900, fontSize:20, color:'#f1f5f9', letterSpacing:'-0.5px' }}>Getlucki</div>
            <div style={{ fontSize:10, color:'#16a34a', fontWeight:700, letterSpacing:3, marginTop:-2 }}>GAMES</div>
          </div>
        </div>
        <Btn onClick={() => onNavigate('create')}>+ Create League</Btn>
      </nav>

      {/* HERO */}
      <div style={{ textAlign:'center', padding:'72px 24px 56px' }}>
        <div style={{
          display:'inline-block', background:'#0d2818', border:'1px solid #16a34a',
          borderRadius:99, padding:'4px 18px', fontSize:11, fontWeight:700,
          color:'#4ade80', letterSpacing:2, marginBottom:24,
        }}>SEASON {SEASON}</div>
        <h1 style={{
          fontSize:'clamp(38px,7vw,72px)', fontWeight:900, color:'#f1f5f9',
          lineHeight:1.05, letterSpacing:'-2px', marginBottom:20,
        }}>
          Run your league.<br />
          <span style={{ color:'#4ade80' }}>Own the season.</span>
        </h1>
        <p style={{ color:'#64748b', fontSize:17, maxWidth:520, margin:'0 auto 48px', lineHeight:1.65 }}>
          Season-long sports games for your friends, your office, or your bar. Pick a game below and start a league in minutes.
        </p>

        {/* JOIN BOX */}
        <div style={{ maxWidth:400, margin:'0 auto' }}>
          <div style={{ display:'flex', gap:8 }}>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER JOIN CODE"
              onKeyDown={e => e.key === 'Enter' && joinByCode()}
              maxLength={8}
              style={{
                flex:1, background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:12,
                padding:'14px 16px', color:'#f1f5f9', fontSize:18, outline:'none',
                fontFamily:'monospace', fontWeight:800, letterSpacing:4, textAlign:'center',
              }}
            />
            <Btn onClick={joinByCode} disabled={loading} size='lg' style={{ borderRadius:12, whiteSpace:'nowrap' }}>
              {loading ? '…' : 'Join →'}
            </Btn>
          </div>
          {error && <p style={{ color:'#f87171', fontSize:13, marginTop:10 }}>{error}</p>}
          <p style={{ color:'#64748b', fontSize:12, marginTop:12 }}>Got a code from your organizer? Enter it above.</p>
        </div>
      </div>

      {/* GAME CATALOG */}
      <div style={{ maxWidth:960, margin:'0 auto', padding:'0 24px 100px' }}>
        <div style={{ color:'#64748b', fontSize:11, fontWeight:700, letterSpacing:2, marginBottom:20 }}>GAMES</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>

          {/* BANKROLL — LIVE */}
          <div
            onClick={() => onNavigate('create')}
            style={{
              background:'linear-gradient(135deg,#0d2818 0%,#0c1421 100%)',
              border:'1px solid #16a34a', borderRadius:18, padding:26,
              cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(22,163,74,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
          >
            <div style={{ fontSize:40, marginBottom:14 }}>💰</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ fontWeight:900, fontSize:22, color:'#f1f5f9' }}>BankRoll</span>
              <span style={{ background:'#16a34a', color:'#fff', fontSize:10, fontWeight:800, borderRadius:99, padding:'2px 9px', letterSpacing:0.5 }}>LIVE</span>
            </div>
            <p style={{ color:'#4ade80', fontSize:13, fontWeight:700, margin:'0 0 8px' }}>
              ⚡ Set it and forget it — pick once, let it ride all season.
            </p>
            <p style={{ color:'#64748b', fontSize:13, lineHeight:1.6, margin:'0 0 18px' }}>
              Pick 6–7 NFL teams on a $120 budget before Week 1. No weekly picks, no upkeep — cheaper teams are sleepers, most total wins takes the season.
            </p>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['Pick once','No weekly upkeep','Live win sync'].map(tag => (
                <span key={tag} style={{ background:'#0f2a12', color:'#4ade80', fontSize:10, fontWeight:700, borderRadius:99, padding:'3px 10px' }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* COMING SOON */}
          {['Survivor Pool', 'Confidence Picks', 'Squares'].map(name => (
            <div key={name} style={{ background:'#080d14', border:'1px solid #111827', borderRadius:18, padding:26, opacity:0.45 }}>
              <div style={{ fontSize:40, marginBottom:14 }}>🔒</div>
              <div style={{ fontWeight:900, fontSize:22, color:'#94a3b8', marginBottom:8 }}>{name}</div>
              <p style={{ color:'#64748b', fontSize:13 }}>Coming soon to Getlucki Games</p>
            </div>
          ))}

          {/* SUGGEST A GAME */}
          <a
            href="mailto:matthew@galuckienterprises.com?subject=Game%20idea%20for%20Getlucki%20Games&body=Here's%20a%20game%20I'd%20love%20to%20see%3A%0A%0A"
            style={{
              display:'block', textDecoration:'none',
              background:'#0a0f18', border:'1px dashed #1e3a5f', borderRadius:18, padding:26,
              transition:'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#16a34a'; e.currentTarget.style.background='#0c1421' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#1e3a5f'; e.currentTarget.style.background='#0a0f18' }}
          >
            <div style={{ fontSize:40, marginBottom:14 }}>💡</div>
            <div style={{ fontWeight:900, fontSize:22, color:'#f1f5f9', marginBottom:8 }}>Have a game idea?</div>
            <p style={{ color:'#64748b', fontSize:13, lineHeight:1.6 }}>
              Got a pool or contest you'd love to run? Tell us — we're always building new games. <span style={{ color:'#4ade80', fontWeight:700 }}>Let us know →</span>
            </p>
          </a>
        </div>
      </div>
    </div>
  )
}
