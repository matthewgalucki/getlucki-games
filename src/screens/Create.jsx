import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'
import { slugify, randCode, DEFAULT_ORDER, ranksToPrice, SEASON } from '../data.js'
import { Btn, Input, Toggle, Card } from '../components.jsx'
import RankingEditor from '../RankingEditor.jsx'

export default function Create({ onNavigate }) {
  const [form, setForm] = useState({
    name:'', organizer:'', password:'', confirmPassword:'',
    join_code:'', is_public:true, budget:120, picks_min:5, picks_max:7,
    collect_payment:false, entry_fee:'', payment_note:'',
  })
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [codeAvailable, setCodeAvailable] = useState(null) // null | true | false
  const [checkingCode, setCheckingCode]   = useState(false)

  // Power ranking order (best first). Starts from Getlucki defaults.
  const [order, setOrder]           = useState(DEFAULT_ORDER)
  const [showRankings, setShowRankings] = useState(false)
  const [rankingsEdited, setRankingsEdited] = useState(false)

  // Pull the current Getlucki default rankings from Supabase on mount.
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('default_rankings').select('abbr,rank').order('rank')
      if (data?.length === 32) setOrder(data.map(r => r.abbr))
    })()
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleRankingChange(newOrder) {
    setOrder(newOrder)
    setRankingsEdited(true)
  }

  function resetRankings() {
    setOrder(DEFAULT_ORDER)
    setRankingsEdited(false)
  }

  // Sanitize join code input — uppercase letters/numbers/hyphens only, max 12 chars
  function setCode(raw) {
    const clean = raw.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12)
    set('join_code', clean)
    setCodeAvailable(null)
  }

  async function checkCode() {
    const code = form.join_code.trim()
    if (!code) return
    setCheckingCode(true)
    const { data } = await supabase.from('leagues').select('id').eq('join_code', code).limit(1)
    setCodeAvailable(!data?.length)
    setCheckingCode(false)
  }

  async function create() {
    if (!form.name.trim())           return setError('League name is required.')
    if (!form.organizer.trim())      return setError('Your name is required.')
    if (!form.password.trim())       return setError('Password is required.')
    if (form.password !== form.confirmPassword) return setError("Passwords don't match.")
    if (form.picks_min > form.picks_max) return setError('Min picks cannot exceed max picks.')
    if (form.join_code && codeAvailable === false) return setError('That join code is already taken.')

    setLoading(true); setError('')
    const id        = slugify(form.name) + '-' + Date.now().toString(36)
    const join_code = form.join_code.trim() || randCode()

    // Freeze the current ranking into a price snapshot — locked for this league forever.
    const team_prices = ranksToPrice(order)

    const { error: err } = await supabase.from('leagues').insert({
      id, name:form.name.trim(), join_code,
      organizer_name:form.organizer.trim(),
      organizer_password:form.password,
      is_public:form.is_public,
      budget:form.budget,
      picks_min:form.picks_min,
      picks_max:form.picks_max,
      team_prices,
      collect_payment:form.collect_payment,
      entry_fee:form.collect_payment ? (parseFloat(form.entry_fee) || null) : null,
      payment_note:form.collect_payment ? (form.payment_note.trim() || null) : null,
      season:SEASON,
    })

    if (err) { setError('Failed to create league: ' + err.message); setLoading(false); return }
    onNavigate('league', id, { isOrganizer:true })
  }

  return (
    <div style={{ minHeight:'100vh', background:'#060d16' }}>
      <nav style={{ padding:'18px 28px', display:'flex', alignItems:'center', gap:14, borderBottom:'1px solid #0d1f0f' }}>
        <button onClick={() => onNavigate('home')} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:22, lineHeight:1 }}>←</button>
        <div style={{ fontWeight:800, fontSize:17, color:'#f1f5f9' }}>Create a BankRoll League</div>
      </nav>

      <div style={{ maxWidth:540, margin:'40px auto', padding:'0 24px 100px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:36 }}>
          <span style={{ fontSize:40 }}>💰</span>
          <div>
            <div style={{ fontWeight:900, fontSize:22, color:'#f1f5f9' }}>BankRoll</div>
            <div style={{ fontSize:13, color:'#94a3b8' }}>NFL season-long team pick pool</div>
          </div>
        </div>

        <Input label="LEAGUE NAME" value={form.name} placeholder='e.g. "Vietri Pick 6"' onChange={e => set('name', e.target.value)} />

        {/* Custom join code */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:1, marginBottom:6 }}>
            JOIN CODE <span style={{ color:'#64748b', fontWeight:400, letterSpacing:0 }}>(optional — leave blank for a random code)</span>
          </label>
          <div style={{ display:'flex', gap:8 }}>
            <input
              value={form.join_code}
              onChange={e => setCode(e.target.value)}
              placeholder='e.g. VIETRI or MIKES-BAR'
              maxLength={12}
              style={{
                flex:1, background:'#0c1421', border:`1px solid ${codeAvailable===true?'#16a34a':codeAvailable===false?'#ef4444':'#1e2d3d'}`,
                borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:15,
                outline:'none', fontFamily:'monospace', fontWeight:700, letterSpacing:2,
                textTransform:'uppercase',
              }}
            />
            <button
              onClick={checkCode}
              disabled={!form.join_code.trim() || checkingCode}
              style={{
                background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:10,
                padding:'11px 16px', color:'#64748b', cursor: form.join_code.trim() ? 'pointer' : 'not-allowed',
                fontWeight:700, fontSize:12, whiteSpace:'nowrap', fontFamily:'inherit',
              }}
            >
              {checkingCode ? '…' : 'Check'}
            </button>
          </div>
          {codeAvailable === true  && <p style={{ color:'#4ade80', fontSize:12, marginTop:6 }}>✓ That code is available!</p>}
          {codeAvailable === false && <p style={{ color:'#f87171', fontSize:12, marginTop:6 }}>✗ Already taken — try a different code.</p>}
          {!form.join_code && <p style={{ color:'#64748b', fontSize:12, marginTop:6 }}>A short, memorable code your players will type to join — e.g. VIETRI, BOBS-POOL, TAVERN22</p>}
        </div>

        <Input label="YOUR NAME (ORGANIZER)" value={form.organizer} placeholder="e.g. Ben Vietri" onChange={e => set('organizer', e.target.value)} />
        <Input label="ORGANIZER PASSWORD" type="password" value={form.password} placeholder="Only you need this to manage the league" onChange={e => set('password', e.target.value)} />
        <Input label="CONFIRM PASSWORD" type="password" value={form.confirmPassword} placeholder="Re-enter password" onChange={e => set('confirmPassword', e.target.value)} />

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:20 }}>
          {[
            { label:'BUDGET ($)', key:'budget', min:50, max:500 },
            { label:'MIN PICKS', key:'picks_min', min:1, max:10 },
            { label:'MAX PICKS', key:'picks_max', min:1, max:10 },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:1, marginBottom:6 }}>{f.label}</label>
              <input
                type="number" min={f.min} max={f.max} value={form[f.key]}
                onChange={e => set(f.key, parseInt(e.target.value) || f.min)}
                style={{ width:'100%', background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:15, outline:'none', boxSizing:'border-box' }}
              />
            </div>
          ))}
        </div>

        <Card style={{ marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center', gap:16 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#e2e8f0', marginBottom:3 }}>Public leaderboard</div>
            <div style={{ fontSize:12, color:'#94a3b8' }}>Anyone with the link can view standings</div>
          </div>
          <Toggle value={form.is_public} onChange={v => set('is_public', v)} />
        </Card>

        {/* Payment tracking */}
        <Card style={{ marginBottom:16, padding:0, overflow:'hidden' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:16, padding:'16px 20px' }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#e2e8f0', marginBottom:3 }}>Track entry payments</div>
              <div style={{ fontSize:12, color:'#94a3b8' }}>Mark who's paid — you collect the money yourself (Venmo, cash, etc.)</div>
            </div>
            <Toggle value={form.collect_payment} onChange={v => set('collect_payment', v)} />
          </div>
          {form.collect_payment && (
            <div style={{ padding:'0 20px 20px', borderTop:'1px solid #111827' }}>
              <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', gap:12, paddingTop:14 }}>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:1, marginBottom:6 }}>ENTRY FEE ($)</label>
                  <input type="number" min={0} value={form.entry_fee} placeholder="20"
                    onChange={e => set('entry_fee', e.target.value)}
                    style={{ width:'100%', background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:15, outline:'none', boxSizing:'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, color:'#94a3b8', letterSpacing:1, marginBottom:6 }}>HOW TO PAY (shown to players)</label>
                  <input value={form.payment_note} placeholder="e.g. Venmo @ben-vietri"
                    onChange={e => set('payment_note', e.target.value)}
                    style={{ width:'100%', background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:10, padding:'11px 14px', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                  />
                </div>
              </div>
              <p style={{ fontSize:11, color:'#64748b', marginTop:10 }}>
                Getlucki doesn't process payments — this just lets you track who has paid in the Admin tab.
              </p>
            </div>
          )}
        </Card>

        {/* Power rankings adjustment */}
        <Card style={{ marginBottom:24, padding:0, overflow:'hidden' }}>
          <button
            onClick={() => setShowRankings(v => !v)}
            style={{
              width:'100%', background:'transparent', border:'none', cursor:'pointer',
              padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center',
              textAlign:'left', fontFamily:'inherit',
            }}
          >
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#e2e8f0', marginBottom:3 }}>
                Team values {rankingsEdited
                  ? <span style={{ color:'#fbbf24', fontSize:12, fontWeight:600 }}>· customized</span>
                  : <span style={{ color:'#94a3b8', fontSize:12, fontWeight:400 }}>· using Getlucki defaults</span>}
              </div>
              <div style={{ fontSize:12, color:'#94a3b8' }}>
                Adjust if a team's outlook changed (injury, trade). Locks when you launch.
              </div>
            </div>
            <span style={{ color:'#94a3b8', fontSize:14, marginLeft:12 }}>{showRankings ? '▲' : '▼'}</span>
          </button>

          {showRankings && (
            <div style={{ padding:'0 20px 20px', borderTop:'1px solid #111827' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0 12px' }}>
                <p style={{ fontSize:12, color:'#64748b', margin:0, lineHeight:1.5, maxWidth:360 }}>
                  #1 is the most expensive ($32), #32 the cheapest ($1). Drag rows or use the arrows. All 32 values stay unique.
                </p>
                {rankingsEdited && (
                  <button onClick={resetRankings} style={{
                    background:'#0c1421', border:'1px solid #1e2d3d', borderRadius:8, color:'#64748b',
                    padding:'6px 12px', cursor:'pointer', fontSize:12, fontWeight:700, whiteSpace:'nowrap', fontFamily:'inherit',
                  }}>Reset to default</button>
                )}
              </div>
              <RankingEditor order={order} onChange={handleRankingChange} />
            </div>
          )}
        </Card>

        {error && <p style={{ color:'#f87171', fontSize:13, marginBottom:16 }}>{error}</p>}

        <Btn onClick={create} disabled={loading} size='lg' style={{ width:'100%', borderRadius:12 }}>
          {loading ? 'Creating…' : '🚀 Launch League'}
        </Btn>
      </div>
    </div>
  )
}
